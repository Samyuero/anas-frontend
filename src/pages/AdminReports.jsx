import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Package, Tag, Grid3X3, ShoppingBag, Image, Mail, Users, Settings, LogOut, Menu, FileText, Download, Printer, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import api from '../api/axios';

const COLORS = ['#334155','#3b82f6','#22c55e','#eab308','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

const AdminReports = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [reportType, setReportType] = useState('sales');
  const [from, setFrom] = useState(() => { const d = new Date(); d.setMonth(d.getMonth()-1); return d.toISOString().split('T')[0]; });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = (m) => setExpandedMenus(p => p.includes(m) ? p.filter(x=>x!==m) : [...p,m]);

  const handleLogoutClick = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); if(onLogout) onLogout(); navigate('/login'); };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/report?type=${reportType}&from=${from}&to=${to}`);
      if (res.data.success) setReport(res.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [reportType, from, to]);

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return alert('No data to export');
    const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const menuItems = [
    { id:'dashboard', icon:LayoutDashboard, label:'Dashboard', path:'/admin/dashboard' },
    { id:'products', icon:Package, label:'Products', hasSubmenu:true, submenu:[
      {id:'add-product',label:'Add Products',path:'/admin/products/add',icon:Plus},
      {id:'products-list',label:'Products',path:'/admin/products',icon:Package}
    ]},
    { id:'brand', icon:Tag, label:'Brand', hasSubmenu:true, submenu:[
      {id:'new-brand',label:'New Brand',path:'/admin/brand/new',icon:Plus},
      {id:'brands-list',label:'Brands',path:'/admin/brand',icon:Tag}
    ]},
    { id:'category', icon:Grid3X3, label:'Category', hasSubmenu:true, submenu:[
      {id:'new-category',label:'New Category',path:'/admin/category/new',icon:Plus},
      {id:'categories-list',label:'Categories',path:'/admin/category',icon:Grid3X3}
    ]},
    { id:'orders', icon:ShoppingBag, label:'Order', hasSubmenu:true, submenu:[
      {id:'orders-list',label:'Orders',path:'/admin/orders',icon:ShoppingBag}
    ]},
    { id:'reports', icon:FileText, label:'Reports', path:'/admin/reports' },
    { id:'slides', icon:Image, label:'Slides', path:'/admin/slides' },
    { id:'accounts', icon:Users, label:'Accounts', path:'/admin/accounts' },
  ];

  // Chart data
  const salesChartData = report?.data?.sales ? [
    { name:'Processing', value: report.data.sales.processingOrders, amount: report.data.sales.processingAmount },
    { name:'Delivered', value: report.data.sales.deliveredOrders, amount: report.data.sales.deliveredAmount },
    { name:'Cancelled', value: report.data.sales.cancelledOrders, amount: report.data.sales.cancelledAmount },
  ] : [];

  const inventoryChartData = report?.data?.inventory ? (() => {
    const cats = {};
    report.data.inventory.forEach(p => { cats[p.category] = (cats[p.category]||0) + p.quantity; });
    return Object.entries(cats).map(([name,value]) => ({name,value}));
  })() : [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen?'w-64':'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col h-full print:hidden`}>
        <div className="px-4 py-2">
          <Link to="/" className="flex items-center px-4 py-2 text-gray-600 hover:text-slate-800 text-sm font-medium">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>{sidebarOpen && 'MAIN HOME'}
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map(item => (
            <div key={item.id}>
              <div onClick={() => item.hasSubmenu ? toggleMenu(item.id) : navigate(item.path)}
                className={`flex items-center px-6 py-3 hover:bg-gray-50 cursor-pointer ${item.id==='reports'?'bg-gray-50 border-r-4 border-slate-800':''}`}>
                <item.icon size={20} className={item.id==='reports'?'text-slate-800':'text-gray-500'} />
                {sidebarOpen && <><span className={`ml-4 text-sm flex-1 ${item.id==='reports'?'text-slate-800 font-semibold':'text-gray-600'}`}>{item.label}</span>
                {item.hasSubmenu && (expandedMenus.includes(item.id)?<ChevronUp size={16} className="text-gray-400"/>:<ChevronDown size={16} className="text-gray-400"/>)}</>}
              </div>
              {item.hasSubmenu && expandedMenus.includes(item.id) && sidebarOpen && item.submenu && (
                <div className="bg-gray-50 py-2">{item.submenu.map(sub => (
                  <Link key={sub.id} to={sub.path} className="flex items-center px-10 py-2 text-sm text-gray-500 hover:text-slate-800">
                    <sub.icon size={16} className="mr-3"/>{sub.label}
                  </Link>
                ))}</div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogoutClick} className="flex items-center px-6 py-3 text-gray-600 hover:text-red-600 w-full">
            <LogOut size={20}/>{sidebarOpen && <span className="ml-4 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center">
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="mr-4 text-gray-600 hover:text-slate-800"><Menu size={24}/></button>
            <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
          </div>
        </header>

        <div className="p-6" id="report-content">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 print:hidden">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Report Type</label>
                <select value={reportType} onChange={e=>setReportType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-slate-500">
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="orders">Detailed Orders</option>
                  <option value="all">Complete Report</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-slate-500"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-slate-500"/>
              </div>
              <button onClick={handlePrint} className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Printer size={16}/> Print
              </button>
              {report?.data?.orders && (
                <button onClick={()=>exportCSV(report.data.orders,'sales_report')} className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download size={16}/> Export CSV
                </button>
              )}
              {report?.data?.inventory && (
                <button onClick={()=>exportCSV(report.data.inventory,'inventory_report')} className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download size={16}/> Export Inventory CSV
                </button>
              )}
            </div>
          </div>

          {/* Print Header */}
          <div className="hidden print:block mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">ANA'S Frozen Products</h1>
            <p className="text-sm text-gray-500">
              {reportType === 'sales' ? 'Sales' : reportType === 'inventory' ? 'Inventory' : reportType === 'orders' ? 'Orders' : 'Complete'} Report
            </p>
            <p className="text-xs text-gray-400">Period: {report?.dateRange?.from} — {report?.dateRange?.to} | Generated: {report?.generatedAt}</p>
          </div>

          {report && (
            <>
              {/* Report Meta */}
              <div className="bg-white rounded-lg shadow p-4 mb-6 print:shadow-none print:border print:border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Report: <strong className="text-slate-800">{reportType.charAt(0).toUpperCase()+reportType.slice(1)}</strong></span>
                  <span>Period: <strong>{report.dateRange?.from} — {report.dateRange?.to}</strong></span>
                  <span className="print:hidden">Generated: {report.generatedAt}</span>
                </div>
              </div>

              {/* SALES REPORT */}
              {report.data?.sales && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      {label:'Total Orders', val:report.data.sales.totalOrders, color:'bg-blue-50 text-blue-700'},
                      {label:'Total Revenue', val:`₱${report.data.sales.totalRevenue.toFixed(2)}`, color:'bg-green-50 text-green-700'},
                      {label:'Processing', val:report.data.sales.processingOrders, color:'bg-yellow-50 text-yellow-700'},
                      {label:'Delivered', val:report.data.sales.deliveredOrders, color:'bg-emerald-50 text-emerald-700'},
                    ].map((c,i) => (
                      <div key={i} className={`rounded-lg p-5 ${c.color} print:border print:border-gray-200`}>
                        <p className="text-xs font-medium opacity-70 mb-1">{c.label}</p>
                        <p className="text-2xl font-bold">{c.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:hidden">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-semibold text-slate-800 mb-4">Revenue by Status</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={salesChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                          <XAxis dataKey="name" tick={{fontSize:12}} />
                          <YAxis tick={{fontSize:12}} />
                          <Tooltip formatter={(v)=>`₱${v.toFixed(2)}`} />
                          <Bar dataKey="amount" fill="#334155" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-semibold text-slate-800 mb-4">Orders by Status</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={salesChartData.filter(d=>d.value>0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,value})=>`${name}: ${value}`}>
                            {salesChartData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                          </Pie>
                          <Tooltip/>
                          <Legend/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Orders Table */}
                  {report.data.orders && report.data.orders.length > 0 && (
                    <div className="bg-white rounded-lg shadow mb-6 print:shadow-none print:border">
                      <div className="px-6 py-3 bg-gray-50 rounded-t-lg border-b"><h3 className="text-sm font-semibold text-slate-800">Transaction History</h3></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-50 text-xs text-slate-600 uppercase">
                            <th className="px-4 py-3 text-left">Order #</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">Address</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-center">Items</th>
                            <th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-left">Date</th>
                          </tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {report.data.orders.map(o => (
                              <tr key={o.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{o.id}</td><td className="px-4 py-3">{o.name}</td><td className="px-4 py-3">{o.phone}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{o.address||'-'}</td>
                                <td className="px-4 py-3 text-right font-medium">₱{parseFloat(o.total).toFixed(2)}</td>
                                <td className="px-4 py-3 text-center">{o.items_count}</td>
                                <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs rounded font-medium ${o.status==='Delivered'?'bg-green-100 text-green-700':o.status==='Cancelled'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{o.status}</span></td>
                                <td className="px-4 py-3 text-xs">{o.date}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot><tr className="bg-gray-50 font-semibold">
                            <td colSpan="4" className="px-4 py-3">Total</td>
                            <td className="px-4 py-3 text-right">₱{report.data.orders.reduce((s,o)=>s+parseFloat(o.total),0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">{report.data.orders.reduce((s,o)=>s+(o.items_count||0),0)}</td>
                            <td colSpan="2"></td>
                          </tr></tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* INVENTORY REPORT */}
              {report.data?.inventory && (
                <>
                  {report.data.inventorySummary && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                      {[
                        {label:'Total Products', val:report.data.inventorySummary.totalProducts, color:'bg-blue-50 text-blue-700'},
                        {label:'Total Stock', val:report.data.inventorySummary.totalStock, color:'bg-slate-50 text-slate-700'},
                        {label:'Low Stock', val:report.data.inventorySummary.lowStock, color:'bg-yellow-50 text-yellow-700'},
                        {label:'Out of Stock', val:report.data.inventorySummary.outOfStock, color:'bg-red-50 text-red-700'},
                        {label:'Total Value', val:`₱${report.data.inventorySummary.totalValue.toFixed(2)}`, color:'bg-green-50 text-green-700'},
                      ].map((c,i) => (
                        <div key={i} className={`rounded-lg p-5 ${c.color} print:border print:border-gray-200`}>
                          <p className="text-xs font-medium opacity-70 mb-1">{c.label}</p>
                          <p className="text-2xl font-bold">{c.val}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inventory Chart */}
                  {inventoryChartData.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6 print:hidden">
                      <h3 className="text-sm font-semibold text-slate-800 mb-4">Stock by Category</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={inventoryChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                          <XAxis dataKey="name" tick={{fontSize:11}} angle={-20} textAnchor="end" height={60}/>
                          <YAxis tick={{fontSize:12}}/>
                          <Tooltip/>
                          <Bar dataKey="value" name="Stock Qty" fill="#3b82f6" radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Inventory Table */}
                  <div className="bg-white rounded-lg shadow mb-6 print:shadow-none print:border">
                    <div className="px-6 py-3 bg-gray-50 rounded-t-lg border-b"><h3 className="text-sm font-semibold text-slate-800">Product Inventory</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs text-slate-600 uppercase">
                          <th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-left">SKU</th><th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-left">Brand</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-100">
                          {report.data.inventory.map(p => (
                            <tr key={p.id} className={`hover:bg-gray-50 ${p.quantity<=0?'bg-red-50':p.quantity<=200?'bg-yellow-50':''}`}>
                              <td className="px-4 py-3 font-medium">{p.name}</td><td className="px-4 py-3 text-gray-500">{p.sku}</td>
                              <td className="px-4 py-3">{p.category}</td><td className="px-4 py-3">{p.brand}</td>
                              <td className="px-4 py-3 text-right">₱{parseFloat(p.regular_price).toFixed(2)}</td>
                              <td className="px-4 py-3 text-center font-bold">{p.quantity}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 text-xs rounded font-medium ${p.quantity<=0?'bg-red-100 text-red-700':p.quantity<=200?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>
                                  {p.quantity<=0?'Out of Stock':p.quantity<=200?'Low Stock':'In Stock'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* DETAILED ORDERS */}
              {report.data?.ordersDetailed && report.data.ordersDetailed.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Detailed Order Breakdown</h3>
                  {report.data.ordersDetailed.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow p-5 print:shadow-none print:border print:break-inside-avoid">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-800">Order #{order.id} — {order.customer}</h4>
                          <p className="text-xs text-gray-500">{order.date} | {order.phone} | {order.address}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded font-medium ${order.status==='Delivered'?'bg-green-100 text-green-700':order.status==='Cancelled'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                      </div>
                      <table className="w-full text-sm mb-2">
                        <thead><tr className="text-xs text-gray-500 border-b"><th className="py-1 text-left">Product</th><th className="py-1 text-center">Qty</th><th className="py-1 text-right">Price</th><th className="py-1 text-right">Total</th></tr></thead>
                        <tbody>{order.items.map((it,i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2">{it.product}</td><td className="py-2 text-center">{it.quantity}</td>
                            <td className="py-2 text-right">₱{parseFloat(it.price).toFixed(2)}</td><td className="py-2 text-right font-medium">₱{parseFloat(it.total).toFixed(2)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                      <div className="text-right font-bold text-slate-800">Order Total: ₱{parseFloat(order.total).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* No data */}
              {!report.data?.sales && !report.data?.inventory && !report.data?.ordersDetailed && (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-30"/>
                  <p>No data found for the selected period.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          /* Hide non-print elements */
          .print\\:hidden, nav, header { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border { border: 1px solid #d1d5db !important; }
          .print\\:break-inside-avoid { break-inside: avoid; }

          /* Make main content full width */
          body, html { margin: 0 !important; padding: 0 !important; background: white !important; }
          aside { display: none !important; }
          main { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          #report-content { padding: 12px !important; }

          /* Fix the flex container */
          .flex.h-screen { display: block !important; height: auto !important; background: white !important; }

          /* Tables: fit to page */
          table { width: 100% !important; font-size: 11px !important; border-collapse: collapse !important; }
          th, td { padding: 4px 6px !important; border: 1px solid #e5e7eb !important; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }

          /* Cards grid: full width */
          .grid { gap: 8px !important; }

          /* Summary cards */
          .rounded-lg { border-radius: 4px !important; page-break-inside: avoid; }

          /* Preserve colors */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }

          /* Page settings */
          @page { size: A4 portrait; margin: 10mm; }
        }
      `}</style>
    </div>
  );
};

export default AdminReports;

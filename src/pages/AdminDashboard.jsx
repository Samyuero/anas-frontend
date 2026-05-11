import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tag,
  Grid3X3,
  ShoppingBag,
  Image,
  Mail,
  Users,
  Settings,
  LogOut,
  Menu,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  TrendingUp,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { API_URL } from '../config';

const AdminDashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState(['products', 'brand', 'category']);
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    totalAmount: 0,
    deliveredAmount: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    pendingAmount: 0,
    cancelledAmount: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getToken = () => localStorage.getItem('token');

  const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // Fetch dashboard data from Laravel API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/admin/dashboard-stats`, { headers: headers() });
      const statsData = await statsRes.json();
      
      if (statsData.success) {
        setStats({
          totalOrders: statsData.data.totalOrders || 0,
          deliveredOrders: statsData.data.deliveredOrders || 0,
          totalAmount: statsData.data.totalAmount || 0,
          deliveredAmount: statsData.data.deliveredAmount || 0,
          pendingOrders: statsData.data.pendingOrders || 0,
          cancelledOrders: statsData.data.cancelledOrders || 0,
          pendingAmount: statsData.data.pendingAmount || 0,
          cancelledAmount: statsData.data.cancelledAmount || 0
        });
        setMonthlyData(statsData.data.monthlyData || []);
      }

      // Fetch low stock products
      const lowStockRes = await fetch(`${API_URL}/admin/low-stock`, { headers: headers() });
      const lowStockData = await lowStockRes.json();
      if (lowStockData.success) {
        setLowStockProducts(lowStockData.data);
      }

      // Fetch recent orders
      const ordersRes = await fetch(`${API_URL}/admin/orders`, { headers: headers() });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setRecentOrders(ordersData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check current path for active menu
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/products/add')) setActiveMenu('add-product');
    else if (path.includes('/admin/products')) setActiveMenu('products-list');
    else if (path.includes('/admin/brand/new')) setActiveMenu('new-brand');
    else if (path.includes('/admin/brand')) setActiveMenu('brands-list');
    else if (path.includes('/admin/category/new')) setActiveMenu('new-category');
    else if (path.includes('/admin/category')) setActiveMenu('categories-list');
    else if (path.includes('/admin/orders')) setActiveMenu('orders-list');
    else if (path.includes('/admin/dashboard')) setActiveMenu('dashboard');
    else if (path.includes('/admin/slides')) setActiveMenu('slides');
    else if (path.includes('/admin/accounts')) setActiveMenu('accounts');
  }, [location]);

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const menuItems = [
    { 
      id: 'dashboard',
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin/dashboard'
    },
    { 
      id: 'products',
      icon: Package, 
      label: 'Products', 
      hasSubmenu: true,
      submenu: [
        { id: 'add-product', label: 'Add Products', path: '/admin/products/add', icon: Plus },
        { id: 'products-list', label: 'Products', path: '/admin/products', icon: Package }
      ]
    },
    { 
      id: 'brand',
      icon: Tag, 
      label: 'Brand', 
      hasSubmenu: true,
      submenu: [
        { id: 'new-brand', label: 'New Brand', path: '/admin/brand/new', icon: Plus },
        { id: 'brands-list', label: 'Brands', path: '/admin/brand', icon: Tag }
      ]
    },
    { 
      id: 'category',
      icon: Grid3X3, 
      label: 'Category', 
      hasSubmenu: true,
      submenu: [
        { id: 'new-category', label: 'New Category', path: '/admin/category/new', icon: Plus },
        { id: 'categories-list', label: 'Categories', path: '/admin/category', icon: Grid3X3 }
      ]
    },
    { 
      id: 'orders',
      icon: ShoppingBag, 
      label: 'Order', 
      hasSubmenu: true,
      submenu: [
        { id: 'orders-list', label: 'Orders', path: '/admin/orders', icon: ShoppingBag }
      ]
    },
    { 
      id: 'slides',
      icon: Image, 
      label: 'Slides', 
      path: '/admin/slides'
    },
    { 
      id: 'reports',
      icon: FileText, 
      label: 'Reports', 
      path: '/admin/reports'
    },
    { 
      id: 'accounts',
      icon: Users, 
      label: 'Accounts', 
      path: '/admin/accounts'
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'bg-yellow-400 text-white';
      case 'Delivered': return 'bg-green-500 text-white';
      case 'Low Stock': return 'bg-yellow-300 text-black';
      case 'Cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  // Get month names for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Find data for specific month
  const getMonthData = (monthName) => {
    return monthlyData.find(m => m.MonthName === monthName) || {
      TotalAmount: 0,
      TotalOrderedAmount: 0,
      TotalDeliveredAmount: 0,
      TotalCancelledAmount: 0
    };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col h-full`}>
        

        {/* Main Home Link */}
        <div className="px-4 py-2">
          <Link to="/" className="flex items-center px-4 py-2 text-gray-600 hover:text-slate-800 text-sm font-medium">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
            {sidebarOpen && 'MAIN HOME'}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Main Menu Item */}
              <div
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleMenu(item.id);
                  } else {
                    navigate(item.path);
                    setActiveMenu(item.id);
                  }
                }}
                className={`flex items-center px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  activeMenu === item.id || (item.hasSubmenu && expandedMenus.includes(item.id)) 
                    ? 'bg-gray-50 border-r-4 border-slate-800' 
                    : ''
                }`}
              >
                <item.icon size={20} className={activeMenu === item.id ? 'text-slate-800' : 'text-gray-500'} />
                {sidebarOpen && (
                  <>
                    <span className={`ml-4 text-sm flex-1 ${
                      activeMenu === item.id ? 'text-slate-800 font-semibold' : 'text-gray-600'
                    }`}>
                      {item.label}
                    </span>
                    {item.hasSubmenu && (
                      expandedMenus.includes(item.id) 
                        ? <ChevronUp size={16} className="text-gray-400" />
                        : <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </>
                )}
              </div>

              {/* Submenu Items */}
              {item.hasSubmenu && expandedMenus.includes(item.id) && sidebarOpen && item.submenu && (
                <div className="bg-gray-50 py-2">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.id}
                      to={sub.path}
                      onClick={() => setActiveMenu(sub.id)}
                      className={`flex items-center px-10 py-2 text-sm transition-colors ${
                        activeMenu === sub.id 
                          ? 'text-slate-800 font-medium' 
                          : 'text-gray-500 hover:text-slate-800'
                      }`}
                    >
                      <sub.icon size={16} className="mr-3" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-red-600 w-full transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-4 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-gray-600 hover:text-slate-800"
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">System Admin</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Stats Column - 8 cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Total Orders</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.totalOrders}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-blue-600" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Delivered Orders</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.deliveredOrders}</h3>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-green-600" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                  <h3 className="text-3xl font-bold text-slate-800">₱{parseFloat(stats.totalAmount).toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">₱</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Delivered Orders Amount</p>
                  <h3 className="text-3xl font-bold text-slate-800">₱{parseFloat(stats.deliveredAmount).toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xl">₱</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Pending Orders</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.pendingOrders}</h3>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-yellow-600" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Cancelled Orders</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.cancelledOrders}</h3>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-red-600" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Pending Orders Amount</p>
                  <h3 className="text-3xl font-bold text-slate-800">₱{parseFloat(stats.pendingAmount).toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-xl">₱</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Cancelled Orders Amount</p>
                  <h3 className="text-3xl font-bold text-slate-800">₱{parseFloat(stats.cancelledAmount).toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xl">₱</span>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Monthly Revenue</h3>
              
              {/* Legend */}
              <div className="flex items-center space-x-4 mb-6 text-xs">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-1"></span>
                  <span className="text-gray-500">Total</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-200 rounded-full mr-1"></span>
                  <span className="text-gray-500">Pending</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                  <span className="text-gray-500">Delivered</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-1"></span>
                  <span className="text-gray-500">Cancelled</span>
                </div>
              </div>

              {/* Chart Area */}
              <div className="relative h-64 flex items-end pb-8 px-4">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none px-4">
                  <div className="border-t border-purple-100 w-full"></div>
                  <div className="border-t border-purple-100 w-full"></div>
                  <div className="border-t border-purple-100 w-full"></div>
                  <div className="border-t border-purple-100 w-full"></div>
                  <div className="border-t border-purple-100 w-full"></div>
                </div>

                {/* Month Columns with Bars */}
                <div className="flex justify-between w-full relative z-10 h-full items-end">
                  {months.map((month, idx) => {
                    const monthData = getMonthData(month);
                    const hasData = monthData.TotalAmount > 0;
                    
                    return (
                      <div key={idx} className="flex-1 flex justify-center items-end h-full">
                        {hasData && (
                          <div className="flex items-end space-x-0.5">
                            <div 
                              className="w-4 bg-purple-600 rounded-t-sm" 
                              style={{height: `${Math.min(monthData.TotalAmount / 10, 140)}px`}}
                            ></div>
                            <div 
                              className="w-4 bg-yellow-400 rounded-t-sm" 
                              style={{height: `${Math.min(monthData.TotalOrderedAmount / 10, 120)}px`}}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between mt-2 text-xs text-gray-400 px-2">
                {months.map((month, idx) => (
                  <span key={idx} className="flex-1 text-center">{month}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Products Table */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="bg-gray-200 px-6 py-3 rounded-t-lg">
              <h3 className="text-sm font-semibold text-slate-800">Low Stock Products (&lt;200 units)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">{product.currentStock}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-4 py-1 text-xs font-medium rounded ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No low stock products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-slate-800">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Order No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Subtotal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Order Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Delivered on</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{order.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{order.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{order.phone}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800">₱{parseFloat(order.subtotal).toFixed(2)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.orderDate}<br/>
                          <span className="text-xs text-gray-400">{order.time}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 text-center">{order.totalItems}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.deliveredOn || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title={`View order #${order.id}`}
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
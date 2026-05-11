import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import api from '../api/axios';

const UserOrdersPage = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try { const res = await api.get('/orders'); setOrders(res.data.data || res.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const getStatusBadge = (status) => {
    if (status === 'delivered') return <span className="px-3 py-1 text-xs font-medium rounded bg-green-500 text-white">Delivered</span>;
    if (status === 'cancelled') return <span className="px-3 py-1 text-xs font-medium rounded bg-red-500 text-white">Cancelled</span>;
    return <span className="px-3 py-1 text-xs font-medium rounded bg-yellow-400 text-black">Processing</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 uppercase tracking-wide border-b pb-3">Orders</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-48">
            <nav className="space-y-2">
              <Link to="/account" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">Dashboard</Link>
              <Link to="/account/orders" className="block px-4 py-2 text-sm font-medium text-slate-900 bg-gray-100 rounded">Orders</Link>
              <Link to="/account/details" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">Account Details</Link>
              <button onClick={() => { onLogout && onLogout(); }} className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded">Logout</button>
            </nav>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-700 text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Order No.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Name</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Phone</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Order Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Items</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Delivered On</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-center">{order.id}</td>
                      <td className="px-4 py-4 text-sm text-center">{order.name}</td>
                      <td className="px-4 py-4 text-sm text-center">{order.phone}</td>
                      <td className="px-4 py-4 text-sm text-center">₱{parseFloat(order.subTotal || order.subtotal || 0).toFixed(2)}</td>
                      <td className="px-4 py-4 text-center">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-4 text-sm text-center">{order.created_at || order.orderDate}</td>
                      <td className="px-4 py-4 text-sm text-center">{order.order_items?.length || order.orderItems?.length || order.totalItems || 0}</td>
                      <td className="px-4 py-4 text-sm text-center">{order.delivery_date || order.deliveredOn || '-'}</td>
                      <td className="px-4 py-4 text-center">
                        <Link to={`/account/orders/${order.id}`} className="text-blue-600 hover:text-blue-800"><Eye size={16} /></Link>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;

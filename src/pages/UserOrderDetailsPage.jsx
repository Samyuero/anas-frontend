import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';

import { BASE_URL } from '../config';
const UserOrderDetailsPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrderDetails(); }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      const data = res.data.data || res.data;
      setOrder(data.order || data);
      setOrderItems(data.orderItems || data.order_items || []);
      setTransaction(data.transaction || null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure? Do you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${id}/cancel`, { order_id: id });
      fetchOrderDetails();
    } catch (e) { console.error(e); }
  };

  const getStatusBadge = (status) => {
    if (status === 'delivered') return <span className="px-3 py-1 text-xs font-medium rounded bg-green-500 text-white">Delivered</span>;
    if (status === 'cancelled') return <span className="px-3 py-1 text-xs font-medium rounded bg-red-500 text-white">Cancelled</span>;
    return <span className="px-3 py-1 text-xs font-medium rounded bg-yellow-400 text-black">Processing</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 uppercase tracking-wide border-b pb-3">Order Details</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-48">
            <nav className="space-y-2">
              <Link to="/account" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">Dashboard</Link>
              <Link to="/account/orders" className="block px-4 py-2 text-sm font-medium text-slate-900 bg-gray-100 rounded">Orders</Link>
              <Link to="/account/details" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">Account Details</Link>
              <button onClick={() => onLogout && onLogout()} className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded">Logout</button>
            </nav>
          </div>
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-semibold">Order Details</h5>
                <button onClick={() => navigate('/account/orders')} className="px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600">Back</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <tbody>
                    <tr className="border-b"><th className="px-4 py-2 bg-gray-700 text-white text-left">Order No.</th><td className="px-4 py-2">{order.id}</td><th className="px-4 py-2 bg-gray-700 text-white text-left">Mobile No.</th><td className="px-4 py-2">{order.phone}</td><th className="px-4 py-2 bg-gray-700 text-white text-left">Address</th><td className="px-4 py-2">{order.city}, {order.barangay}, {order.sitio}</td></tr>
                    <tr className="border-b"><th className="px-4 py-2 bg-gray-700 text-white text-left">Order Date</th><td className="px-4 py-2">{order.created_at}</td><th className="px-4 py-2 bg-gray-700 text-white text-left">Delivery Date</th><td className="px-4 py-2">{order.delivery_date || '-'}</td><th className="px-4 py-2 bg-gray-700 text-white text-left">Cancelled Date</th><td className="px-4 py-2">{order.cancelled_date || '-'}</td></tr>
                    <tr><th className="px-4 py-2 bg-gray-700 text-white text-left">Order Status</th><td colSpan="5" className="px-4 py-2">{getStatusBadge(order.status)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h5 className="text-lg font-semibold mb-4">Ordered Items</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-700 text-white">
                    <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-center">Price</th><th className="px-4 py-3 text-center">Quantity</th><th className="px-4 py-3 text-center">SKU</th><th className="px-4 py-3 text-center">Category</th><th className="px-4 py-3 text-center">Brand</th><th className="px-4 py-3 text-center">Options</th><th className="px-4 py-3 text-center">Return Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderItems.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={`${BASE_URL}/uploads/products/${item.product?.image}`} alt="" className="w-12 h-12 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} /><span className="font-medium">{item.product?.name || item.name}</span></div></td>
                        <td className="px-4 py-3 text-center">₱{parseFloat(item.price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-center">{item.product?.SKU || '-'}</td>
                        <td className="px-4 py-3 text-center">{item.product?.category?.categoryName || '-'}</td>
                        <td className="px-4 py-3 text-center">{item.product?.brand?.brandName || '-'}</td>
                        <td className="px-4 py-3 text-center">{item.options || '-'}</td>
                        <td className="px-4 py-3 text-center">{item.rstatus === 0 ? 'No' : 'Yes'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h5 className="text-lg font-semibold mb-3">Shipping Address</h5>
              <p className="text-sm text-gray-700">{order.name}</p>
              <p className="text-sm text-gray-700">{order.city}, {order.barangay}, {order.sitio}</p>
              <p className="text-sm text-gray-700">{order.landmark}</p>
              <p className="text-sm text-gray-700 mt-2">Mobile: {order.phone}</p>
            </div>

            {/* Transactions */}
            {transaction && (
              <div className="bg-white rounded-lg shadow p-6">
                <h5 className="text-lg font-semibold mb-3">Transactions</h5>
                <table className="w-full text-sm border border-gray-200">
                  <tbody>
                    <tr><th className="px-4 py-2 bg-gray-100 text-left">Subtotal</th><td className="px-4 py-2">₱{parseFloat(order.subTotal || order.subtotal || 0).toFixed(2)}</td><th className="px-4 py-2 bg-gray-100 text-left">Payment Mode</th><td className="px-4 py-2">{transaction.payment_method}</td><th className="px-4 py-2 bg-gray-100 text-left">Status</th><td className="px-4 py-2">{transaction.status === 'paid' ? <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Paid</span> : <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Pending</span>}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Cancel Order */}
            {order.status === 'processing' && (
              <div className="bg-white rounded-lg shadow p-6 text-right">
                <button onClick={handleCancelOrder} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cancel Order</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetailsPage;

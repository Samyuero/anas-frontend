import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

import { API_URL, BASE_URL } from '../config';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => { fetchOrderDetails(); }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (result.success) {
        const data = result.data;
        setOrder(data.order || data);
        setOrderItems(data.items || data.orderItems || data.order_items || []);
        setTransaction(data.transaction || null);
        setOrderStatus((data.order || data).status || 'processing');
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault(); setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: orderStatus, order_id: id })
      });
      const result = await res.json();
      if (result.success) { alert('Order status updated!'); fetchOrderDetails(); }
      else alert('Error: ' + (result.message || 'Failed to update'));
    } catch (e) { console.error(e); alert('Error updating status'); } finally { setUpdating(false); }
  };

  const getStatusBadge = (status) => {
    if (status === 'delivered') return <span className="px-3 py-1 text-xs font-medium rounded bg-green-500 text-white">Delivered</span>;
    if (status === 'cancelled') return <span className="px-3 py-1 text-xs font-medium rounded bg-red-500 text-white">Cancelled</span>;
    return <span className="px-3 py-1 text-xs font-medium rounded bg-yellow-400 text-black">Processing</span>;
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Order Details</h1>
        <div className="text-sm text-gray-500">
          <Link to="/admin/dashboard" className="hover:text-slate-800">Dashboard</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-800">Order Details</span>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-lg font-semibold">Order Details</h5>
          <button onClick={() => navigate('/admin/orders')} className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm">Back</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <tbody>
              <tr className="border-b">
                <th className="px-4 py-2 bg-gray-700 text-white text-left whitespace-nowrap">Order No.</th>
                <td className="px-4 py-2 border-r">{order.id}</td>
                <th className="px-4 py-2 bg-gray-700 text-white text-left whitespace-nowrap">Mobile No.</th>
                <td className="px-4 py-2 border-r">{order.phone}</td>
                <th className="px-4 py-2 bg-gray-700 text-white text-left whitespace-nowrap">Address</th>
                <td className="px-4 py-2">{order.city}, {order.barangay}, {order.sitio}</td>
              </tr>
              <tr className="border-b">
                <th className="px-4 py-2 bg-gray-700 text-white text-left whitespace-nowrap">Order Date</th>
                <td className="px-4 py-2 border-r">{order.created_at}</td>
                <th className="px-4 py-2 bg-gray-700 text-white text-left whitespace-nowrap">Delivery Date</th>
                <td className="px-4 py-2 border-r">{order.delivery_date || '-'}</td>
                <th className="px-4 py-2 bg-gray-700 text-white text-left whitespace-nowrap">Cancelled Date</th>
                <td className="px-4 py-2">{order.cancelled_date || '-'}</td>
              </tr>
              <tr>
                <th className="px-4 py-2 bg-gray-700 text-white text-left whitespace-nowrap">Order Status</th>
                <td colSpan="5" className="px-4 py-2">{getStatusBadge(order.status)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Ordered Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h5 className="text-lg font-semibold mb-4">Ordered Items</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-center">Price</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-center">SKU</th>
                <th className="px-4 py-3 text-center">Category</th>
                <th className="px-4 py-3 text-center">Brand</th>
                <th className="px-4 py-3 text-center">Options</th>
                <th className="px-4 py-3 text-center">Return Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orderItems.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={`${BASE_URL}/uploads/products/${item.product?.image}`} alt="" className="w-12 h-12 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      <span className="font-medium">{item.product?.name || item.name}</span>
                    </div>
                  </td>
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
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h5 className="text-lg font-semibold mb-3">Shipping Address</h5>
        <p className="text-sm text-gray-700">{order.name}</p>
        <p className="text-sm text-gray-700">{order.city}, {order.barangay}, {order.sitio}</p>
        <p className="text-sm text-gray-700">{order.landmark}</p>
        <p className="text-sm text-gray-700 mt-2">Mobile: {order.phone}</p>
      </div>

      {/* Transactions */}
      {transaction && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h5 className="text-lg font-semibold mb-3">Transactions</h5>
          <table className="w-full text-sm border border-gray-200">
            <tbody>
              <tr>
                <th className="px-4 py-2 bg-gray-100 text-left">Subtotal</th>
                <td className="px-4 py-2 border-r">₱{parseFloat(order.subTotal || order.subtotal || 0).toFixed(2)}</td>
                <th className="px-4 py-2 bg-gray-100 text-left">Payment Mode</th>
                <td className="px-4 py-2 border-r">{transaction.payment_method}</td>
                <th className="px-4 py-2 bg-gray-100 text-left">Status</th>
                <td className="px-4 py-2">{transaction.status === 'paid' ? <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Paid</span> : <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Pending</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Update Order Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h5 className="text-lg font-semibold mb-3">Update Order Status</h5>
        <form onSubmit={handleUpdateStatus} className="flex items-center gap-4">
          <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit" disabled={updating} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderDetails;

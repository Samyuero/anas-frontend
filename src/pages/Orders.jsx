import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';

import { API_URL } from '../config';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/orders`, { headers: headers() });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'bg-yellow-400 text-white';
      case 'Delivered': return 'bg-green-500 text-white';
      case 'Cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm)
  );

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <p className="text-sm text-gray-500">Dashboard / Orders</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Order No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Subtotal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Order Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-slate-800">{order.id}</td>
                  <td className="px-4 py-4 text-sm text-slate-800">{order.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{order.phone}</td>
                  <td className="px-4 py-4 text-sm text-slate-800">₱{parseFloat(order.subtotal).toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{order.orderDate}</td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Order;
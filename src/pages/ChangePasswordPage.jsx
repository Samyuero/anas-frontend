import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ChangePasswordPage = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({ old_password: '', new_password: '', new_password_confirmation: '' });
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({}); setSuccess('');
    try {
      const response = await api.put('/user/change-password', formData);
      if (response.data.success) { setSuccess('Password changed successfully!'); setFormData({ old_password: '', new_password: '', new_password_confirmation: '' }); }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else if (err.response?.data?.message) setErrors({ old_password: [err.response.data.message] });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 uppercase tracking-wide border-b pb-3">Change Password</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-48">
            <nav className="space-y-2">
              <Link to="/account" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">Dashboard</Link>
              <Link to="/account/orders" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">Orders</Link>
              <Link to="/account/details" className="block px-4 py-2 text-sm font-medium text-slate-900 bg-gray-100 rounded">Account Details</Link>
              <button onClick={() => onLogout && onLogout()} className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded">Logout</button>
            </nav>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6 max-w-lg">
              {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{success}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Old Password</label>
                  <input type="password" value={formData.old_password} onChange={(e) => setFormData({...formData, old_password: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
                  {errors.old_password && <span className="text-red-500 text-xs">{errors.old_password[0]}</span>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">New Password</label>
                  <input type="password" value={formData.new_password} onChange={(e) => setFormData({...formData, new_password: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
                  {errors.new_password && <span className="text-red-500 text-xs">{errors.new_password[0]}</span>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                  <input type="password" value={formData.new_password_confirmation} onChange={(e) => setFormData({...formData, new_password_confirmation: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
                </div>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

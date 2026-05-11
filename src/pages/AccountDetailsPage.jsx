import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AccountDetailsPage = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', sitio: '', barangay: '', city: '', landmark: '' });
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch fresh user data from API on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/user');
        const u = res.data;
        setFormData({
          name: u.name || '',
          mobile: u.mobile || '',
          email: u.email || '',
          sitio: u.sitio || '',
          barangay: u.barangay || '',
          city: u.city || '',
          landmark: u.landmark || '',
        });
      } catch (e) {
        if (user) setFormData({
          name: user.name || '',
          mobile: user.mobile || '',
          email: user.email || '',
          sitio: user.sitio || '',
          barangay: user.barangay || '',
          city: user.city || '',
          landmark: user.landmark || '',
        });
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({}); setSuccess('');
    try {
      const response = await api.put('/user/update', formData);
      if (response.data.success) {
        setSuccess('Account details updated successfully!');
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 uppercase tracking-wide border-b pb-3">Account Details</h1>
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
            <div className="bg-white rounded-lg shadow p-6">
              {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Full Name" />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name[0]}</span>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Mobile Number</label>
                    <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={11} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/[^0-9]/g, '')})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Mobile Number" />
                    {errors.mobile && <span className="text-red-500 text-xs">{errors.mobile[0]}</span>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Email Address" />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email[0]}</span>}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-700 mt-6 mb-3">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Sitio</label>
                    <input type="text" value={formData.sitio} onChange={(e) => setFormData({...formData, sitio: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Sitio" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Barangay</label>
                    <input type="text" value={formData.barangay} onChange={(e) => setFormData({...formData, barangay: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Barangay" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">City or Municipality</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="City or Municipality" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-1">Landmark</label>
                  <input type="text" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Landmark" />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button type="submit" disabled={loading} className="px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <Link to="/account/change-password" className="px-6 py-3 border border-slate-900 text-slate-900 text-sm font-medium rounded hover:bg-slate-50 transition-colors">
                    Change Password
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Trash2, Shield, User, Search } from 'lucide-react';
import api from '../api/axios';

import { API_URL } from '../config';

const AdminAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', mobile: '', password: '', password_confirmation: '', utype: 'ADM'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => localStorage.getItem('token');
  const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/accounts`, { headers: headers() });
      const data = await res.json();
      if (data.success) setUsers(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/accounts`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Admin account created successfully!');
        setFormData({ firstName: '', lastName: '', email: '', mobile: '', password: '', password_confirmation: '', utype: 'ADM' });
        setShowForm(false);
        fetchUsers();
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (e) {
      setError('Error creating account');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (user) => {
    const roleLabel = user.utype === 'ADM' ? 'Admin' : 'User';
    if (!window.confirm(`Are you sure you want to delete this ${roleLabel} account: ${user.name}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/accounts/${user.id}`, {
        method: 'DELETE',
        headers: headers()
      });
      const data = await res.json();
      if (data.success) fetchUsers();
      else alert(data.message || 'Cannot delete account');
    } catch (e) { console.error(e); }
  };

  // Filter users by search
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count admins and users
  const adminCount = users.filter(u => u.utype === 'ADM').length;
  const userCount = users.filter(u => u.utype === 'USR').length;

  if (loading) return <div className="p-6">Loading accounts...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Accounts</h1>
          <p className="text-sm text-gray-500"><Link to="/admin/dashboard" className="hover:text-slate-800">Dashboard</Link> / Accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus size={18} className="mr-2" /> Add Admin
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-2">
          <Shield size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-800">{adminCount} Admin{adminCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <User size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{userCount} User{userCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Admin Account</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Name</label>
                <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mobile</label>
                <input type="tel" required inputMode="numeric" pattern="[0-9]*" maxLength={11} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/[^0-9]/g, '')})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                <input type="password" required value={formData.password_confirmation} onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Admin'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? filtered.map((u, i) => (
              <tr key={u.id} className={`hover:bg-gray-50 ${u.utype === 'ADM' ? 'bg-blue-50/30' : ''}`}>
                <td className="px-6 py-4 text-sm text-slate-800">{i + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    {u.utype === 'ADM' ? <Shield size={14} className="text-blue-600" /> : <User size={14} className="text-gray-400" />}
                    {u.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.mobile || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${u.utype === 'ADM' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {u.utype === 'ADM' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(u)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No accounts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccounts;

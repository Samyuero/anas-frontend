import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Search } from 'lucide-react';

import { API_URL } from '../config';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const getToken = () => localStorage.getItem('token');

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/contacts`, { headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' } });
      const result = await res.json();
      if (result.success) setContacts(result.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' } });
      const result = await res.json();
      if (result.success) setContacts(contacts.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = contacts.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        <div className="text-sm text-gray-500">
          <Link to="/admin/dashboard" className="hover:text-slate-800">Dashboard</Link><span className="mx-2">›</span><span className="text-slate-800">All Messages</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Mobile No.</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Message</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{contact.id}</td>
                  <td className="px-4 py-3">{contact.name}</td>
                  <td className="px-4 py-3">{contact.phone}</td>
                  <td className="px-4 py-3">{contact.email}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{contact.comment}</td>
                  <td className="px-4 py-3">{contact.created_at}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(contact.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No messages found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;

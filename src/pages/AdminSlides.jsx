import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { API_URL, BASE_URL } from '../config';

const AdminSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const getToken = () => localStorage.getItem('token');

  useEffect(() => { fetchSlides(); }, []);

  const fetchSlides = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/slides`, { headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' } });
      const result = await res.json();
      if (result.success) setSlides(result.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? Do you want to delete this Slide?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/slides/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' } });
      const result = await res.json();
      if (result.success) setSlides(slides.filter(s => s.id !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = slides.filter(s => s.title?.toLowerCase().includes(search.toLowerCase()) || s.tagline?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Slides</h1>
        <div className="text-sm text-gray-500">
          <Link to="/admin/dashboard" className="hover:text-slate-800">Dashboard</Link><span className="mx-2">›</span><span className="text-slate-800">Slides</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64" />
          </div>
          <Link to="/admin/slides/add" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Plus size={16} />Add new</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Image</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tagline</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Subtitle</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Link</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((slide) => (
                <tr key={slide.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{slide.id}</td>
                  <td className="px-4 py-3"><img src={`${BASE_URL}/uploads/slides/${slide.image}`} alt="" className="w-16 h-12 object-cover rounded" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"; }} /></td>
                  <td className="px-4 py-3">{slide.tagline}</td>
                  <td className="px-4 py-3">{slide.title}</td>
                  <td className="px-4 py-3">{slide.subTitle}</td>
                  <td className="px-4 py-3">{slide.link}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/slides/edit/${slide.id}`} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></Link>
                      <button onClick={() => handleDelete(slide.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No slides found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSlides;

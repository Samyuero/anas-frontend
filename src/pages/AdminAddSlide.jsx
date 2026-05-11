import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

import { API_URL } from '../config';

const AdminAddSlide = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ tagline: '', title: '', subTitle: '', link: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const getToken = () => localStorage.getItem('token');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = new FormData();
      data.append('tagline', formData.tagline);
      data.append('title', formData.title);
      data.append('subTitle', formData.subTitle);
      data.append('link', formData.link);
      if (image) data.append('image', image);
      const res = await fetch(`${API_URL}/admin/slides`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: data
      });
      const result = await res.json();
      if (result.success) navigate('/admin/slides');
      else setError(result.message || 'Failed to save slide');
    } catch (err) { setError('Network error. Please try again.'); } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add Slide</h1>
        <div className="text-sm text-gray-500">
          <Link to="/admin/dashboard" className="hover:text-slate-800">Dashboard</Link> &gt; <Link to="/admin/slides" className="hover:text-slate-800">Slides</Link> &gt; <span className="text-slate-800">New Slide</span>
        </div>
      </div>
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Tagline <span className="text-red-500">*</span></label>
          <input type="text" value={formData.tagline} onChange={(e) => setFormData({...formData, tagline: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" placeholder="Tagline" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Title <span className="text-red-500">*</span></label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" placeholder="Title" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Subtitle <span className="text-red-500">*</span></label>
          <input type="text" value={formData.subTitle} onChange={(e) => setFormData({...formData, subTitle: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" placeholder="Subtitle" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Link <span className="text-red-500">*</span></label>
          <input type="text" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" placeholder="Link URL" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Image <span className="text-red-500">*</span></label>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="slide-image" />
            <label htmlFor="slide-image" className="cursor-pointer block">
              {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-contain" /> : (
                <div className="flex flex-col items-center"><Upload size={40} className="text-blue-600 mb-2" /><p className="text-gray-500 text-sm">Drop your image here or <span className="text-blue-600">click to browse</span></p></div>
              )}
            </label>
          </div>
        </div>
        <button type="submit" disabled={loading} className="px-12 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  );
};

export default AdminAddSlide;

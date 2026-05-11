import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

import { API_URL, BASE_URL } from '../config';

const EditBrand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ brandName: '', brandSlug: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const getToken = () => localStorage.getItem('token');

  useEffect(() => { fetchBrand(); }, [id]);

  const fetchBrand = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/brands/${id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const result = await res.json();
      if (result.success) {
        const b = result.data;
        setFormData({ brandName: b.brandName || '', brandSlug: b.brandSlug || '' });
        if (b.image) setImagePreview(`${BASE_URL}/uploads/brands/${b.image}`);
      }
    } catch (e) { console.error(e); } finally { setFetching(false); }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData({ ...formData, brandName: name, brandSlug: slug });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = new FormData();
      data.append('brandName', formData.brandName);
      data.append('brandSlug', formData.brandSlug);
      if (image) data.append('image', image);
      const response = await fetch(`${API_URL}/admin/brands/${id}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: data
      });
      const result = await response.json();
      if (result.success) navigate('/admin/brand');
      else setError(result.message || 'Failed to update brand');
    } catch (err) { setError('Network error. Please try again.'); } finally { setLoading(false); }
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Edit Brand</h1>
        <div className="text-sm text-gray-500">Dashboard &gt; Brands &gt; <span className="text-slate-800">Edit Brand</span></div>
      </div>
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div><label className="block text-sm font-semibold text-slate-800">Brand Name <span className="text-red-500">*</span></label></div>
            <div><label className="block text-sm font-semibold text-slate-800">Brand Slug <span className="text-red-500">*</span></label></div>
            <div className="pt-8"><label className="block text-sm font-semibold text-slate-800">Upload Images</label></div>
          </div>
          <div className="space-y-4">
            <div><input type="text" value={formData.brandName} onChange={handleNameChange} placeholder="Brand name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" /></div>
            <div><input type="text" value={formData.brandSlug} onChange={(e) => setFormData({...formData, brandSlug: e.target.value})} placeholder="Brand Slug" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" /></div>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-white">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="brand-image-edit" />
              <label htmlFor="brand-image-edit" className="cursor-pointer block">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-contain" />
                ) : (
                  <div className="flex flex-col items-center"><Upload size={40} className="text-blue-600 mb-2" /><p className="text-gray-500 text-sm">Drop your images here or select <span className="text-blue-600">click to browse</span></p></div>
                )}
              </label>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-start">
          <button type="submit" disabled={loading} className="px-12 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium">{loading ? 'Updating...' : 'Update'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditBrand;

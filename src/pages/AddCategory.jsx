import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft } from 'lucide-react';

import { API_URL } from '../config';

const AddCategory = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    categoryName: '',
    categorySlug: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('token');

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    setFormData({
      ...formData,
      categoryName: name,
      categorySlug: slug
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('categoryName', formData.categoryName);
      data.append('categorySlug', formData.categorySlug);
      if (image) {
        data.append('image', image);
      }

      const response = await fetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        navigate('/admin/category');
      } else {
        setError(result.message || 'Failed to save category');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-slate-800">Category Information</h1>
        </div>
        <div className="text-sm text-gray-500">
          Dashboard &gt; Categories &gt; <span className="text-slate-800">New Category</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Labels */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Category Name <span className="text-red-500">*</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Category Slug <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="pt-8">
              <label className="block text-sm font-semibold text-slate-800">
                Upload Image
              </label>
            </div>
          </div>

          {/* Right Column - Inputs */}
          <div className="space-y-4">
            {/* Category Name */}
            <div>
              <input 
                type="text"
                value={formData.categoryName}
                onChange={handleNameChange}
                placeholder="Category name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Category Slug */}
            <div>
              <input 
                type="text"
                value={formData.categorySlug}
                onChange={(e) => setFormData({...formData, categorySlug: e.target.value})}
                placeholder="Category Slug"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Image Upload */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-white">
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="category-image"
              />
              <label htmlFor="category-image" className="cursor-pointer block">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="mx-auto h-32 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={40} className="text-blue-600 mb-2" />
                    <p className="text-gray-500 text-sm">
                      Drop your images here or select <span className="text-blue-600">click to browse</span>
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-start">
          <button 
            type="submit"
            disabled={loading}
            className="px-12 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Upload, X } from 'lucide-react';

import { API_URL } from '../config';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    regular_price: '',
    sale_price: '',
    SKU: '',
    stock_status: 'inStock',
    featured: '0',
    quantity: '',
    category_id: '',
    brand_id: ''
  });
  const [image, setImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // Fetch categories and brands
  useEffect(() => {
    fetchCategoriesAndBrands();
  }, []);

  const fetchCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch(`${API_URL}/admin/categories`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }),
        fetch(`${API_URL}/admin/brands`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        })
      ]);

      const catData = await catRes.json();
      const brandData = await brandRes.json();

      if (catData.success) setCategories(catData.data);
      if (brandData.success) setBrands(brandData.data);
    } catch (error) {
      console.error('Error fetching categories/brands:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
      };

      // Auto-generate slug from name
      if (name === 'name') {
        newData.slug = value.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }

      return newData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryImages(prev => [...prev, ...files]);
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Append main image (required)
      if (image) {
        data.append('image', image);
      }

      // Append gallery images (optional)
      galleryImages.forEach((file) => {
        data.append('images[]', file);
      });

      const res = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
          // NOTE: Do NOT set 'Content-Type' here - fetch handles it automatically for FormData
        },
        body: data
      });

      const result = await res.json();

      if (result.success) {
        alert('Product created successfully!');
        navigate('/admin/products');
      } else {
        if (result.errors) {
          setErrors(result.errors);
          alert('Validation failed. Check the form fields.');
        } else {
          alert('Error: ' + (result.message || 'Failed to create product'));
        }
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add Product</h1>
        <div className="text-sm text-gray-500">
          <Link to="/admin/dashboard" className="hover:text-slate-800">Dashboard</Link>
          <span className="mx-2">›</span>
          <Link to="/admin/products" className="hover:text-slate-800">Products</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-800">Add product</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Product Name */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Product name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          {/* Slug */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="Auto-generated from name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug[0]}</p>}
          </div>

          {/* Category & Brand */}
          <div className="bg-white rounded-lg shadow p-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Choose category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.brand_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Choose brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.brandName}</option>
                ))}
              </select>
              {errors.brand_id && <p className="text-red-500 text-xs mt-1">{errors.brand_id[0]}</p>}
            </div>
          </div>

          {/* Short Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              rows="4"
              placeholder="Short Description"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.short_description ? 'border-red-500' : 'border-gray-300'}`}
            ></textarea>
            {errors.short_description && <p className="text-red-500 text-xs mt-1">{errors.short_description[0]}</p>}
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder="Description"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            ></textarea>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upload Main Image */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Upload Main Image <span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-blue-50 transition-colors cursor-pointer relative ${errors.image ? 'border-red-500' : 'border-blue-300'}`}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-contain" />
                  <p className="text-sm text-gray-500 mt-2">{image.name}</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                  <p className="text-gray-500 text-sm">
                    Drop your image here or <span className="text-blue-500">click to browse</span>
                  </p>
                </>
              )}
            </div>
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image[0]}</p>}
          </div>

          {/* Upload Gallery Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Upload Gallery Images
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:bg-blue-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={handleGalleryChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto h-12 w-12 text-blue-500 mb-2" />
              <p className="text-gray-500 text-sm">
                Drop images here or <span className="text-blue-500">click to browse</span>
              </p>
            </div>
            {galleryImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {galleryImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Gallery ${index}`}
                      className="h-16 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price & SKU */}
          <div className="bg-white rounded-lg shadow p-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Regular Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="regular_price"
                value={formData.regular_price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.regular_price ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.regular_price && <p className="text-red-500 text-xs mt-1">{errors.regular_price[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Sale Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.sale_price ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.sale_price && <p className="text-red-500 text-xs mt-1">{errors.sale_price[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="SKU"
                value={formData.SKU}
                onChange={handleChange}
                placeholder="Enter SKU"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.SKU ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.SKU && <p className="text-red-500 text-xs mt-1">{errors.SKU[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Stock <span className="text-red-500">*</span>
              </label>
              <select
                name="stock_status"
                value={formData.stock_status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Featured <span className="text-red-500">*</span>
              </label>
              <select
                name="featured"
                value={formData.featured}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>

          {/* Add Product Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Creating...' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
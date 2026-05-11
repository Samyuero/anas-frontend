import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

import { API_URL, BASE_URL } from '../config';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const getToken = () => localStorage.getItem('token');

  const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/products?page=${currentPage}`, {
        headers: headers()
      });
      const data = await res.json();

      if (data.success) {
        setProducts(data.data.data || []);
        setLastPage(data.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: headers()
      });
      const data = await res.json();

      if (data.success) {
        alert('Product deleted successfully!');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return '/placeholder-product.png';
    return `${BASE_URL}/uploads/products/${imageName}`;
  };

  // Helper to check if product is in stock (handles both cases)
  const isInStock = (stockStatus) => {
    if (!stockStatus) return false;
    return stockStatus.toLowerCase().includes('in');
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Products</h1>
        <div className="text-sm text-gray-500">
          <Link to="/admin/dashboard" className="hover:text-slate-800">Dashboard</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-800">All Products</span>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search here..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:border-blue-500"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <Link 
          to="/admin/products/add"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add new
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Retail Price:</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">WholeSale Price:</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Featured</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={getImageUrl(product.image)} 
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover mr-3"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.png';
                          }}
                        />
                        <span className="text-sm font-medium text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800">
                      ₱{parseFloat(product.regular_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800">
                      ₱{parseFloat(product.sale_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{product.SKU}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.category?.categoryName || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.brand?.brandName || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        isInStock(product.stock_status)
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isInStock(product.stock_status) ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 text-center">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/admin/products/edit/${product.id}`}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    No products found. Click "Add new" to add products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span>Showing {products.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, products.length)} of {products.length} results</span>
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page 
                  ? 'bg-blue-600 text-white' 
                  : 'border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
            disabled={currentPage === lastPage}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="text-center mt-8 text-sm text-gray-400">
        Copyright © 2026
      </div>
    </div>
  );
};

export default Products;
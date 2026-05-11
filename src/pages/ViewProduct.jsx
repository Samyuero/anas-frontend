import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Star } from 'lucide-react';

import { API_URL, BASE_URL } from '../config';

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });

      const result = await res.json();
      if (result.success) {
        setProduct(result.data);
      } else {
        alert('Product not found');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });

      const result = await res.json();
      if (result.success) {
        alert('Product deleted successfully!');
        navigate('/admin/products');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!product) {
    return <div className="p-6">Product not found</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Product Details</h1>
        <div className="text-sm text-gray-500">
          <Link to="/admin/dashboard" className="hover:text-slate-800">Dashboard</Link>
          <span className="mx-2">›</span>
          <Link to="/admin/products" className="hover:text-slate-800">Products</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-800">{product.name}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/products')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold">{product.name}</h2>
          </div>
          <div className="flex gap-2">
            <Link 
              to={`/admin/products/edit/${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={18} />
              Edit
            </Link>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div>
            <img 
              src={`${BASE_URL}/uploads/products/${product.image}`} 
              alt={product.name}
              className="w-full h-64 object-contain rounded-lg border"
              onError={(e) => { e.target.src = '/placeholder-image.png'; }}
            />
            {product.images && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images.split(',').map((img, index) => (
                  <img 
                    key={index}
                    src={`${BASE_URL}/uploads/products/${img}`}
                    alt={`Gallery ${index}`}
                    className="h-20 w-full object-cover rounded border"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">SKU</label>
                <p className="font-semibold">{product.SKU}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Slug</label>
                <p className="font-semibold">{product.slug}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Category</label>
                <p className="font-semibold">{product.category?.categoryName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Brand</label>
                <p className="font-semibold">{product.brand?.brandName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Regular Price</label>
                <p className="font-semibold">₱{product.regular_price}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Sale Price</label>
                <p className="font-semibold">₱{product.sale_price}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Quantity</label>
                <p className="font-semibold">{product.quantity}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Stock Status</label>
                <p className={`font-semibold ${(product.stock_status || '').toLowerCase().includes('in') ? 'text-green-600' : 'text-red-600'}`}>
                  {(product.stock_status || '').toLowerCase().includes('in') ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Featured</label>
                <p className="font-semibold">{product.featured ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Short Description</label>
              <p className="mt-1 text-gray-700">{product.short_description}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Description</label>
              <p className="mt-1 text-gray-700">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Customer Reviews</h3>
            {product.reviews && product.reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(product.average_rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-800">
                  {product.average_rating || 0} / 5
                </span>
                <span className="text-sm text-gray-500">
                  ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review, index) => (
                <div key={review.id || index} className="bg-gray-50 rounded-lg p-4 flex gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {review.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm text-slate-800">{review.name}</span>
                        <span className="text-xs text-gray-400">{review.email}</span>
                      </div>
                      <span className="text-xs text-gray-400">{review.created_at}</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{review.review}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4">No reviews yet for this product.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
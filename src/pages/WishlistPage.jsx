import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer';

import { BASE_URL } from '../config';
const WishlistPage = ({ refreshCartCount }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      if (response.data.success) {
        const data = response.data.data;
        const itemsArray = Array.isArray(data) ? data : Object.values(data || {});
        setItems(itemsArray);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setItems([]);
    }
    finally { setLoading(false); }
  };

  const moveToCart = async (id) => {
    try {
      await api.post(`/wishlist/move-to-cart/${id}`);
      fetchWishlist();
      if (refreshCartCount) refreshCartCount();
    } catch (e) { console.error(e); }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/wishlist/remove/${id}`);
      fetchWishlist();
    } catch (e) { console.error(e); }
  };

  const clearWishlist = async () => {
    try {
      await api.delete('/wishlist/clear');
      setItems([]);
    } catch (e) { console.error(e); }
  };

  const getImageSrc = (item) => {
    const img = item.image;
    if (!img) return 'https://via.placeholder.com/120x120/cccccc/666666?text=No+Image';
    if (img.startsWith('http')) return img;
    return `${BASE_URL}/uploads/products/${img}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-center uppercase tracking-wide">Wishlist</h2>
        {items.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Product</th>
                  <th className="py-3"></th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Price</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Action</th>
                  <th className="py-3"></th>
                </tr></thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-4">
                        <Link to={`/product/${item.product_id}`}>
                          <img src={getImageSrc(item)} alt={item.name} className="w-20 h-20 object-cover rounded hover:opacity-80 transition-opacity" onError={(e) => { e.target.src = 'https://via.placeholder.com/120'; }} />
                        </Link>
                      </td>
                      <td className="py-4">
                        <Link to={`/product/${item.product_id}`} className="text-sm font-medium text-slate-900 hover:underline">{item.name}</Link>
                      </td>
                      <td className="py-4"><span className="text-sm text-slate-900">₱{parseFloat(item.price).toFixed(2)}</span></td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          (item.stock_status || '').toLowerCase().includes('in') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(item.stock_status || '').toLowerCase().includes('in') ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4">
                        <button onClick={() => moveToCart(item.id)} className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800 transition-colors">
                          <ShoppingCart className="w-3 h-3" /> Move to Cart
                        </button>
                      </td>
                      <td className="py-4">
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <button onClick={clearWishlist} className="px-6 py-2 border border-gray-300 text-sm font-medium text-gray-600 rounded hover:bg-gray-50 uppercase">CLEAR WISH LIST</button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No items in your Wishlist</p>
            <Link to="/shop" className="inline-block px-6 py-2 bg-slate-900 text-white text-sm rounded hover:bg-slate-800">Shop Now</Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;

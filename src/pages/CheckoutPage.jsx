import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Footer from '../components/Footer';

const CheckoutPage = ({ refreshCartCount }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', sitio: '', barangay: '', city: '', landmark: '' });
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileLoaded, setProfileLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        if (res.data.success) {
          const data = res.data.data;
          const itemsArray = Array.isArray(data) ? data : Object.values(data || {});
          setCartItems(itemsArray);
        }
      } catch (e) { console.error(e); }
    };
    fetchCart();

    // Fetch user profile from API to auto-fill all fields
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/user');
        const u = res.data;
        setFormData({
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || '',
          phone: u.mobile || '',
          sitio: u.sitio || '',
          barangay: u.barangay || '',
          city: u.city || '',
          landmark: u.landmark || '',
        });
        setProfileLoaded(true);
      } catch (e) {
        console.error('Could not fetch user profile:', e);
        // Fallback to localStorage
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
            phone: user.mobile || '',
          }));
        }
        setProfileLoaded(true);
      }
    };
    fetchUserProfile();
  }, []);

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * (item.qty || item.quantity || 1)), 0)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try {
      const response = await api.post('/orders', formData);
      if (response.data.success) {
        if (refreshCartCount) refreshCartCount();
        navigate('/order-confirmation');
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else if (err.response?.data?.message) {
        setErrors({ general: [err.response.data.message] });
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-center uppercase tracking-wide">Checkout</h2>
        {/* Checkout Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-center">
            <div className="flex items-center gap-3 opacity-40">
              <span className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">01</span>
              <div><p className="text-sm font-medium text-gray-500">Shopping Bag</p><p className="text-xs text-gray-400">Manage Your Items List</p></div>
            </div>
            <div className="w-12 h-px bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">02</span>
              <div><p className="text-sm font-medium text-slate-900">Shipping and Checkout</p><p className="text-xs text-gray-400">Checkout Your Items List</p></div>
            </div>
            <div className="w-12 h-px bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-3 opacity-40">
              <span className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">03</span>
              <div><p className="text-sm font-medium text-gray-500">Confirmation</p><p className="text-xs text-gray-400">Review And Submit Your Order</p></div>
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {errors.general[0]}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Shipping Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
                {errors.name && <span className="text-red-500 text-xs">{errors.name[0]}</span>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone *</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
                {errors.phone && <span className="text-red-500 text-xs">{errors.phone[0]}</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sitio</label>
                <input type="text" value={formData.sitio} onChange={(e) => setFormData({...formData, sitio: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Barangay</label>
                <input type="text" value={formData.barangay} onChange={(e) => setFormData({...formData, barangay: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">City or Municipality</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Landmark</label>
              <input type="text" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" />
            </div>
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500">Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500">Shipping</span><span>Free</span></div>
                <div className="flex justify-between font-semibold text-slate-900 pt-1"><span>Total</span><span>₱{subtotal.toFixed(2)}</span></div>
              </div>
              <button type="submit" disabled={loading} className="block w-full text-center px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 disabled:opacity-50 uppercase tracking-wide">
                {loading ? 'Placing Order...' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;

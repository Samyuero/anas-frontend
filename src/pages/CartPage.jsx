import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer';

import { BASE_URL } from '../config';
const CartPage = ({ refreshCartCount }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      if (response.data.success) {
        const data = response.data.data;
        // Convert object to array if needed
        const itemsArray = Array.isArray(data) ? data : Object.values(data || {});
        setItems(itemsArray);
        setSubtotal(parseFloat(response.data.subtotal || 0));
        setTotal(parseFloat(response.data.total || 0));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setItems([]);
    } finally { setLoading(false); }
  };

  const updateQuantity = async (id, newQty) => {
    try {
      await api.put(`/cart/update-quantity/${id}`, { quantity: newQty });
      fetchCart();
      if (refreshCartCount) refreshCartCount();
    } catch (e) {
      console.error(e);
      if (e.response?.data?.message) alert(e.response.data.message);
    }
  };

  const removeItem = async (id) => {
    try { await api.delete(`/cart/remove/${id}`); fetchCart(); if (refreshCartCount) refreshCartCount(); } catch (e) { console.error(e); }
  };

  const clearCart = async () => {
    try { await api.delete('/cart/clear'); setItems([]); setSubtotal(0); setTotal(0); if (refreshCartCount) refreshCartCount(); } catch (e) { console.error(e); }
  };

  const getImageSrc = (item) => {
    if (item.image) {
      if (item.image.startsWith('http')) return item.image;
      return `${BASE_URL}/uploads/products/${item.image}`;
    }
    if (item.product?.image) {
      if (item.product.image.startsWith('http')) return item.product.image;
      return `${BASE_URL}/uploads/products/${item.product.image}`;
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='11' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-center uppercase tracking-wide">Cart</h2>
        {/* Checkout Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-center">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">01</span>
              <div><p className="text-sm font-medium text-slate-900">Shopping Bag</p><p className="text-xs text-gray-400">Manage Your Items List</p></div>
            </div>
            <div className="w-12 h-px bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-3 opacity-40">
              <span className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">02</span>
              <div><p className="text-sm font-medium text-gray-500">Shipping and Checkout</p><p className="text-xs text-gray-400">Checkout Your Items List</p></div>
            </div>
            <div className="w-12 h-px bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-3 opacity-40">
              <span className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">03</span>
              <div><p className="text-sm font-medium text-gray-500">Confirmation</p><p className="text-xs text-gray-400">Review And Submit Your Order</p></div>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Product</th>
                    <th className="py-3"></th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Price</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="py-3"></th>
                  </tr></thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-4">
                          <img src={getImageSrc(item)} alt={item.name} className="w-20 h-20 object-cover rounded" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='11' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"; }} />
                        </td>
                        <td className="py-4"><h4 className="text-sm font-medium text-slate-900">{item.name}</h4></td>
                        <td className="py-4"><span className="text-sm text-slate-900">₱{parseFloat(item.price).toFixed(2)}</span></td>
                        <td className="py-4">
                          <div className="flex items-center border border-gray-300 rounded w-fit">
                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.qty - 1))} className="px-2 py-1 text-gray-600 hover:text-slate-900"><Minus className="w-3 h-3" /></button>
                            <span className="px-3 py-1 text-sm text-center min-w-[2rem]">{item.qty}</span>
                            <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="px-2 py-1 text-gray-600 hover:text-slate-900"><Plus className="w-3 h-3" /></button>
                          </div>
                        </td>
                        <td className="py-4"><span className="text-sm font-medium text-slate-900">₱{parseFloat(item.subtotal || (item.price * item.qty)).toFixed(2)}</span></td>
                        <td className="py-4"><button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <button onClick={clearCart} className="px-6 py-2 border border-gray-300 text-sm font-medium text-gray-600 rounded hover:bg-gray-50 uppercase">CLEAR CART</button>
              </div>
            </div>
            <div className="w-full lg:w-80">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Cart Totals</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500">Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500">Shipping</span><span>Free</span></div>
                  <div className="flex justify-between font-semibold text-slate-900 pt-1"><span>Total</span><span>₱{(total || subtotal).toFixed(2)}</span></div>
                </div>
                <Link to="/checkout" className="block w-full text-center mt-6 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 uppercase tracking-wide">PROCEED TO CHECKOUT</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No items found in your cart.</p>
            <Link to="/shop" className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Shop Now</Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const OrderConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-center uppercase tracking-wide">Order Confirmation</h2>
        {/* Checkout Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-center">
            <div className="flex items-center gap-3 opacity-40">
              <span className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">01</span>
              <div><p className="text-sm font-medium text-gray-500">Shopping Bag</p><p className="text-xs text-gray-400">Manage Your Items List</p></div>
            </div>
            <div className="w-12 h-px bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-3 opacity-40">
              <span className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">02</span>
              <div><p className="text-sm font-medium text-gray-500">Shipping and Checkout</p><p className="text-xs text-gray-400">Checkout Your Items List</p></div>
            </div>
            <div className="w-12 h-px bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">03</span>
              <div><p className="text-sm font-medium text-slate-900">Confirmation</p><p className="text-xs text-gray-400">Review And Submit Your Order</p></div>
            </div>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-3">Your order is completed!</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Thank you for your order. Your order has been placed and is being processed. You will receive an email confirmation shortly.</p>
          <Link to="/shop" className="inline-block px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 uppercase tracking-wide">Continue Shopping</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;

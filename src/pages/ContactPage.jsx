import React, { useState } from 'react';
import api from '../api/axios';
import Footer from '../components/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', comment: '' });
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrors({}); setSuccess('');
    try {
      const response = await api.post('/contact/store', formData);
      if (response.data.success) { setSuccess('Your message has been sent successfully!'); setFormData({ name: '', phone: '', email: '', comment: '' }); }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else setSuccess('');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2 uppercase tracking-wide">CONTACT US</h2>
        <hr className="mb-8 border-gray-200" />
        <div>
          {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{success}</div>}
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Get In Touch</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Name *" />
              {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name[0]}</span>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone *</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Phone *" />
              {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone[0]}</span>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email address *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Email address *" />
              {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email[0]}</span>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Your Message</label>
              <textarea value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} required rows="8" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 text-sm" placeholder="Your Message"></textarea>
              {errors.comment && <span className="text-red-500 text-xs mt-1">{errors.comment[0]}</span>}
            </div>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 disabled:opacity-50">{loading ? 'Sending...' : 'Submit'}</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;

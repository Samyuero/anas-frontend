import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Registerpage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Mobile validation
    if (!formData.mobile || formData.mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call with mobile included
      const response = await api.post('/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onLogin(user);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err.response?.data || err);
      
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light tracking-widest text-slate-900 uppercase mb-2">
            Register
          </h2>
        </div>

        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-xl shadow-slate-900/5 rounded-2xl border border-white/50 sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="relative group">
                <label className={`absolute left-10 transition-all duration-200 pointer-events-none z-10 ${
                  focusedField === 'firstName' || formData.firstName 
                    ? '-top-2 text-xs text-slate-600 bg-white px-2' 
                    : 'top-3.5 text-sm text-gray-400'
                }`}>
                  First Name
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <User className={`h-4 w-4 transition-colors duration-200 ${
                    focusedField === 'firstName' ? 'text-slate-900' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-sm bg-gray-50/50 focus:bg-white"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              {/* Last Name */}
              <div className="relative group">
                <label className={`absolute left-3 transition-all duration-200 pointer-events-none z-10 ${
                  focusedField === 'lastName' || formData.lastName 
                    ? '-top-2 text-xs text-slate-600 bg-white px-2' 
                    : 'top-3.5 text-sm text-gray-400'
                }`}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-3.5 border border-gray-200 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-sm bg-gray-50/50 focus:bg-white"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <label className={`absolute left-12 transition-all duration-200 pointer-events-none z-10 ${
                focusedField === 'email' || formData.email 
                  ? '-top-2 text-xs text-slate-600 bg-white px-2' 
                  : 'top-3.5 text-sm text-gray-400'
              }`}>
                Email
              </label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Mail className={`h-5 w-5 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-slate-900' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="email"
                required
                className="appearance-none block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-sm bg-gray-50/50 focus:bg-white"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Mobile Number */}
            <div className="relative group">
              <label className={`absolute left-12 transition-all duration-200 pointer-events-none z-10 ${
                focusedField === 'mobile' || formData.mobile 
                  ? '-top-2 text-xs text-slate-600 bg-white px-2' 
                  : 'top-3.5 text-sm text-gray-400'
              }`}>
                Mobile Number
              </label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Phone className={`h-5 w-5 transition-colors duration-200 ${
                  focusedField === 'mobile' ? 'text-slate-900' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="tel"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                className="appearance-none block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-sm bg-gray-50/50 focus:bg-white"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/[^0-9]/g, '')})}
                onFocus={() => setFocusedField('mobile')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <label className={`absolute left-12 transition-all duration-200 pointer-events-none z-10 ${
                focusedField === 'password' || formData.password 
                  ? '-top-2 text-xs text-slate-600 bg-white px-2' 
                  : 'top-3.5 text-sm text-gray-400'
              }`}>
                Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Lock className={`h-5 w-5 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-slate-900' : 'text-gray-400'
                }`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-sm bg-gray-50/50 focus:bg-white"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-slate-900 transition-colors z-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <label className={`absolute left-12 transition-all duration-200 pointer-events-none z-10 ${
                focusedField === 'confirmPassword' || formData.confirmPassword 
                  ? '-top-2 text-xs text-slate-600 bg-white px-2' 
                  : 'top-3.5 text-sm text-gray-400'
              }`}>
                Confirm Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Lock className={`h-5 w-5 transition-colors duration-200 ${
                  focusedField === 'confirmPassword' ? 'text-slate-900' : 'text-gray-400'
                }`} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                className="appearance-none block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-sm bg-gray-50/50 focus:bg-white"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-slate-900 transition-colors z-10"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Privacy Policy Text */}
            <p className="text-xs text-gray-500 leading-relaxed">
              Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our{' '}
              <Link to="/privacy" className="text-slate-900 hover:underline">privacy policy</Link>.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-slate-900/20 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 tracking-widest uppercase"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Register'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Have an account?{' '}
              <Link to="/login" className="font-medium text-slate-900 hover:text-slate-700 transition-colors inline-flex items-center gap-1 group">
                Login to your Account
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Registerpage;
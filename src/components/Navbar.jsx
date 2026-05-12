import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import api from '../api/axios';
import { BASE_URL } from '../config';

const Navbar = ({ user, onLogout, cartCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.utype === 'ADM' || user?.is_admin === true;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    if (searchOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [searchOpen]);

  // Debounced search
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    try {
      setSearchLoading(true);
      const res = await api.get(`/products?search=${encodeURIComponent(query.trim())}`);
      const items = res.data?.data?.data || res.data?.data || res.data || [];
      setSearchResults(Array.isArray(items) ? items.slice(0, 6) : []);
    } catch (e) {
      console.error('Search error:', e);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleProductClick = (product) => {
    const link = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
    closeSearch();
    navigate(link);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getProductImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${BASE_URL}/uploads/products/${img}`;
  };

  const getPrice = (p) => {
    const sale = parseFloat(p.sale_price);
    const regular = parseFloat(p.regular_price);
    return sale > 0 ? sale : regular;
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div>
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">ANA'S</span>
                <span className="text-xs text-gray-500 tracking-widest uppercase">Frozen Products</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`text-sm font-medium tracking-wide uppercase transition-colors ${isActive('/') ? 'text-slate-900' : 'text-gray-500 hover:text-slate-900'}`}>
                Home
              </Link>
              <Link to="/shop" className={`text-sm font-medium tracking-wide uppercase transition-colors ${isActive('/shop') ? 'text-slate-900' : 'text-gray-500 hover:text-slate-900'}`}>
                Shop
              </Link>
              <Link to="/cart" className={`text-sm font-medium tracking-wide uppercase transition-colors ${isActive('/cart') ? 'text-slate-900' : 'text-gray-500 hover:text-slate-900'}`}>
                Cart
              </Link>

            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center space-x-5">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-gray-600 hover:text-slate-900 transition-colors"
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  {isAdmin ? (
                    <Link to="/admin/dashboard" className="text-sm font-medium text-slate-900 hover:text-gray-700">
                      System Admin
                    </Link>
                  ) : (
                    <Link to="/account" className="text-sm text-gray-600 hover:text-slate-900 font-medium">
                      {user?.name || user?.email}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`transition-colors ${isActive('/login') || isActive('/register') ? 'text-slate-900' : 'text-gray-600 hover:text-slate-900'}`}
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              <Link to="/wishlist" className="text-gray-600 hover:text-slate-900 transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="text-gray-600 hover:text-slate-900 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-gray-600 hover:text-slate-900"
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
              <button
                className="text-gray-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-3 text-sm font-medium text-gray-700 hover:text-slate-900 border-b border-gray-50">
                HOME
              </Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-3 text-sm font-medium text-gray-700 hover:text-slate-900 border-b border-gray-50">
                SHOP
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-3 text-sm font-medium text-gray-700 hover:text-slate-900 border-b border-gray-50">
                CART {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-3 text-sm font-medium text-gray-700 hover:text-slate-900 border-b border-gray-50">
                WISHLIST
              </Link>


              {user && isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left py-3 text-sm font-medium text-slate-900 bg-gray-100 mt-2 rounded"
                >
                  System Admin
                </Link>
              )}

              {user && !isAdmin && (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left py-3 text-sm font-medium text-slate-900 bg-gray-50 mt-2 rounded"
                >
                  MY ACCOUNT
                </Link>
              )}

              {user ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="block w-full text-left py-3 text-sm font-medium text-red-600 bg-red-50 mt-2 rounded"
                >
                  LOGOUT
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left py-3 text-sm font-medium text-slate-900 bg-gray-50 mt-2 rounded"
                >
                  LOGIN / REGISTER
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ===== SEARCH OVERLAY (appears below navbar, on top of page) ===== */}
      {searchOpen && (
        <div className="fixed inset-0 z-40" style={{ top: '80px' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSearch}
          />

          {/* Search Panel */}
          <div className="relative z-10 bg-white border-b border-gray-200 shadow-lg">
            <div className="max-w-3xl mx-auto px-6 py-6">
              <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-gray-900 mb-4">What are you looking for?</h3>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products"
                  className="w-full pr-10 pb-2 text-sm text-gray-700 border-b border-gray-300 focus:border-gray-900 outline-none transition-colors bg-transparent placeholder-gray-400"
                />
                <Search className="absolute right-0 top-0 text-gray-400 w-4 h-4" />
              </div>

              {/* Search Results */}
              {(searchLoading || searchResults.length > 0 || (searchQuery.length > 0 && !searchLoading && searchResults.length === 0)) && (
                <div className="mt-4 max-h-72 overflow-y-auto">
                  {searchLoading && (
                    <div className="flex items-center py-4">
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                      <span className="ml-2 text-xs text-gray-400">Searching...</span>
                    </div>
                  )}

                  {!searchLoading && searchQuery.length > 0 && searchResults.length === 0 && (
                    <p className="text-xs text-gray-400 py-3">No products found for "{searchQuery}"</p>
                  )}

                  {!searchLoading && searchResults.length > 0 && (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="w-full flex items-center gap-3 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img
                                src={getProductImageUrl(product.image)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">📦</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-gray-800 truncate">{product.name}</h4>
                          </div>
                          <span className="text-sm font-medium text-gray-900 flex-shrink-0">₱{getPrice(product).toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
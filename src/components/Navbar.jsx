import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';

const Navbar = ({ user, onLogout, cartCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.utype === 'ADM' || user?.is_admin === true;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
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
            <button className="text-gray-600 hover:text-slate-900 transition-colors">
              <Search className="w-5 h-5" />
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
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
  );
};

export default Navbar;
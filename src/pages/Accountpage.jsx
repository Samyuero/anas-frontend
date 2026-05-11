import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Accountpage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-slate-900 mb-8 uppercase tracking-wide">
          My Account
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <nav className="space-y-2">
              <Link to="/account" className="block px-4 py-2 text-sm font-medium text-slate-900 bg-gray-100 rounded">
                Dashboard
              </Link>
              <Link to="/account/orders" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">
                Orders
              </Link>
              <Link to="/account/details" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">
                Account Details
              </Link>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
              >
                Logout
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
              Dashboard
            </h2>
            
            <p className="text-gray-600 mb-4">
              Hello <strong className="text-slate-900">{user.name}</strong>
            </p>
            
            <p className="text-gray-600">
              From your account dashboard you can view your{' '}
              <Link to="/account/orders" className="text-slate-900 underline hover:no-underline">recent orders</Link>, and{' '}
              <Link to="/account/details" className="text-slate-900 underline hover:no-underline">edit your password and account details</Link>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Accountpage;
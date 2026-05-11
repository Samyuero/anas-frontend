import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

// Eagerly loaded - always needed
import Homepage from "./pages/Homepage";
import Loginpage from "./pages/Loginpage";
import Registerpage from "./pages/Registerpage";

// Lazy loaded - only loaded when needed
const Shoppage = lazy(() => import("./pages/Shoppage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const UserDashboard = lazy(() => import("./pages/Accountpage"));
const UserOrdersPage = lazy(() => import("./pages/UserOrdersPage"));
const UserOrderDetailsPage = lazy(() => import("./pages/UserOrderDetailsPage"));
const AccountDetailsPage = lazy(() => import("./pages/AccountDetailsPage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/Products"));
const AdminAddProduct = lazy(() => import("./pages/AddProduct"));
const ViewProduct = lazy(() => import("./pages/ViewProduct"));
const EditProduct = lazy(() => import("./pages/EditProduct"));
const Brands = lazy(() => import("./pages/Brands"));
const NewBrand = lazy(() => import("./pages/AddBrand"));
const EditBrand = lazy(() => import("./pages/EditBrand"));
const Categories = lazy(() => import("./pages/Categories"));
const NewCategory = lazy(() => import("./pages/AddCategory"));
const EditCategory = lazy(() => import("./pages/EditCategory"));
const AdminOrders = lazy(() => import("./pages/Orders"));
const AdminOrderDetails = lazy(() => import("./pages/OrderDetails"));
const AdminSlides = lazy(() => import("./pages/AdminSlides"));
const AdminAddSlide = lazy(() => import("./pages/AdminAddSlide"));
const AdminEditSlide = lazy(() => import("./pages/AdminEditSlide"));
const AdminContacts = lazy(() => import("./pages/AdminContacts"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminAccounts = lazy(() => import("./pages/AdminAccounts"));

import api from "./api/axios";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm text-gray-500 tracking-wide">Loading...</p>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Centralized cart count fetcher
  const refreshCartCount = useCallback(async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const response = await api.get('/cart');
      if (response.data.success) {
        setCartCount(response.data.count || 0);
      }
    } catch (e) {
      setCartCount(0);
    }
  }, [user]);

  // Fetch cart count whenever user changes
  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartCount(0);
  };

  const isAdmin = user?.utype === 'ADM' || user?.is_admin === true;

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} cartCount={cartCount} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage user={user} />} />
          <Route path="/shop" element={<Shoppage refreshCartCount={refreshCartCount} />} />
          <Route path="/product/:slug" element={<ProductDetailsPage refreshCartCount={refreshCartCount} />} />
          <Route path="/cart" element={<CartPage refreshCartCount={refreshCartCount} />} />
          <Route path="/wishlist" element={<WishlistPage refreshCartCount={refreshCartCount} />} />
          <Route path="/checkout" element={user ? <CheckoutPage refreshCartCount={refreshCartCount} /> : <Navigate to="/login" />} />
          <Route path="/order-confirmation" element={user ? <OrderConfirmationPage /> : <Navigate to="/login" />} />
          
          <Route 
            path="/login" 
            element={
              user 
                ? (isAdmin ? <Navigate to="/admin/dashboard" /> : <Navigate to="/" />) 
                : <Loginpage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Registerpage onLogin={handleLogin} />} 
          />

          {/* User Account Routes */}
          <Route path="/account" element={user ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/account/orders" element={user ? <UserOrdersPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/account/orders/:id" element={user ? <UserOrderDetailsPage user={user} /> : <Navigate to="/login" />} />
          <Route path="/account/details" element={user ? <AccountDetailsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/account/change-password" element={user ? <ChangePasswordPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />

          {/* Admin Products */}
          <Route path="/admin/products" element={isAdmin ? <AdminProducts /> : <Navigate to="/login" />} />
          <Route path="/admin/products/add" element={isAdmin ? <AdminAddProduct /> : <Navigate to="/login" />} />
          <Route path="/admin/products/:id" element={isAdmin ? <ViewProduct /> : <Navigate to="/login" />} />
          <Route path="/admin/products/edit/:id" element={isAdmin ? <EditProduct /> : <Navigate to="/login" />} />
          
          {/* Admin Brands */}
          <Route path="/admin/brand" element={isAdmin ? <Brands /> : <Navigate to="/login" />} />
          <Route path="/admin/brand/new" element={isAdmin ? <NewBrand /> : <Navigate to="/login" />} />
          <Route path="/admin/brand/edit/:id" element={isAdmin ? <EditBrand /> : <Navigate to="/login" />} />
          
          {/* Admin Categories */}
          <Route path="/admin/category" element={isAdmin ? <Categories /> : <Navigate to="/login" />} />
          <Route path="/admin/category/new" element={isAdmin ? <NewCategory /> : <Navigate to="/login" />} />
          <Route path="/admin/category/edit/:id" element={isAdmin ? <EditCategory /> : <Navigate to="/login" />} />
          
          {/* Admin Orders */}
          <Route path="/admin/orders" element={isAdmin ? <AdminOrders /> : <Navigate to="/login" />} />
          <Route path="/admin/orders/:id" element={isAdmin ? <AdminOrderDetails /> : <Navigate to="/login" />} />

          {/* Admin Slides */}
          <Route path="/admin/slides" element={isAdmin ? <AdminSlides /> : <Navigate to="/login" />} />
          <Route path="/admin/slides/add" element={isAdmin ? <AdminAddSlide /> : <Navigate to="/login" />} />
          <Route path="/admin/slides/edit/:id" element={isAdmin ? <AdminEditSlide /> : <Navigate to="/login" />} />
          
          {/* Admin Reports */}
          <Route path="/admin/reports" element={isAdmin ? <AdminReports onLogout={handleLogout} /> : <Navigate to="/login" />} />
          
          {/* Admin Contacts */}
          <Route path="/admin/contacts" element={isAdmin ? <AdminContacts /> : <Navigate to="/login" />} />
          
          {/* Admin Accounts */}
          <Route path="/admin/accounts" element={isAdmin ? <AdminAccounts /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
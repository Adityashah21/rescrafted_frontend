import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { WishlistProvider, useWishlist } from './contexts/WishlistContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Lazy loaded page components for optimal bundle splitting and fast initial page loads
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SellerDashboardPage = lazy(() => import('./pages/seller/SellerDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lightweight, accessible fallback loader
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
    <div className="w-10 h-10 border-4 border-forest-100 border-t-forest-800 rounded-full animate-spin" />
    <span className="text-xs text-charcoal-light font-medium tracking-wide">
      Loading ResCrafted...
    </span>
  </div>
);

// Inner app that consumes AuthContext, CartContext, WishlistContext
const AppContent = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <Layout
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      currentUser={user}
      onLogout={logout}
    >
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Product Catalog routes */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailsPage />} />

          {/* Shopping Features routes */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute>
                <AddressesPage />
              </ProtectedRoute>
            }
          />

          {/* Checkout & Orders Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Customer Account Dashboard */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Seller Protected Control Panel */}
          <Route
            path="/seller/dashboard"
            element={
              <RoleRoute allowedRoles={['seller', 'admin']}>
                <SellerDashboardPage />
              </RoleRoute>
            }
          />

          {/* Admin Protected Moderation Console */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RoleRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;

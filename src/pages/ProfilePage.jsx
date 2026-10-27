import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Shield,
  Key,
  Package,
  MapPin,
  Heart,
  Store,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import authService from '../services/authService';
import orderService from '../services/orderService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Fetch recent orders for preview
  const { data: orderData } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => orderService.getOrders({ limit: 3 }),
  });

  const recentOrders = orderData?.orders || [];

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    try {
      setIsUpdatingProfile(true);
      const updatedUser = await authService.updateProfile({ name });
      setUser(updatedUser);
      toast.success('Profile name updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-800 text-accentLime text-2xl font-bold flex items-center justify-center shadow-soft">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-forest-950">
                {user?.name}
              </h1>
              <span className="capitalize text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-charcoal-muted flex items-center gap-2">
              <span>{user?.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Member since {memberSince}
              </span>
            </p>
          </div>
        </div>

        {/* Role Quick Links */}
        <div className="flex items-center gap-3">
          {user?.role === 'seller' && (
            <Link to="/seller/dashboard">
              <Button variant="primary" size="sm" icon={Store}>
                Seller Dashboard
              </Button>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard">
              <Button variant="primary" size="sm" icon={Shield}>
                Admin Console
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Nav Shortcuts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/orders"
          className="bg-white p-5 rounded-2xl border border-sand-200 shadow-soft hover:shadow-card transition-shadow flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest-950">My Orders</p>
              <p className="text-[11px] text-charcoal-muted">Track & review shipments</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-light group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/addresses"
          className="bg-white p-5 rounded-2xl border border-sand-200 shadow-soft hover:shadow-card transition-shadow flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest-950">Delivery Addresses</p>
              <p className="text-[11px] text-charcoal-muted">Manage shipping destinations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-light group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/wishlist"
          className="bg-white p-5 rounded-2xl border border-sand-200 shadow-soft hover:shadow-card transition-shadow flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest-950">Saved Wishlist</p>
              <p className="text-[11px] text-charcoal-muted">Upcycled items for later</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-light group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tabs Navigation (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2 bg-white rounded-3xl border border-sand-200 p-4 shadow-soft">
          {[
            { key: 'overview', label: 'Overview & Activity', icon: User },
            { key: 'details', label: 'Edit Profile Information', icon: User },
            { key: 'security', label: 'Password & Security', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                  isSelected
                    ? 'bg-forest-800 text-white shadow-soft'
                    : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {user?.role === 'customer' && (
            <div className="mt-4 pt-4 border-t border-sand-200 p-2">
              <div className="bg-forest-50/80 rounded-2xl p-4 border border-forest-100 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
                  <Sparkles className="w-4 h-4 text-forest-700" />
                  <span>Are you an artisan?</span>
                </div>
                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  Join our circular marketplace to sell upcycled or refurbished goods to eco-conscious consumers.
                </p>
                <Link to="/seller/register" className="mt-1">
                  <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                    Apply for Seller Store
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Tab Content (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Recent Orders Box */}
              <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft">
                <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-4">
                  <h2 className="text-base font-bold text-forest-950 flex items-center gap-2">
                    <Package className="w-4 h-4 text-forest-700" /> Recent Purchases
                  </h2>
                  <Link
                    to="/orders"
                    className="text-xs font-bold text-forest-800 hover:underline"
                  >
                    View All Orders →
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <p className="text-xs text-charcoal-muted py-4 text-center">
                    No orders placed yet.{' '}
                    <Link to="/products" className="text-forest-800 font-bold hover:underline">
                      Explore our sustainable catalog
                    </Link>
                  </p>
                ) : (
                  <div className="flex flex-col divide-y divide-sand-100">
                    {recentOrders.map((ord) => (
                      <div
                        key={ord._id}
                        className="py-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-xs font-mono font-bold text-forest-950">
                            {ord.orderNumber}
                          </p>
                          <p className="text-[11px] text-charcoal-muted">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-forest-900">
                            {formatCurrency(ord.pricing.totalPaise)}
                          </span>
                          <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                            {ord.orderStatus}
                          </span>
                          <Link to={`/orders/${ord._id}`}>
                            <ChevronRight className="w-4 h-4 text-charcoal-light hover:text-forest-800" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sustainability Impact Card */}
              <div className="bg-gradient-to-br from-forest-900 to-forest-800 rounded-3xl p-6 md:p-8 text-white shadow-elevated flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-accentLime font-bold text-xs uppercase tracking-wider block mb-1">
                    Your Circular Footprint
                  </span>
                  <h3 className="text-xl font-bold mb-2">
                    Every recycled craft diverts waste
                  </h3>
                  <p className="text-xs text-sand-200 max-w-md leading-relaxed">
                    By shopping refurbished, upcycled, and zero-waste items on ResCrafted, you preserve natural forestry and keep raw materials in circulation.
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[120px] backdrop-blur-sm border border-white/20">
                  <span className="text-2xl font-black text-accentLime block font-sans">
                    100%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-sand-100">
                    Verified Ethical
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Edit Profile Information */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft">
              <h2 className="text-base font-bold text-forest-950 border-b border-sand-100 pb-4 mb-6">
                Personal Information
              </h2>
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5 max-w-md">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed directly for account security."
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isUpdatingProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Password & Security */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft">
              <h2 className="text-base font-bold text-forest-950 border-b border-sand-100 pb-4 mb-6">
                Update Password
              </h2>
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isUpdatingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

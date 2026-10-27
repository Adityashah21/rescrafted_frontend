import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Users,
  Store,
  Package,
  TrendingUp,
  Leaf,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import dashboardService from '../../services/dashboardService';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');

  // 1. Fetch Metrics
  const { data: metricsData, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: dashboardService.getAdminMetrics,
  });

  // 2. Fetch Sellers
  const { data: sellersData, isLoading: isSellersLoading } = useQuery({
    queryKey: ['admin', 'sellers'],
    queryFn: () => dashboardService.getAdminSellers({ limit: 50 }),
  });

  // 3. Fetch Users
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin', 'users', userSearch],
    queryFn: () => dashboardService.getAdminUsers({ search: userSearch, limit: 50 }),
  });

  // 4. Fetch Products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => dashboardService.getAdminProducts({ limit: 50 }),
  });

  // 5. Fetch Audit Logs
  const { data: auditData, isLoading: isAuditLoading } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => dashboardService.getAdminAuditLogs({ limit: 50 }),
  });

  // Seller Approval/Rejection Mutation
  const updateSellerMutation = useMutation({
    mutationFn: ({ id, status }) => dashboardService.updateSellerStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
      toast.success(`Seller store application ${variables.status}!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update seller status');
    },
  });

  // User Suspension Mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => dashboardService.updateUserStatus(id, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
      toast.success(`User ${variables.isActive ? 'activated' : 'suspended'}!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update user account status');
    },
  });

  // Product Moderation Mutation
  const moderateProductMutation = useMutation({
    mutationFn: ({ id, status }) => dashboardService.moderateProduct(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
      toast.success(`Product listing set to ${variables.status}!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to moderate product listing');
    },
  });

  if (isMetricsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-6">
        <LoadingSkeleton type="text" count={2} />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <LoadingSkeleton type="card" count={4} />
        </div>
      </div>
    );
  }

  const { metrics, monthlyTrends = [] } = metricsData;
  const sellers = sellersData?.sellers || [];
  const users = usersData?.users || [];
  const products = productsData?.products || [];
  const auditLogs = auditData?.logs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-900 text-accentLime text-2xl font-bold flex items-center justify-center shadow-soft">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-forest-950">
                ResCrafted Administration Console
              </h1>
              <span className="capitalize text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                Root Authorization
              </span>
            </div>
            <p className="text-xs text-charcoal-muted">
              Platform-wide moderation, seller applications, audit logs, and gross GMV metrics.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-light mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Platform GMV</span>
            <TrendingUp className="w-5 h-5 text-forest-700" />
          </div>
          <span className="text-2xl font-black text-forest-950 font-sans">
            {formatCurrency(metrics.totalGmvPaise)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1">
            ✓ Across {metrics.totalOrders} marketplace orders
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-light mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Sellers</span>
            <Store className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-forest-950">
            {metrics.pendingSellers}
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1">
            {metrics.totalSellers} approved artisan studios
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-light mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Accounts</span>
            <Users className="w-5 h-5 text-forest-700" />
          </div>
          <span className="text-2xl font-black text-forest-950">
            {metrics.totalUsers}
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1">
            {metrics.totalCustomers} consumers • {metrics.totalSellers} artisans
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-light mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Diverted Waste</span>
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-800">
            {metrics.totalWasteDivertedKg.toLocaleString()} <span className="text-sm font-semibold">kg</span>
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1">
            ~{metrics.totalCo2SavedKg.toLocaleString()} kg CO2 avoided
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-sand-200 scrollbar-none">
        {[
          { key: 'overview', label: 'Platform Trends' },
          { key: 'sellers', label: `Artisan Applications (${sellers.length})` },
          { key: 'products', label: `Listing Moderation (${products.length})` },
          { key: 'users', label: `User Directory (${users.length})` },
          { key: 'audit', label: `Audit Trail (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-forest-800 text-white shadow-soft'
                : 'bg-sand-100 text-forest-900 hover:bg-sand-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Platform Overview Chart */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-forest-950">
                Monthly Platform Order Volumes (₹)
              </h2>
              <p className="text-xs text-charcoal-muted">
                Marketplace transaction volume over previous 6 calendar months
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-forest-700" />
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD4" vertical={false} />
                <XAxis dataKey="month" stroke="#6C757D" fontSize={11} />
                <YAxis stroke="#6C757D" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Gross Volume']}
                  contentStyle={{
                    backgroundColor: '#1E3A2B',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="gmv" fill="#1E3A2B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 2: Artisan Applications */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft">
          <div className="p-6 border-b border-sand-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-forest-950">
              Artisan & Studio Verification Requests
            </h2>
            <span className="text-xs text-charcoal-muted">
              {sellers.filter((s) => s.status === 'pending').length} pending approval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-sand-50/60 border-b border-sand-200 text-charcoal-light uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-6 font-bold">Studio Store</th>
                  <th className="py-3 px-6 font-bold">Applicant Email</th>
                  <th className="py-3 px-6 font-bold">Story & Bio</th>
                  <th className="py-3 px-6 font-bold">Status</th>
                  <th className="py-3 px-6 font-bold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {sellers.map((sel) => (
                  <tr key={sel._id} className="hover:bg-sand-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-forest-950">
                      {sel.storeName}
                    </td>
                    <td className="py-4 px-6 text-charcoal-muted">
                      {sel.userId?.email || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-charcoal max-w-xs truncate">
                      {sel.bio || 'No bio provided'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`capitalize text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          sel.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sel.status === 'rejected'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {sel.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {sel.status !== 'approved' && (
                        <button
                          onClick={() =>
                            updateSellerMutation.mutate({ id: sel._id, status: 'approved' })
                          }
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg mr-2 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {sel.status !== 'rejected' && (
                        <button
                          onClick={() =>
                            updateSellerMutation.mutate({ id: sel._id, status: 'rejected' })
                          }
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Listing Moderation */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft">
          <div className="p-6 border-b border-sand-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-forest-950">
              Platform Product Moderation
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-sand-50/60 border-b border-sand-200 text-charcoal-light uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-6 font-bold">Product</th>
                  <th className="py-3 px-6 font-bold">Artisan</th>
                  <th className="py-3 px-6 font-bold">Category</th>
                  <th className="py-3 px-6 font-bold">Price</th>
                  <th className="py-3 px-6 font-bold">Status</th>
                  <th className="py-3 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-sand-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-forest-950 truncate max-w-[200px]">
                      {p.title}
                    </td>
                    <td className="py-4 px-6 text-charcoal">
                      {p.sellerId?.storeName || 'Artisan'}
                    </td>
                    <td className="py-4 px-6 text-charcoal-muted">
                      {p.categoryId?.name || 'General'}
                    </td>
                    <td className="py-4 px-6 font-bold text-forest-900">
                      {formatCurrency(p.pricePaise)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {p.status !== 'published' ? (
                        <button
                          onClick={() =>
                            moderateProductMutation.mutate({ id: p._id, status: 'published' })
                          }
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            moderateProductMutation.mutate({ id: p._id, status: 'archived' })
                          }
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: User Directory */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft">
          <div className="p-6 border-b border-sand-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-base font-bold text-forest-950">
              User Directory & Account Status
            </h2>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-forest-800"
              />
              <Search className="w-3.5 h-3.5 text-charcoal-light absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-sand-50/60 border-b border-sand-200 text-charcoal-light uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-6 font-bold">User</th>
                  <th className="py-3 px-6 font-bold">Email</th>
                  <th className="py-3 px-6 font-bold">Role</th>
                  <th className="py-3 px-6 font-bold">State</th>
                  <th className="py-3 px-6 font-bold text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-sand-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-forest-950">{u.name}</td>
                    <td className="py-4 px-6 text-charcoal-muted">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {u.isActive ? (
                        <span className="text-emerald-700 font-bold text-[11px]">Active</span>
                      ) : (
                        <span className="text-red-600 font-bold text-[11px]">Suspended</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() =>
                            updateUserStatusMutation.mutate({ id: u._id, isActive: !u.isActive })
                          }
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            u.isActive
                              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft">
          <div className="p-6 border-b border-sand-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-forest-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-forest-700" /> Platform Security & Audit Trail
            </h2>
            <span className="text-xs text-charcoal-muted">Immutable system activity logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-sand-50/60 border-b border-sand-200 text-charcoal-light uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-6 font-bold">Action Taken</th>
                  <th className="py-3 px-6 font-bold">Admin Actor</th>
                  <th className="py-3 px-6 font-bold">Target Type</th>
                  <th className="py-3 px-6 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-sand-50/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-forest-900">
                      {log.action}
                    </td>
                    <td className="py-4 px-6 text-charcoal">
                      {log.actorId?.name || 'Administrator'}
                    </td>
                    <td className="py-4 px-6 text-charcoal-muted">
                      {log.targetType} ({log.targetId?.slice(0, 8)}...)
                    </td>
                    <td className="py-4 px-6 text-charcoal-light">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

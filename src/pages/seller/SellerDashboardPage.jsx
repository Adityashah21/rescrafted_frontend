import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  Package,
  TrendingUp,
  Leaf,
  Plus,
  Truck,
  ExternalLink,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Edit,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import dashboardService from '../../services/dashboardService';
import productService from '../../services/productService';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Badge from '../../components/common/Badge';
import SustainabilityBadge from '../../components/common/SustainabilityBadge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { formatCurrency } from '../../utils/formatters';

const SellerDashboardPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  // Dispatch Package Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedFulfillment, setSelectedFulfillment] = useState(null);
  const [dispatchData, setDispatchData] = useState({
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    fulfillmentStatus: 'shipped',
  });

  // Fetch Dashboard Stats & Monthly Trends
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: dashboardService.getSellerDashboard,
  });

  // Fetch Seller's Orders
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['seller', 'orders'],
    queryFn: () => dashboardService.getSellerOrders(),
  });

  // Fetch Seller's Products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['seller', 'products'],
    queryFn: () => productService.getProducts({ limit: 50 }),
  });

  // Update Fulfillment Mutation
  const updateFulfillmentMutation = useMutation({
    mutationFn: ({ orderId, fulfillmentId, data }) =>
      dashboardService.updateFulfillmentStatus(orderId, fulfillmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'dashboard'] });
      setIsDispatchModalOpen(false);
      setSelectedFulfillment(null);
      setDispatchData({ carrier: '', trackingNumber: '', trackingUrl: '', fulfillmentStatus: 'shipped' });
      toast.success('Package fulfillment status updated successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update package dispatch status');
    },
  });

  // Store profile update mutation
  const [storeBio, setStoreBio] = useState('');
  React.useEffect(() => {
    if (dashboardData?.profile?.bio) {
      setStoreBio(dashboardData.profile.bio);
    }
  }, [dashboardData]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => dashboardService.updateSellerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'dashboard'] });
      toast.success('Store profile updated successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update store profile');
    },
  });

  const handleOpenDispatchModal = (order) => {
    setSelectedFulfillment({
      orderId: order._id,
      orderNumber: order.orderNumber,
      fulfillmentId: order.fulfillment._id,
    });
    setIsDispatchModalOpen(true);
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!selectedFulfillment) return;
    updateFulfillmentMutation.mutate({
      orderId: selectedFulfillment.orderId,
      fulfillmentId: selectedFulfillment.fulfillmentId,
      data: dispatchData,
    });
  };

  if (isDashboardLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-6">
        <LoadingSkeleton type="text" count={2} />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <LoadingSkeleton type="card" count={4} />
        </div>
      </div>
    );
  }

  const { stats, profile, monthlyTrends = [] } = dashboardData;
  const sellerOrders = ordersData?.orders || [];
  const sellerProducts = productsData?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-800 text-accentLime text-2xl font-bold flex items-center justify-center shadow-soft">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-forest-950">
                {profile.storeName}
              </h1>
              <span className="capitalize text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                Verified Artisan Studio
              </span>
            </div>
            <p className="text-xs text-charcoal-muted max-w-xl line-clamp-1">
              {profile.bio || 'Handcrafted circular items and upcycled materials.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('products')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-forest-800 text-white hover:bg-forest-900 transition-colors shadow-soft"
          >
            <Plus className="w-4 h-4" /> Add New Listing
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-light mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Earnings</span>
            <DollarSign className="w-5 h-5 text-forest-700" />
          </div>
          <span className="text-2xl font-black text-forest-950 font-sans">
            {formatCurrency(stats.totalEarningsPaise)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1">
            ✓ Across {stats.totalOrdersCount} customer orders
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-light mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-forest-950">
            {stats.pendingFulfillmentsCount}
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1">
            Packages awaiting packing & dispatch
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-light mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Catalog</span>
            <Package className="w-5 h-5 text-forest-700" />
          </div>
          <span className="text-2xl font-black text-forest-950">
            {stats.publishedProducts}
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1">
            {stats.outOfStockProducts} listings currently out of stock
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-light mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Waste Diverted</span>
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-800">
            {stats.totalWasteDivertedKg} <span className="text-sm font-semibold">kg</span>
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1">
            ~{stats.totalCo2SavedKg} kg carbon avoided
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-sand-200 scrollbar-none">
        {[
          { key: 'overview', label: 'Overview & Analytics' },
          { key: 'orders', label: `Fulfillment Orders (${sellerOrders.length})` },
          { key: 'products', label: `Product Listings (${sellerProducts.length})` },
          { key: 'settings', label: 'Store Profile Settings' },
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

      {/* TAB 1: Overview & Recharts Analytics */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Revenue Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-forest-950">
                  Sales & Revenue Trends (₹)
                </h2>
                <p className="text-xs text-charcoal-muted">
                  Monthly gross merchandise earnings over the past 6 months
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-forest-700" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A2B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1E3A2B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD4" vertical={false} />
                  <XAxis dataKey="month" stroke="#6C757D" fontSize={11} />
                  <YAxis stroke="#6C757D" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val) => [`₹${val}`, 'Earnings']}
                    contentStyle={{
                      backgroundColor: '#1E3A2B',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1E3A2B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Alerts & Quick Tips (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-soft flex flex-col gap-4">
              <h3 className="text-sm font-bold text-forest-950 flex items-center gap-2 border-b border-sand-100 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Stock Level Alerts
              </h3>
              {dashboardData.lowStockProducts.length === 0 ? (
                <p className="text-xs text-charcoal-muted">
                  All active listings have healthy inventory quantities.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-sand-100">
                  {dashboardData.lowStockProducts.map((prod) => (
                    <div key={prod._id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="truncate max-w-[170px]">
                        <p className="font-bold text-forest-950 truncate">{prod.title}</p>
                        <p className="text-[10px] text-charcoal-light font-mono">{prod.sku}</p>
                      </div>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {prod.stockQuantity} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-forest-50/70 rounded-3xl border border-forest-100 p-6 flex flex-col gap-2.5 text-xs text-forest-950">
              <span className="font-bold text-forest-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-forest-700" /> Packaging Best Practices
              </span>
              <p className="text-charcoal-muted leading-relaxed">
                Use 100% biodegradable corrugated cardboard or compostable paper tape for dispatching packages to maintain your ResCrafted circular certification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Fulfillment Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft">
          <div className="p-6 border-b border-sand-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-forest-950">
              Orders Requiring Dispatch
            </h2>
            <span className="text-xs text-charcoal-muted">
              {sellerOrders.length} fulfillment packages
            </span>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Package className="w-12 h-12 text-sand-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-forest-950">No incoming orders yet</p>
              <p className="text-xs text-charcoal-muted mt-1">
                New customer orders containing your items will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-sand-50/60 border-b border-sand-200 text-charcoal-light uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-6 font-bold">Order ID</th>
                    <th className="py-3 px-6 font-bold">Destination</th>
                    <th className="py-3 px-6 font-bold">Items in Package</th>
                    <th className="py-3 px-6 font-bold">Subtotal</th>
                    <th className="py-3 px-6 font-bold">Status</th>
                    <th className="py-3 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {sellerOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-sand-50/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-forest-950">
                        {ord.orderNumber}
                      </td>
                      <td className="py-4 px-6 text-charcoal">
                        {ord.shippingAddress?.fullName}
                        <br />
                        <span className="text-[11px] text-charcoal-muted">
                          {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-charcoal">
                        {ord.fulfillment?.items?.map((it) => (
                          <div key={it._id} className="truncate max-w-[200px]">
                            {it.quantity}x {it.title}
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-6 font-bold text-forest-900">
                        {formatCurrency(ord.packageSubtotalPaise)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`capitalize text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            ord.fulfillmentStatus === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : ord.fulfillmentStatus === 'shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {ord.fulfillmentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {ord.fulfillmentStatus !== 'delivered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Truck}
                            onClick={() => handleOpenDispatchModal(ord)}
                          >
                            Update Tracking
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Product Listings */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft">
          <div className="p-6 border-b border-sand-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-forest-950">Catalog Inventory</h2>
              <p className="text-xs text-charcoal-muted">
                Manage your handcrafted, upcycled, and refurbished goods
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-sand-50/60 border-b border-sand-200 text-charcoal-light uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-6 font-bold">Product</th>
                  <th className="py-3 px-6 font-bold">Condition</th>
                  <th className="py-3 px-6 font-bold">Price</th>
                  <th className="py-3 px-6 font-bold">Stock</th>
                  <th className="py-3 px-6 font-bold">Status</th>
                  <th className="py-3 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {sellerProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-sand-50/40 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=100'}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover border border-sand-200"
                      />
                      <div>
                        <p className="font-bold text-forest-950 truncate max-w-[200px]">{p.title}</p>
                        <p className="text-[10px] text-charcoal-light font-mono">{p.sku}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <SustainabilityBadge condition={p.condition} />
                    </td>
                    <td className="py-4 px-6 font-bold text-forest-900">
                      {formatCurrency(p.pricePaise)}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {p.stockQuantity > 0 ? (
                        <span className="text-forest-900">{p.stockQuantity} units</span>
                      ) : (
                        <span className="text-red-600 font-bold">Out of stock</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/products/${p.slug}`}>
                        <Button variant="ghost" size="sm" icon={ExternalLink}>
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Store Profile Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft max-w-2xl">
          <h2 className="text-base font-bold text-forest-950 border-b border-sand-100 pb-4 mb-6">
            Store Profile & Bio
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfileMutation.mutate({ bio: storeBio });
            }}
            className="flex flex-col gap-5"
          >
            <Input label="Store Name" value={profile.storeName} disabled />

            <div>
              <label className="block text-xs font-semibold text-forest-950 mb-1">
                Artisan Story & Sustainability Bio
              </label>
              <textarea
                rows={4}
                value={storeBio}
                onChange={(e) => setStoreBio(e.target.value)}
                placeholder="Share your materials source, upcycling craft process, and ecological goals..."
                className="w-full text-xs p-3.5 rounded-2xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-forest-800 bg-sand-50/30"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={updateProfileMutation.isLoading}
              >
                Save Store Information
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Dispatch Tracking Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Update Dispatch & Tracking"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleDispatchSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-charcoal-muted">
            Update fulfillment status for package under order{' '}
            <strong>{selectedFulfillment?.orderNumber}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-forest-950 mb-1">
              Fulfillment Status *
            </label>
            <select
              value={dispatchData.fulfillmentStatus}
              onChange={(e) =>
                setDispatchData((prev) => ({ ...prev, fulfillmentStatus: e.target.value }))
              }
              className="w-full text-xs p-3 rounded-xl border border-sand-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              <option value="processing">Processing / Packing</option>
              <option value="shipped">Dispatched / In Transit</option>
              <option value="delivered">Delivered to Customer</option>
            </select>
          </div>

          <Input
            label="Logistics Courier / Carrier"
            placeholder="e.g. BlueDart, Delhivery, IndiaPost"
            value={dispatchData.carrier}
            onChange={(e) =>
              setDispatchData((prev) => ({ ...prev, carrier: e.target.value }))
            }
          />

          <Input
            label="Tracking Number / AWB"
            placeholder="e.g. BLU123456789"
            value={dispatchData.trackingNumber}
            onChange={(e) =>
              setDispatchData((prev) => ({ ...prev, trackingNumber: e.target.value }))
            }
          />

          <Input
            label="Live Tracking Web URL"
            placeholder="https://track.courier.com/..."
            value={dispatchData.trackingUrl}
            onChange={(e) =>
              setDispatchData((prev) => ({ ...prev, trackingUrl: e.target.value }))
            }
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDispatchModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={updateFulfillmentMutation.isLoading}
            >
              Confirm Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerDashboardPage;

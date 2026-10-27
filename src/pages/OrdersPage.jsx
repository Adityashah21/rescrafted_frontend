import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import orderService from '../services/orderService';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';

const getStatusBadge = (status) => {
  switch (status) {
    case 'confirmed':
      return <Badge variant="success">Confirmed</Badge>;
    case 'processing':
      return <Badge variant="warning">Processing</Badge>;
    case 'shipped':
      return <Badge variant="info">In Transit</Badge>;
    case 'delivered':
      return <Badge variant="success">Delivered</Badge>;
    case 'cancelled':
      return <Badge variant="neutral">Cancelled</Badge>;
    case 'pending_payment':
      return <Badge variant="warning">Pending Payment</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders({ limit: 50 }),
  });

  const orders = data?.orders || [];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['confirmed', 'processing', 'shipped'].includes(order.orderStatus);
    }
    return order.orderStatus === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-forest-950 mb-1">
            Order History
          </h1>
          <p className="text-sm text-charcoal-muted">
            Track your circular purchases, fulfillment statuses, and sustainability receipts.
          </p>
        </div>
        <Link to="/products">
          <Button variant="outline" size="sm" icon={ShoppingBag}>
            Explore More Products
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-sand-200">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'active', label: 'Active & In Transit' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-forest-800 text-white shadow-soft'
                : 'bg-sand-100 text-forest-900 hover:bg-sand-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <LoadingSkeleton type="card" count={3} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Found"
          description={
            activeTab === 'all'
              ? "You haven't placed any sustainable orders yet. Give waste a second life today!"
              : `No orders matching "${activeTab}" status found.`
          }
          actionLabel="Start Sustainable Shopping"
          actionUrl="/products"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString(
              'en-IN',
              {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }
            );

            // Collect all unique item previews across fulfillments
            const items = order.sellerFulfillments.flatMap((f) => f.items);
            const totalItemsCount = items.reduce((acc, it) => acc + it.quantity, 0);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft hover:shadow-card transition-shadow"
              >
                {/* Header Banner */}
                <div className="bg-sand-50/70 p-5 border-b border-sand-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-charcoal-muted">
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-light">
                        Order Number
                      </span>
                      <strong className="text-forest-950 font-mono text-sm">
                        {order.orderNumber}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-light">
                        Order Placed
                      </span>
                      <span className="text-forest-900 font-medium">
                        {formattedDate}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-light">
                        Total Amount
                      </span>
                      <strong className="text-forest-950 text-sm">
                        {formatCurrency(order.pricing.totalPaise)}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-light">
                        Ship To
                      </span>
                      <span className="text-forest-900 font-medium truncate max-w-[140px] block">
                        {order.shippingAddressSnapshot.fullName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.orderStatus)}
                    <Link to={`/orders/${order._id}`}>
                      <Button variant="outline" size="sm" icon={ChevronRight} iconPosition="right">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Items Preview Rail */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {items.slice(0, 4).map((it, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-2xl overflow-hidden bg-sand-100 border border-sand-200 flex-shrink-0"
                      >
                        <img
                          src={
                            it.imageUrl ||
                            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'
                          }
                          alt={it.title}
                          className="w-full h-full object-cover"
                        />
                        {it.quantity > 1 && (
                          <span className="absolute bottom-1 right-1 bg-forest-900/80 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            ×{it.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {items.length > 4 && (
                      <div className="w-16 h-16 rounded-2xl bg-sand-100 border border-sand-200 flex items-center justify-center text-xs font-bold text-forest-800">
                        +{items.length - 4} more
                      </div>
                    )}
                  </div>

                  {/* Summary / Status Details */}
                  <div className="flex flex-col gap-1 text-xs text-charcoal-muted md:text-right">
                    <p className="font-medium text-forest-900">
                      {totalItemsCount} item{totalItemsCount > 1 ? 's' : ''} in{' '}
                      {order.sellerFulfillments.length} package
                      {order.sellerFulfillments.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-[11px]">
                      Delivering to {order.shippingAddressSnapshot.city},{' '}
                      {order.shippingAddressSnapshot.state}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

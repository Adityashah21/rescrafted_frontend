import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Store,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import orderService from '../services/orderService';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
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

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }) => orderService.cancelOrder(orderId, reason),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsCancelModalOpen(false);
      setCancelReason('');
      toast.success('Order has been cancelled and inventory released.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel order');
    },
  });

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error('Please enter a cancellation reason');
      return;
    }
    cancelMutation.mutate({ orderId: order._id, reason: cancelReason });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-6">
        <LoadingSkeleton type="text" count={2} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-forest-950">Order Not Found</h2>
        <p className="text-sm text-charcoal-muted">
          We could not find the order you requested, or you may not be authorized to view it.
        </p>
        <Link to="/orders">
          <Button variant="primary" size="md">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const isCancellable = ['pending_payment', 'confirmed', 'processing'].includes(
    order.orderStatus
  );

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate order progress step
  const getProgressStep = () => {
    if (order.orderStatus === 'cancelled') return -1;
    if (order.orderStatus === 'delivered') return 4;
    if (order.orderStatus === 'shipped') return 3;
    if (order.orderStatus === 'processing') return 2;
    if (order.orderStatus === 'confirmed') return 1;
    return 0; // pending_payment
  };

  const progressStep = getProgressStep();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-forest-950">
              Order {order.orderNumber}
            </h1>
            {getStatusBadge(order.orderStatus)}
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Placed on {formattedDate}
          </p>
        </div>

        {/* Cancel Action if permitted */}
        {isCancellable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCancelModalOpen(true)}
            className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Order Progress Stepper (Only if not cancelled) */}
      {order.orderStatus !== 'cancelled' ? (
        <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 mb-8 shadow-soft">
          <h2 className="text-sm font-bold text-forest-950 mb-6">
            Fulfillment Journey
          </h2>
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Background Line */}
            <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-sand-200 -z-0" />
            <div
              className="absolute top-4 left-[12%] h-1 bg-forest-800 transition-all duration-500 -z-0"
              style={{
                width: `${Math.min(100, Math.max(0, (progressStep - 1) * 33.33))}%`,
              }}
            />

            {[
              { step: 1, label: 'Confirmed', icon: CheckCircle2 },
              { step: 2, label: 'Handcrafted / Packed', icon: Clock },
              { step: 3, label: 'Dispatched', icon: Truck },
              { step: 4, label: 'Delivered', icon: Package },
            ].map((s) => {
              const isPassed = progressStep >= s.step;
              const isCurrent = progressStep === s.step;
              const Icon = s.icon;

              return (
                <div key={s.step} className="flex flex-col items-center text-center z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 ${
                      isPassed
                        ? 'bg-forest-800 text-white shadow-soft'
                        : 'bg-sand-100 text-charcoal-light border border-sand-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs ${
                      isCurrent
                        ? 'font-bold text-forest-950'
                        : isPassed
                        ? 'font-semibold text-forest-800'
                        : 'text-charcoal-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50/70 border border-red-200 rounded-3xl p-6 mb-8 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-950 mb-0.5">
              This order has been cancelled
            </h3>
            <p className="text-xs text-red-800">
              Reserved stock was restored to the circular marketplace. If any amount was paid, refund processing will reflect within 3-5 business days.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Packages + Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Seller Fulfillment Packages (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-base font-bold text-forest-950">
            Fulfillment Packages ({order.sellerFulfillments.length})
          </h2>

          {order.sellerFulfillments.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft"
            >
              {/* Package Header */}
              <div className="bg-sand-50/80 px-6 py-4 border-b border-sand-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-950">
                  <Store className="w-4 h-4 text-forest-700" />
                  <span>Artisan: {group.storeNameSnapshot}</span>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(group.fulfillmentStatus)}
                  {group.trackingNumber && (
                    <span className="text-[11px] font-semibold text-charcoal-muted">
                      Tracking: {group.trackingNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Package Tracking Pill if carrier is provided */}
              {group.carrier && (
                <div className="px-6 py-2.5 bg-forest-50/60 border-b border-forest-100 flex items-center justify-between text-xs text-forest-900">
                  <span className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-forest-700" />
                    <span>Courier: <strong>{group.carrier}</strong></span>
                  </span>
                  {group.trackingUrl && (
                    <a
                      href={group.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-800 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                    >
                      Track Package <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Items in Package */}
              <div className="divide-y divide-sand-100">
                {group.items.map((item) => (
                  <div key={item._id} className="p-6 flex items-start gap-4">
                    <Link
                      to={`/products/${item.slug}`}
                      className="w-20 h-20 rounded-2xl overflow-hidden bg-sand-100 border border-sand-200 flex-shrink-0"
                    >
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.slug}`}
                        className="text-sm font-bold text-forest-950 hover:text-forest-700 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-charcoal-light font-mono mt-0.5">
                        SKU: {item.sku}
                      </p>
                      <p className="text-xs text-charcoal-muted mt-1">
                        Quantity: <strong>{item.quantity}</strong> × {formatCurrency(item.unitPricePaise)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-forest-900">
                        {formatCurrency(item.subtotalPaise)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Address & Price Breakdown (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Shipping Address Box */}
          <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-soft flex flex-col gap-3">
            <h3 className="text-sm font-bold text-forest-950 border-b border-sand-100 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-forest-700" /> Delivery Address
            </h3>
            <p className="text-xs font-bold text-forest-950">
              {order.shippingAddressSnapshot.fullName}
            </p>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              {order.shippingAddressSnapshot.addressLine1}
              {order.shippingAddressSnapshot.addressLine2 && `, ${order.shippingAddressSnapshot.addressLine2}`}
              <br />
              {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.state} - {order.shippingAddressSnapshot.postalCode}
              <br />
              {order.shippingAddressSnapshot.country}
            </p>
            <p className="text-xs text-forest-900 font-medium pt-2 border-t border-sand-100">
              📞 {order.shippingAddressSnapshot.phone}
            </p>
          </div>

          {/* Payment & Financial Breakdown Box */}
          <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-soft flex flex-col gap-4">
            <h3 className="text-sm font-bold text-forest-950 border-b border-sand-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-forest-700" /> Payment & Receipt
            </h3>

            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal-muted">Payment Status</span>
              <span className={`font-bold uppercase tracking-wider text-[11px] ${
                order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {order.paymentStatus}
              </span>
            </div>

            {order.razorpayPaymentId && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-charcoal-muted">Payment Ref</span>
                <span className="font-mono text-[11px] text-forest-900 truncate max-w-[150px]">
                  {order.razorpayPaymentId}
                </span>
              </div>
            )}

            {order.paymentStatus === 'pending' && order.orderStatus === 'pending_payment' && (
              <div className="pt-2">
                <Link to="/checkout">
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    Complete Payment via Razorpay
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-2.5 text-xs text-charcoal-muted pt-2 border-t border-sand-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-forest-950">
                  {formatCurrency(order.pricing.subtotalPaise)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-forest-950">
                  {order.pricing.shippingPaise === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(order.pricing.shippingPaise)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Circular GST (5%)</span>
                <span className="font-semibold text-forest-950">
                  {formatCurrency(order.pricing.taxPaise)}
                </span>
              </div>

              <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline text-base font-black text-forest-950">
                <span>Total Paid</span>
                <span className="text-xl text-forest-900 font-sans">
                  {formatCurrency(order.pricing.totalPaise)}
                </span>
              </div>
            </div>

            {/* Packaging / Customer Note */}
            {order.notes && (
              <div className="p-3 rounded-2xl bg-sand-50 border border-sand-200 text-xs text-charcoal-muted">
                <span className="font-bold text-forest-950 block mb-0.5">Delivery Notes:</span>
                "{order.notes}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order Confirmation"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCancelSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Are you sure you want to cancel Order <strong>{order.orderNumber}</strong>? The reserved sustainable items will immediately be restored to the marketplace.
          </p>

          <div>
            <label className="block text-xs font-semibold text-forest-950 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed mind, ordered incorrect dimensions, delivery delayed..."
              className="w-full text-xs p-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-forest-800 bg-sand-50/50"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={cancelMutation.isLoading}
            >
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderDetailsPage;

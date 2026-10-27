import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  AlertTriangle,
  RotateCcw,
  Store,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import SustainabilityBadge from '../components/common/SustainabilityBadge';

const CartPage = () => {
  const {
    items,
    summary,
    sellerGroups,
    hasUnavailableItems,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-4 shadow-soft">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-forest-950 mb-2">Your Cart is Waiting</h2>
        <p className="text-xs text-charcoal-muted mb-6 leading-relaxed">
          Please log in to view items in your persistent shopping cart and continue your circular
          journey.
        </p>
        <Link to="/login?redirect=/cart">
          <Button variant="primary" size="md">
            Sign In to View Cart
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your sustainable cart is empty"
        description="Every purchase on ResCrafted gives discarded and rescued materials a second life. Explore upcycled decor, refurbished tech, and circular fashion."
        actionLabel="Explore Marketplace"
        onAction={() => navigate('/products')}
      />
    );
  }

  // Calculate free shipping progress percentage
  const freeShippingNeededPaise = summary.freeShippingThresholdPaise - summary.subtotalPaise;
  const progressPercent = Math.min(
    100,
    Math.round((summary.subtotalPaise / summary.freeShippingThresholdPaise) * 100)
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-sans">
            Shopping Cart ({items.length} item{items.length > 1 ? 's' : ''})
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Prices and stock are verified directly from active artisan inventories.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-charcoal-light hover:text-red-600 transition-colors self-start sm:self-auto flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Stock warning alert banner */}
      {hasUnavailableItems && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Inventory Notification:</strong> One or more items in
            your cart have limited stock. Quantities have been automatically adjusted to available
            units.
          </div>
        </div>
      )}

      {/* Main Grid: Cart Items (left) + Order Summary (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Seller-Grouped Items (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {sellerGroups.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-soft"
            >
              {/* Group Header */}
              <div className="bg-sand-50/70 px-6 py-3 border-b border-sand-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-900">
                  <Store className="w-4 h-4 text-forest-700" />
                  <span>Fulfilled by: {group.storeName}</span>
                </div>
                <span className="text-[11px] font-semibold text-charcoal-light">
                  Group Subtotal: {formatCurrency(group.subtotalPaise)}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-sand-100">
                {group.items.map((item) => (
                  <div key={item._id} className="p-6 flex flex-col sm:flex-row gap-4 items-start">
                    {/* Thumbnail */}
                    <Link
                      to={`/products/${item.productId.slug}`}
                      className="w-24 h-24 rounded-2xl overflow-hidden bg-sand-100 flex-shrink-0 border border-sand-200"
                    >
                      <img
                        src={
                          item.productId.imageUrl ||
                          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400'
                        }
                        alt={item.productId.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <SustainabilityBadge condition={item.productId.condition} />
                        {item.isOutOfStock && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            Sold Out
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/products/${item.productId.slug}`}
                        className="text-sm font-bold text-forest-950 hover:text-forest-700 transition-colors line-clamp-2"
                      >
                        {item.productId.title}
                      </Link>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold text-forest-900">
                          {formatCurrency(item.unitPricePaise)}
                        </span>
                        {item.productId.compareAtPricePaise && (
                          <span className="text-xs text-charcoal-light line-through">
                            {formatCurrency(item.productId.compareAtPricePaise)}
                          </span>
                        )}
                      </div>

                      {/* Stock availability warning */}
                      {item.isQuantityAdjusted && (
                        <span className="text-[11px] font-semibold text-amber-700">
                          Max available: {item.productId.stockQuantity} units
                        </span>
                      )}
                    </div>

                    {/* Quantity Selector & Item Total */}
                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-4 self-stretch sm:self-auto">
                      <div className="flex items-center rounded-xl border border-sand-300 bg-white shadow-soft">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoading}
                          className="px-2.5 py-1 text-xs font-bold text-charcoal hover:bg-sand-50 rounded-l-xl disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-forest-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.productId.stockQuantity || isLoading}
                          className="px-2.5 py-1 text-xs font-bold text-charcoal hover:bg-sand-50 rounded-r-xl disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-sm font-extrabold text-forest-950">
                          {formatCurrency(item.itemSubtotalPaise)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 mt-1"
                          aria-label={`Remove ${item.productId.title} from cart`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Financial Order Summary (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
          <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-soft flex flex-col gap-5">
            <h3 className="text-base font-bold text-forest-950 border-b border-sand-100 pb-3">
              Order Summary
            </h3>

            {/* Free Shipping Progress Indicator */}
            <div className="p-4 rounded-2xl bg-forest-50/80 border border-forest-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-forest-900">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-forest-700" />
                  <span>Carbon-Neutral Delivery</span>
                </span>
                <span>{summary.isFreeShippingQualified ? 'FREE' : '₹99'}</span>
              </div>

              <div className="w-full bg-sand-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-accentLime h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-charcoal-muted">
                {summary.isFreeShippingQualified ? (
                  <strong className="text-emerald-700">✓ You qualified for Free Shipping!</strong>
                ) : (
                  <>
                    Add <strong>{formatCurrency(freeShippingNeededPaise)}</strong> more to get{' '}
                    <strong>Free Shipping</strong>.
                  </>
                )}
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col gap-2.5 text-xs text-charcoal-muted">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-forest-950">
                  {formatCurrency(summary.subtotalPaise)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Eco Delivery</span>
                <span className="font-semibold text-forest-950">
                  {summary.shippingPaise === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(summary.shippingPaise)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Circular GST (5%)</span>
                <span className="font-semibold text-forest-950">
                  {formatCurrency(summary.taxPaise)}
                </span>
              </div>

              <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline text-base font-black text-forest-950">
                <span>Estimated Total</span>
                <span className="text-xl text-forest-900 font-sans">
                  {formatCurrency(summary.totalPaise)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/checkout')}
              className="w-full justify-center shadow-soft"
            >
              Proceed to Checkout
            </Button>

            <Link
              to="/products"
              className="text-center text-xs font-semibold text-forest-800 hover:underline"
            >
              Continue Shopping
            </Link>

            {/* Security Pill */}
            <div className="pt-3 border-t border-sand-100 flex items-center justify-center gap-2 text-[11px] text-charcoal-light">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay 256-Bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Leaf,
  ArrowLeft,
  AlertCircle,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { formatCurrency } from '../utils/formatters';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { cart, isLoading: isCartLoading, cartCount } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Simulated Payment Modal State (for development / fallback test)
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Address form state for inline addition
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  // Query saved addresses
  const {
    data: addresses = [],
    isLoading: isAddressesLoading,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
    onSuccess: (data) => {
      if (!selectedAddressId && data.length > 0) {
        const defaultAddr = data.find((a) => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr._id);
      }
    },
  });

  // Initialize selected address once loaded if not already selected
  React.useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  // Create address mutation
  const addAddressMutation = useMutation({
    mutationFn: addressService.createAddress,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(created._id);
      setIsAddressModalOpen(false);
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
      });
      toast.success('Shipping address added!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add address');
    },
  });

  // Handle Razorpay Online Gateway trigger
  const handleRazorpayPayment = async (order) => {
    try {
      setIsProcessingPayment(true);
      const rzpData = await paymentService.initiatePayment(order._id);
      const isLoaded = await loadRazorpayScript();

      const selectedAddress = addresses.find((a) => a._id === selectedAddressId) || {};

      if (!isLoaded || !window.Razorpay) {
        // Fallback to interactive test sandbox modal
        setActivePaymentOrder({
          order,
          rzpData,
          selectedAddress,
        });
        setIsSimulateModalOpen(true);
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: rzpData.keyId,
        amount: rzpData.amountPaise,
        currency: rzpData.currency,
        name: 'ResCrafted',
        description: `Order ${rzpData.orderNumber}`,
        order_id: rzpData.providerOrderId,
        prefill: {
          name: selectedAddress.fullName || '',
          contact: selectedAddress.phone || '',
        },
        theme: {
          color: '#1E3A2B',
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.info('Payment window closed. You can complete payment from your order details page.');
            navigate(`/orders/${order._id}`, { replace: true });
          },
        },
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              orderId: rzpData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Payment verified & Order confirmed!');
            navigate(`/orders/${order._id}`, { replace: true });
          } catch (verifyErr) {
            toast.error(verifyErr.message || 'Payment signature verification failed.');
            navigate(`/orders/${order._id}`, { replace: true });
          } finally {
            setIsProcessingPayment(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setIsProcessingPayment(false);
      toast.error(err.message || 'Failed to initiate online payment.');
      navigate(`/orders/${order._id}`, { replace: true });
    }
  };

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: async (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      if (paymentMethod === 'cod') {
        toast.success(`Order ${order.orderNumber} confirmed with Cash on Delivery!`);
        navigate(`/orders/${order._id}`, { replace: true });
      } else {
        await handleRazorpayPayment(order);
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to place order. Please try again.');
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a shipping address');
      return;
    }
    placeOrderMutation.mutate({
      shippingAddressId: selectedAddressId,
      paymentMethod,
      notes: customerNotes,
    });
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!activePaymentOrder) return;
    try {
      setIsProcessingPayment(true);
      const { order, rzpData } = activePaymentOrder;
      const fakePaymentId = `pay_mock_${Date.now()}`;
      const mockSignature = `mock_sig_${rzpData.providerOrderId}_${fakePaymentId}`;

      await paymentService.verifyPayment({
        orderId: rzpData.orderId,
        razorpayOrderId: rzpData.providerOrderId,
        razorpayPaymentId: fakePaymentId,
        razorpaySignature: mockSignature,
      });

      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsSimulateModalOpen(false);
      toast.success('Test payment simulated & verified successfully!');
      navigate(`/orders/${order._id}`, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to verify simulated payment.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.postalCode) {
      toast.error('Please fill in all required address fields');
      return;
    }
    addAddressMutation.mutate(newAddress);
  };

  if (isCartLoading || isAddressesLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-6">
        <LoadingSkeleton type="text" count={2} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <LoadingSkeleton type="card" count={2} />
          </div>
          <div className="lg:col-span-4">
            <LoadingSkeleton type="card" count={1} />
          </div>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-forest-950">Your Cart is Empty</h2>
        <p className="text-sm text-charcoal-muted max-w-md">
          You don't have any circular products in your cart to checkout.
        </p>
        <Link to="/products">
          <Button variant="primary" size="md">
            Discover Sustainable Items
          </Button>
        </Link>
      </div>
    );
  }

  const { summary } = cart;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Cart
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-forest-950">
            Sustainable Checkout
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-forest-700 bg-forest-50 border border-forest-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-forest-800" />
          <span>Razorpay 256-Bit SSL Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Checkout Steps (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* STEP 1: Shipping Address */}
          <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft">
            <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-forest-800 text-white font-bold text-sm flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-bold text-forest-950 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-forest-700" /> Shipping Destination
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setIsAddressModalOpen(true)}
              >
                Add New Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-sand-200 rounded-2xl">
                <MapPin className="w-10 h-10 text-forest-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-forest-950 mb-1">
                  No saved addresses found
                </p>
                <p className="text-xs text-charcoal-muted mb-4">
                  Please provide a delivery address for your sustainable package.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsAddressModalOpen(true)}
                >
                  Add Shipping Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-forest-800 bg-forest-50/50 shadow-soft'
                          : 'border-sand-200 bg-white hover:border-sand-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-bold text-forest-950">
                          {addr.fullName}
                        </span>
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-forest-800" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-sand-300" />
                        )}
                      </div>
                      <p className="text-xs text-charcoal-muted leading-relaxed mb-2">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                        <br />
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs font-medium text-forest-900">
                        📞 {addr.phone}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method */}
          <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft">
            <div className="flex items-center gap-3 border-b border-sand-100 pb-4 mb-6">
              <span className="w-8 h-8 rounded-full bg-forest-800 text-white font-bold text-sm flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-bold text-forest-950 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-forest-700" /> Payment Preference
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Razorpay Online */}
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'razorpay'
                    ? 'border-forest-800 bg-forest-50/50 shadow-soft'
                    : 'border-sand-200 bg-white hover:border-sand-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-forest-950">
                      <CreditCard className="w-4 h-4 text-forest-700" />
                      <span>Razorpay Online Gateway</span>
                    </div>
                    {paymentMethod === 'razorpay' ? (
                      <CheckCircle2 className="w-5 h-5 text-forest-800" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-sand-300" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards & NetBanking via 256-Bit Razorpay.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-sand-200 flex items-center justify-between text-[11px] font-semibold text-forest-700">
                  <span>✓ Test & Live Mode Supported</span>
                  <Sparkles className="w-3.5 h-3.5 text-accentLime" />
                </div>
              </div>

              {/* Cash On Delivery / Direct */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-forest-800 bg-forest-50/50 shadow-soft'
                    : 'border-sand-200 bg-white hover:border-sand-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-forest-950">
                      <Banknote className="w-4 h-4 text-forest-700" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    {paymentMethod === 'cod' ? (
                      <CheckCircle2 className="w-5 h-5 text-forest-800" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-sand-300" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Pay securely in cash or via UPI QR code upon doorstep arrival. Zero digital surcharge.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-sand-200 text-[11px] font-semibold text-emerald-700">
                  ✓ Instant Confirmation
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Special Delivery Notes */}
          <div className="bg-white rounded-3xl border border-sand-200 p-6 md:p-8 shadow-soft">
            <div className="flex items-center gap-3 border-b border-sand-100 pb-4 mb-4">
              <span className="w-8 h-8 rounded-full bg-forest-800 text-white font-bold text-sm flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-bold text-forest-950 flex items-center gap-2">
                <Truck className="w-5 h-5 text-forest-700" /> Delivery Instructions & Notes
              </h2>
            </div>
            <textarea
              rows={3}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Leave package with apartment security, avoid plastic tape, or call before arrival..."
              className="w-full text-xs p-3.5 rounded-2xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-forest-800 bg-sand-50/30 text-charcoal"
            />
          </div>
        </div>

        {/* Right Column: Order Review & Placement (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
          <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-soft flex flex-col gap-5">
            <h3 className="text-base font-bold text-forest-950 border-b border-sand-100 pb-3">
              Order Review ({cart.itemCount} items)
            </h3>

            {/* Items Thumbnails Rail */}
            <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <img
                    src={
                      item.productId.imageUrl ||
                      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'
                    }
                    alt={item.productId.title}
                    className="w-12 h-12 rounded-xl object-cover border border-sand-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-forest-950 truncate">
                      {item.productId.title}
                    </p>
                    <p className="text-[11px] text-charcoal-muted">
                      Qty: {item.quantity} × {formatCurrency(item.productId.pricePaise)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-forest-900">
                    {formatCurrency(item.productId.pricePaise * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col gap-2.5 text-xs text-charcoal-muted pt-4 border-t border-sand-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-forest-950">
                  {formatCurrency(summary.subtotalPaise)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Carbon-Neutral Delivery</span>
                <span className="font-semibold text-forest-950">
                  {summary.shippingPaise === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(summary.shippingPaise)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Circular GST (5%)</span>
                <span className="font-semibold text-forest-950">
                  {formatCurrency(summary.taxPaise)}
                </span>
              </div>

              <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline text-base font-black text-forest-950">
                <span>Total Amount</span>
                <span className="text-2xl text-forest-900 font-sans">
                  {formatCurrency(summary.totalPaise)}
                </span>
              </div>
            </div>

            {/* Ecological Impact Badge */}
            <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-100 flex items-center gap-2.5 text-xs text-forest-900">
              <Leaf className="w-5 h-5 text-forest-700 flex-shrink-0" />
              <span>
                Your purchase diverts ~<strong>3.5 kg</strong> of waste from landfills.
              </span>
            </div>

            {/* Place Order Button */}
            <Button
              variant="primary"
              size="lg"
              loading={placeOrderMutation.isLoading || isProcessingPayment}
              disabled={!selectedAddressId || placeOrderMutation.isLoading || isProcessingPayment}
              onClick={handlePlaceOrder}
              className="w-full justify-center shadow-soft text-sm font-bold"
            >
              {placeOrderMutation.isLoading || isProcessingPayment
                ? 'Securing Order...'
                : paymentMethod === 'cod'
                ? `Place COD Order (${formatCurrency(summary.totalPaise)})`
                : `Pay with Razorpay (${formatCurrency(summary.totalPaise)})`}
            </Button>

            <p className="text-[11px] text-center text-charcoal-muted leading-tight">
              Protected by Razorpay 256-Bit SSL encryption & ResCrafted Guarantee.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Payment Modal (Fallback/Dev Sandbox Mode) */}
      <Modal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        title="Razorpay Test Gateway Sandbox"
        maxWidth="max-w-md"
      >
        {activePaymentOrder && (
          <div className="flex flex-col gap-5">
            <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-forest-700 block uppercase">
                  Order Number
                </span>
                <strong className="text-sm text-forest-950 font-mono">
                  {activePaymentOrder.rzpData.orderNumber}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-forest-700 block uppercase">
                  Amount
                </span>
                <strong className="text-base text-forest-950 font-sans">
                  {formatCurrency(activePaymentOrder.rzpData.amountPaise)}
                </strong>
              </div>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              This interactive test modal simulates the Razorpay Checkout popup in development. In production with live credentials, the official Razorpay payment sheet handles UPI, cards, and wallets.
            </p>

            <div className="border border-sand-200 rounded-2xl p-4 bg-sand-50/50 flex flex-col gap-2 text-xs">
              <span className="font-bold text-forest-950">Select Test Payment Instrument:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="p-2.5 rounded-xl border border-forest-200 bg-white font-semibold text-forest-900 text-center hover:bg-forest-50 transition-colors"
                >
                  🟢 UPI / GooglePay
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-xl border border-forest-200 bg-white font-semibold text-forest-900 text-center hover:bg-forest-50 transition-colors"
                >
                  💳 Debit / Credit Card
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSimulateModalOpen(false);
                  navigate(`/orders/${activePaymentOrder.order._id}`);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isProcessingPayment}
                onClick={handleSimulatePaymentSuccess}
              >
                Simulate Successful Capture
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add New Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add New Delivery Address"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddAddressSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Recipient Name"
            placeholder="e.g. Priya Sharma"
            value={newAddress.fullName}
            onChange={(e) =>
              setNewAddress((prev) => ({ ...prev, fullName: e.target.value }))
            }
            required
          />

          <Input
            label="Mobile Phone Number"
            placeholder="e.g. 9876543210"
            value={newAddress.phone}
            onChange={(e) =>
              setNewAddress((prev) => ({ ...prev, phone: e.target.value }))
            }
            required
          />

          <Input
            label="Address Line 1 (House, Apartment, Street)"
            placeholder="e.g. Flat 304, Green Palms Apt"
            value={newAddress.addressLine1}
            onChange={(e) =>
              setNewAddress((prev) => ({ ...prev, addressLine1: e.target.value }))
            }
            required
          />

          <Input
            label="Address Line 2 (Landmark, Area - Optional)"
            placeholder="e.g. Near Indiranagar Metro"
            value={newAddress.addressLine2}
            onChange={(e) =>
              setNewAddress((prev) => ({ ...prev, addressLine2: e.target.value }))
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="e.g. Bengaluru"
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress((prev) => ({ ...prev, city: e.target.value }))
              }
              required
            />
            <Input
              label="State"
              placeholder="e.g. Karnataka"
              value={newAddress.state}
              onChange={(e) =>
                setNewAddress((prev) => ({ ...prev, state: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code (PIN)"
              placeholder="e.g. 560038"
              value={newAddress.postalCode}
              onChange={(e) =>
                setNewAddress((prev) => ({ ...prev, postalCode: e.target.value }))
              }
              required
            />
            <Input
              label="Country"
              value={newAddress.country}
              disabled
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sand-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={addAddressMutation.isLoading}
            >
              Save & Deliver Here
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;

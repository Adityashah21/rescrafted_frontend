import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package, X, Copy, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API from '../api';

// Same UPI Modal reused
function UPIPaymentModal({ orderData, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [utr, setUtr] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const copyUPI = () => {
        navigator.clipboard.writeText(orderData.sellerUPI);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmitUTR = async () => {
        if (!utr || utr.length !== 12 || !/^\d+$/.test(utr)) {
            setError('UTR must be exactly 12 digits.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/orders/submit-utr', {
                orderId: orderData.orderId,
                utrNumber: utr
            });
            onSuccess(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit UTR.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Complete Payment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Product</span>
                            <span className="font-semibold text-gray-800">{orderData.productTitle}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Quantity</span>
                            <span className="font-semibold text-gray-800">{orderData.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-700">Total</span>
                            <span className="text-xl font-bold text-green-600">₹{orderData.totalAmount}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${step === 1 ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
                            <span>1</span> Pay UPI
                        </div>
                        <div className="flex-1 h-px bg-gray-200" />
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${step === 2 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <span>2</span> Submit UTR
                        </div>
                    </div>

                    {step === 1 && (
                        <div>
                            <p className="text-sm text-gray-600 mb-4">Pay <strong className="text-green-600">₹{orderData.totalAmount}</strong> to:</p>
                            <div className="bg-gray-50 border-2 border-dashed border-green-300 rounded-2xl p-5 text-center mb-4">
                                <p className="text-xs text-gray-400 mb-1">UPI ID</p>
                                <p className="text-xl font-bold text-gray-800 mb-1 break-all">{orderData.sellerUPI}</p>
                                <p className="text-sm text-gray-500 mb-3">Pay to: <strong>{orderData.sellerName}</strong></p>
                                <button onClick={copyUPI} className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy UPI ID'}
                                </button>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-amber-700">⚠️ After paying, note the <strong>12-digit UTR</strong> from your UPI app receipt.</p>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-all">
                                I've Paid — Enter UTR →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">UTR / Transaction Reference</label>
                            <input
                                type="text"
                                value={utr}
                                onChange={(e) => { setUtr(e.target.value.replace(/\D/g, '').slice(0, 12)); setError(''); }}
                                placeholder="12-digit UTR"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 mb-1"
                            />
                            <div className="flex justify-between mb-3">
                                <p className="text-xs text-gray-400">Numbers only</p>
                                <p className={`text-xs font-medium ${utr.length === 12 ? 'text-green-600' : 'text-gray-400'}`}>{utr.length}/12</p>
                            </div>
                            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-3 text-sm">{error}</div>}
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all">← Back</button>
                                <button onClick={handleSubmitUTR} disabled={loading || utr.length !== 12}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Submit UTR</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const [initiating, setInitiating] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [successItems, setSuccessItems] = useState([]);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const handleBuyItem = async (item) => {
        setInitiating(item._id);
        try {
            const { data } = await API.post('/orders/initiate', {
                productId: item._id,
                quantity: item.quantity
            });
            setOrderData(data);
            setShowModal(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to initiate payment.');
        } finally {
            setInitiating(null);
        }
    };

    const handlePaymentSuccess = () => {
        if (orderData) {
            setSuccessItems(prev => [...prev, orderData.productTitle]);
            // Find and remove item from cart
            const cartItem = cart.find(item =>
                item.title === orderData.productTitle
            );
            if (cartItem) removeFromCart(cartItem._id);
        }
        setShowModal(false);
        setOrderData(null);
    };

    if (cart.length === 0 && successItems.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Your Cart is Empty</h2>
                <p className="text-gray-400 mb-6">Add some products from the marketplace</p>
                <Link to="/marketplace" className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-medium inline-flex items-center gap-2">
                    Browse Marketplace <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            {showModal && orderData && (
                <UPIPaymentModal
                    orderData={orderData}
                    onClose={() => { setShowModal(false); setOrderData(null); }}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium">Clear All</button>
                    )}
                </div>

                {/* Success items */}
                {successItems.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                        <p className="text-green-700 font-medium text-sm">✓ UTR submitted for: {successItems.join(', ')}. Check <Link to="/orders" className="underline font-bold">My Orders</Link> for status.</p>
                    </div>
                )}

                {cart.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map(item => (
                                <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                        {item.images?.[0]?.url ? (
                                            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 mb-1 truncate">{item.title}</h3>
                                        <p className="text-sm text-gray-400 mb-2">₹{item.price} per {item.unit}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-all">
                                                    <Minus className="w-3 h-3 text-gray-600" />
                                                </button>
                                                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-all">
                                                    <Plus className="w-3 h-3 text-gray-600" />
                                                </button>
                                            </div>
                                            <span className="font-bold text-green-600">₹{item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button onClick={() => removeFromCart(item._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBuyItem(item)}
                                            disabled={initiating === item._id}
                                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-all font-medium">
                                            {initiating === item._id ? '...' : 'Buy'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-gray-800 mb-5">Summary</h2>
                                <div className="space-y-3 mb-5">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex justify-between text-sm text-gray-600">
                                            <span className="truncate mr-2">{item.title} ×{item.quantity}</span>
                                            <span className="font-medium flex-shrink-0">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800">
                                        <span>Total</span>
                                        <span className="text-green-600 text-lg">₹{cartTotal}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 text-center">Each item is purchased separately via UPI</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;
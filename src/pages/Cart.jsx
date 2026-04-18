import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API from '../api';
import { useState } from 'react';

function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const [payingItemId, setPayingItemId] = useState(null);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const handleBuyItem = async (item) => {
        setPayingItemId(item._id);
        try {
            const { data } = await API.post('/orders/create', {
                productId: item._id,
                quantity: item.quantity
            });

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'Rescrafted',
                description: `Purchase: ${item.title}`,
                order_id: data.orderId,
                handler: async function (response) {
                    try {
                        await API.post('/orders/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderDbId: data.orderDbId
                        });
                        removeFromCart(item._id);
                        alert('🎉 Payment Successful!');
                        navigate('/orders');
                    } catch {
                        alert('Payment verification failed.');
                    }
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: '#16a34a' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert(err.response?.data?.message || 'Payment failed.');
        } finally {
            setPayingItemId(null);
        }
    };

    if (cart.length === 0) return (
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
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
                    <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">Clear All</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
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
                                    <button onClick={() => handleBuyItem(item)} disabled={payingItemId === item._id}
                                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-all font-medium">
                                        {payingItemId === item._id ? '...' : 'Buy'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 mb-5">Order Summary</h2>
                            <div className="space-y-3 mb-5">
                                {cart.map(item => (
                                    <div key={item._id} className="flex justify-between text-sm text-gray-600">
                                        <span className="truncate mr-2">{item.title} x{item.quantity}</span>
                                        <span className="font-medium flex-shrink-0">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800">
                                    <span>Total</span>
                                    <span className="text-green-600 text-lg">₹{cartTotal}</span>
                                </div>
                            </div>
                            <Link to="/marketplace" className="block text-center text-sm text-green-600 hover:underline font-medium">
                                + Add More Items
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
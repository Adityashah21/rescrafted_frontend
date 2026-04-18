import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, User, ChevronDown, ChevronUp } from 'lucide-react';
import API from '../api';

const STATUS_CONFIG = {
    pending_utr: { label: 'Awaiting Payment', color: 'bg-gray-100 text-gray-600', icon: Clock },
    utr_submitted: { label: 'UTR Submitted', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', icon: XCircle },
};

function OrderCard({ order, isSeller, onAction }) {
    const [expanded, setExpanded] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [note, setNote] = useState('');
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_utr;
    const StatusIcon = status.icon;

    const handleAction = async (action) => {
        setActionLoading(action);
        try {
            await onAction(order._id, action, note);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
            order.status === 'utr_submitted' && isSeller ? 'border-amber-300' : 'border-gray-100'
        }`}>
            {/* New order badge for seller */}
            {isSeller && order.status === 'utr_submitted' && !order.isNotificationRead && (
                <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> New Order — UTR Submitted, Awaiting Your Confirmation
                </div>
            )}

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {order.product?.images?.[0]?.url ? (
                            <img src={order.product.images[0].url} alt={order.product.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800 truncate">{order.product?.title}</h3>
                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${status.color}`}>
                                <StatusIcon className="w-3 h-3" /> {status.label}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                            <span>Qty: <strong className="text-gray-700">{order.quantity}</strong></span>
                            <span>Amount: <strong className="text-green-600">₹{order.totalAmount}</strong></span>
                            <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>

                        {isSeller ? (
                            <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                Buyer: <strong className="text-gray-700">{order.buyer?.name}</strong> · {order.buyer?.email}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Seller: <strong className="text-gray-700">{order.seller?.name}</strong>
                            </p>
                        )}
                    </div>
                </div>

                {/* Expand toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded ? 'Less details' : 'More details'}
                </button>

                {/* Expanded Details */}
                {expanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {order.upiId && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">UPI Paid To</span>
                                <span className="font-medium text-gray-700">{order.upiId}</span>
                            </div>
                        )}
                        {order.utrNumber && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">UTR Number</span>
                                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{order.utrNumber}</span>
                            </div>
                        )}
                        {order.sellerNote && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 mb-1">Seller Note</p>
                                <p className="text-sm text-gray-700">{order.sellerNote}</p>
                            </div>
                        )}
                        {isSeller && order.buyer?.phoneNumber && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Buyer Phone</span>
                                <span className="font-medium text-gray-700">📞 {order.buyer.phoneNumber}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Seller Actions — confirm or reject */}
                {isSeller && order.status === 'utr_submitted' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            UTR: <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">{order.utrNumber}</span>
                        </p>
                        <p className="text-xs text-gray-400 mb-3">Verify this UTR in your UPI app / bank statement before confirming.</p>
                        <div className="mb-3">
                            <input
                                type="text"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Add a note (optional)"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAction('rejected')}
                                disabled={actionLoading !== null}
                                className="flex-1 flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 py-2.5 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50 transition-all text-sm">
                                {actionLoading === 'rejected' ? (
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><XCircle className="w-4 h-4" /> Reject</>
                                )}
                            </button>
                            <button
                                onClick={() => handleAction('confirmed')}
                                disabled={actionLoading !== null}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-all text-sm">
                                {actionLoading === 'confirmed' ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> Confirm Order</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Buyer cancel option */}
                {!isSeller && order.status === 'pending_utr' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => onAction(order._id, 'cancel')}
                            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                            Cancel Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isSeller = user?.role === 'scrap_seller' || user?.role === 'craft_seller';

    useEffect(() => {
        fetchOrders();
        if (isSeller) markRead();
    }, []);

    const fetchOrders = async () => {
        try {
            const endpoint = isSeller ? '/orders/seller' : '/orders/buyer';
            const { data } = await API.get(endpoint);
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markRead = async () => {
        try { await API.put('/orders/notifications/read'); } catch { }
    };

    const handleAction = async (orderId, action, note = '') => {
        try {
            if (action === 'cancel') {
                await API.put(`/orders/cancel/${orderId}`);
            } else {
                await API.put('/orders/status', { orderId, action, note });
            }
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed.');
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const filterOptions = isSeller
        ? [
            { value: 'all', label: 'All' },
            { value: 'utr_submitted', label: '⏳ Pending' },
            { value: 'confirmed', label: '✓ Confirmed' },
            { value: 'rejected', label: '✗ Rejected' },
          ]
        : [
            { value: 'all', label: 'All' },
            { value: 'pending_utr', label: 'Pending' },
            { value: 'utr_submitted', label: 'UTR Sent' },
            { value: 'confirmed', label: '✓ Confirmed' },
            { value: 'rejected', label: '✗ Rejected' },
          ];

    const pendingCount = orders.filter(o => o.status === 'utr_submitted').length;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isSeller ? 'Orders Received' : 'My Orders'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isSeller
                                ? `${pendingCount > 0 ? `${pendingCount} order(s) need confirmation` : 'Manage incoming orders'}`
                                : 'Track your purchase history'}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {filterOptions.map(opt => (
                        <button key={opt.value} onClick={() => setFilter(opt.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                filter === opt.value ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'
                            }`}>
                            {opt.label}
                            {opt.value === 'utr_submitted' && pendingCount > 0 && isSeller && (
                                <span className="ml-1.5 bg-amber-500 text-white text-xs w-5 h-5 inline-flex items-center justify-center rounded-full font-bold">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders</h3>
                        <p className="text-gray-400">{filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                isSeller={isSeller}
                                onAction={handleAction}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Package, Plus, Trash2, ShoppingBag, Heart,
    LayoutDashboard, User, MapPin, Phone,
    TrendingUp, Star, Recycle, Palette,
    Bell, CreditCard, ShoppingCart, CheckCircle, Clock
} from 'lucide-react';
import API from '../api';

// ─────────────────────────────────────────
// SCRAP SELLER DASHBOARD
// ─────────────────────────────────────────
function ScrapSellerDashboard({ user }) {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState('listings');

    useEffect(() => {
        fetchMyProducts();
        fetchOrders();
    }, []);

    const fetchMyProducts = async () => {
        try {
            const { data } = await API.get(`/products/user/${user._id}`);
            setProducts(data);
        } catch { } finally { setLoadingProducts(false); }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders/seller');
            setOrders(data);
            await API.put('/orders/notifications/read');
        } catch { } finally { setLoadingOrders(false); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await API.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
    };

    const unreadOrders = orders.filter(o => !o.isNotificationRead).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                    <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
                        <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Listed Items</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">₹{totalValue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Inventory Value</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Orders Received</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">₹{orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Earned</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mb-6">
                <Link to="/add-product" className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-all font-medium text-sm">
                    <Plus className="w-4 h-4" /> Add Listing
                </Link>
                <Link to="/bank-details" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                    <CreditCard className="w-4 h-4" /> Bank Details
                </Link>
                <Link to="/orders" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                    <ShoppingBag className="w-4 h-4" /> All Orders
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                <button onClick={() => setActiveTab('listings')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'listings' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    My Listings ({products.length})
                </button>
                <button onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    Orders
                    {unreadOrders > 0 && <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadOrders}</span>}
                </button>
            </div>

            {/* Listings Tab */}
            {activeTab === 'listings' && (
                loadingProducts ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Recycle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No scrap listed yet</p>
                        <Link to="/add-product" className="bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-all text-sm font-medium">+ List First Item</Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-5 py-4 text-gray-500 font-medium">Product</th>
                                    <th className="text-left px-4 py-4 text-gray-500 font-medium hidden sm:table-cell">Price</th>
                                    <th className="text-left px-4 py-4 text-gray-500 font-medium hidden sm:table-cell">Stock</th>
                                    <th className="text-right px-5 py-4 text-gray-500 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {product.images?.[0]?.url ? (
                                                        <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                                                    ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-400" /></div>}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{product.title}</p>
                                                    <p className="text-xs text-gray-400 sm:hidden">₹{product.price} · Stock: {product.stock}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-gray-800 hidden sm:table-cell">₹{product.price}</td>
                                        <td className="px-4 py-4 text-gray-600 hidden sm:table-cell">{product.stock}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/product/${product._id}`} className="text-xs text-blue-500 hover:text-blue-700 font-medium">View</Link>
                                                <button onClick={() => deleteProduct(product._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                loadingOrders ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No orders received yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className={`bg-white rounded-2xl border p-5 ${!order.isNotificationRead ? 'border-green-300 bg-green-50' : 'border-gray-100'}`}>
                                {!order.isNotificationRead && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-1 rounded-full font-medium mb-3">
                                        <Bell className="w-3 h-3" /> New Order
                                    </span>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                        {order.product?.images?.[0]?.url ? (
                                            <img src={order.product.images[0].url} alt={order.product.title} className="w-full h-full object-cover" />
                                        ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{order.product?.title}</p>
                                        <p className="text-sm text-gray-500">Qty: {order.quantity} · <strong className="text-green-600">₹{order.totalAmount}</strong></p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            👤 {order.buyer?.name} · {order.buyer?.email}
                                            {order.buyer?.phoneNumber && ` · 📞 ${order.buyer.phoneNumber}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">✓ Paid</span>
                                        <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// CRAFT SELLER DASHBOARD
// ─────────────────────────────────────────
function CraftSellerDashboard({ user }) {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState('listings');

    useEffect(() => {
        fetchMyProducts();
        fetchOrders();
    }, []);

    const fetchMyProducts = async () => {
        try {
            const { data } = await API.get(`/products/user/${user._id}`);
            setProducts(data);
        } catch { } finally { setLoadingProducts(false); }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders/seller');
            setOrders(data);
            await API.put('/orders/notifications/read');
        } catch { } finally { setLoadingOrders(false); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await API.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
    };

    const unreadOrders = orders.filter(o => !o.isNotificationRead).length;

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                        <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Crafts Listed</p>
                </div>
                <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4">
                    <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center mb-2">
                        <Star className="w-5 h-5 text-pink-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">₹{products.reduce((s, p) => s + p.price * p.stock, 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Catalogue Value</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Orders Received</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">₹{orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Earned</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Link to="/add-product" className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-all font-medium text-sm">
                    <Plus className="w-4 h-4" /> Add Craft
                </Link>
                <Link to="/bank-details" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                    <CreditCard className="w-4 h-4" /> Bank Details
                </Link>
                <Link to="/orders" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                    <ShoppingBag className="w-4 h-4" /> All Orders
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                <button onClick={() => setActiveTab('listings')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'listings' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                    My Crafts ({products.length})
                </button>
                <button onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                    Orders
                    {unreadOrders > 0 && <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadOrders}</span>}
                </button>
            </div>

            {activeTab === 'listings' && (
                loadingProducts ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Palette className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No crafts listed yet</p>
                        <Link to="/add-product" className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-all text-sm font-medium">+ List First Craft</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {products.map(product => (
                            <div key={product._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                                <div className="aspect-video bg-gray-100 overflow-hidden">
                                    {product.images?.[0]?.url ? (
                                        <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full flex items-center justify-center"><Palette className="w-8 h-8 text-gray-300" /></div>}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-1">{product.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-green-600">₹{product.price}</span>
                                        <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Link to={`/product/${product._id}`} className="flex-1 text-center text-xs bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all font-medium">View</Link>
                                        <button onClick={() => deleteProduct(product._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'orders' && (
                loadingOrders ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No orders received yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className={`bg-white rounded-2xl border p-5 ${!order.isNotificationRead ? 'border-purple-300 bg-purple-50' : 'border-gray-100'}`}>
                                {!order.isNotificationRead && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-purple-600 text-white px-2.5 py-1 rounded-full font-medium mb-3">
                                        <Bell className="w-3 h-3" /> New Order
                                    </span>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                        {order.product?.images?.[0]?.url ? (
                                            <img src={order.product.images[0].url} alt={order.product.title} className="w-full h-full object-cover" />
                                        ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{order.product?.title}</p>
                                        <p className="text-sm text-gray-500">Qty: {order.quantity} · <strong className="text-green-600">₹{order.totalAmount}</strong></p>
                                        <p className="text-sm text-gray-500 mt-1">👤 {order.buyer?.name} · {order.buyer?.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">✓ Paid</span>
                                        <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// SCRAP BUYER DASHBOARD
// ─────────────────────────────────────────
function ScrapBuyerDashboard({ user }) {
    const [scrapProducts, setScrapProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState('browse');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await API.get('/products');
                setScrapProducts(data.filter(p => p.category === 'scrap'));
            } catch { } finally { setLoadingProducts(false); }
        };
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/buyer');
                setOrders(data);
            } catch { } finally { setLoadingOrders(false); }
        };
        fetchData();
        fetchOrders();
    }, []);

    return (
        <div>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 mb-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <Recycle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Welcome, {user.name.split(' ')[0]}!</h2>
                        <p className="text-blue-200 text-sm">Source quality scrap materials</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white bg-opacity-15 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold">{scrapProducts.length}</p>
                        <p className="text-blue-200 text-xs">Scrap Available</p>
                    </div>
                    <div className="bg-white bg-opacity-15 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold">{orders.length}</p>
                        <p className="text-blue-200 text-xs">My Orders</p>
                    </div>
                    <div className="bg-white bg-opacity-15 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold">₹{orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</p>
                        <p className="text-blue-200 text-xs">Total Spent</p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-3 mb-6">
                <Link to="/marketplace" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-medium text-sm">
                    <ShoppingBag className="w-4 h-4" /> Browse Scrap
                </Link>
                <Link to="/cart" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                    <ShoppingCart className="w-4 h-4" /> My Cart
                </Link>
                <Link to="/orders" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                    <Package className="w-4 h-4" /> All Orders
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                <button onClick={() => setActiveTab('browse')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                    Scrap Materials
                </button>
                <button onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                    My Orders ({orders.length})
                </button>
            </div>

            {activeTab === 'browse' && (
                loadingProducts ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scrapProducts.slice(0, 6).map(product => (
                            <Link to={`/product/${product._id}`} key={product._id}
                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all flex gap-4 items-center">
                                <div className="w-16 h-16 bg-orange-50 rounded-xl overflow-hidden flex-shrink-0">
                                    {product.images?.[0]?.url ? (
                                        <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full flex items-center justify-center"><Recycle className="w-6 h-6 text-orange-300" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">{product.title}</p>
                                    <p className="text-xs text-gray-400 mb-1">{product.subCategory || 'Scrap'} · {product.unit}</p>
                                    <p className="font-bold text-green-600">₹{product.price}</p>
                                </div>
                            </Link>
                        ))}
                        {scrapProducts.length === 0 && (
                            <div className="col-span-3 text-center py-10 text-gray-400">No scrap materials available</div>
                        )}
                    </div>
                )
            )}

            {activeTab === 'orders' && (
                loadingOrders ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No orders yet</p>
                        <Link to="/marketplace" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all text-sm font-medium">Browse & Buy Scrap</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                    {order.product?.images?.[0]?.url ? (
                                        <img src={order.product.images[0].url} alt={order.product.title} className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{order.product?.title}</p>
                                    <p className="text-sm text-gray-500">Qty: {order.quantity} · Seller: {order.seller?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">₹{order.totalAmount}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// CRAFT BUYER DASHBOARD
// ─────────────────────────────────────────
function CraftBuyerDashboard({ user }) {
    const [craftProducts, setCraftProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState('browse');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await API.get('/products');
                setCraftProducts(data.filter(p => p.category === 'handicraft'));
            } catch { } finally { setLoadingProducts(false); }
        };
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/buyer');
                setOrders(data);
            } catch { } finally { setLoadingOrders(false); }
        };
        fetchData();
        fetchOrders();
    }, []);

    return (
        <div>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-6 mb-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Welcome, {user.name.split(' ')[0]}!</h2>
                        <p className="text-pink-100 text-sm">Explore unique handcrafted items</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white bg-opacity-15 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold">{craftProducts.length}</p>
                        <p className="text-pink-100 text-xs">Crafts Available</p>
                    </div>
                    <div className="bg-white bg-opacity-15 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold">{orders.length}</p>
                        <p className="text-pink-100 text-xs">My Orders</p>
                    </div>
                    <div className="bg-white bg-opacity-15 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold">₹{orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</p>
                        <p className="text-pink-100 text-xs">Total Spent</p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-3 mb-6">
                <Link to="/marketplace" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-all font-medium text-sm">
                    <Heart className="w-4 h-4" /> Browse Crafts
                </Link>
                <Link to="/cart" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                    <ShoppingCart className="w-4 h-4" /> My Cart
                </Link>
                <Link to="/orders" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                    <Package className="w-4 h-4" /> All Orders
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                <button onClick={() => setActiveTab('browse')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                    Featured Crafts
                </button>
                <button onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                    My Orders ({orders.length})
                </button>
            </div>

            {activeTab === 'browse' && (
                loadingProducts ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {craftProducts.slice(0, 8).map(product => (
                            <Link to={`/product/${product._id}`} key={product._id}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                                <div className="aspect-square bg-purple-50 overflow-hidden">
                                    {product.images?.[0]?.url ? (
                                        <img src={product.images[0].url} alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : <div className="w-full h-full flex items-center justify-center"><Palette className="w-8 h-8 text-purple-300" /></div>}
                                </div>
                                <div className="p-3">
                                    <p className="font-semibold text-gray-800 text-xs mb-1 line-clamp-2">{product.title}</p>
                                    <p className="font-bold text-green-600 text-sm">₹{product.price}</p>
                                </div>
                            </Link>
                        ))}
                        {craftProducts.length === 0 && (
                            <div className="col-span-4 text-center py-10 text-gray-400">No handicrafts available</div>
                        )}
                    </div>
                )
            )}

            {activeTab === 'orders' && (
                loadingOrders ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No orders yet</p>
                        <Link to="/marketplace" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm font-medium">Browse Crafts</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                    {order.product?.images?.[0]?.url ? (
                                        <img src={order.product.images[0].url} alt={order.product.title} className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{order.product?.title}</p>
                                    <p className="text-sm text-gray-500">Qty: {order.quantity} · By: {order.seller?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">₹{order.totalAmount}</p>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Paid</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// MAIN DASHBOARD WRAPPER
// ─────────────────────────────────────────
function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { navigate('/login'); return; }
        try { setUser(JSON.parse(stored)); } catch { navigate('/login'); }
    }, []);

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const roleConfig = {
        scrap_seller: { label: 'Scrap Seller', emoji: '♻️', color: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
        craft_seller: { label: 'Craft Seller', emoji: '🎨', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
        scrap_buyer: { label: 'Scrap Buyer', emoji: '🔩', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
        craft_buyer: { label: 'Craft Buyer', emoji: '🛍️', color: 'bg-pink-100 text-pink-700', border: 'border-pink-200' },
    };
    const config = roleConfig[user.role] || {};

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-2xl font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${config.color} ${config.border}`}>
                                    {config.emoji} {config.label}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{user.email}</span>
                                {user.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{user.phoneNumber}</span>}
                                {user.address && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{user.address}</span>}
                            </div>
                        </div>
                        <LayoutDashboard className="w-5 h-5 text-gray-300 hidden sm:block" />
                    </div>
                </div>

                {user.role === 'scrap_seller' && <ScrapSellerDashboard user={user} />}
                {user.role === 'craft_seller' && <CraftSellerDashboard user={user} />}
                {user.role === 'scrap_buyer' && <ScrapBuyerDashboard user={user} />}
                {user.role === 'craft_buyer' && <CraftBuyerDashboard user={user} />}
            </div>
        </div>
    );
}

export default Dashboard;
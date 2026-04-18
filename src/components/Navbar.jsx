import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, LayoutDashboard, LogOut, Menu, X, Plus, ShoppingCart, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API from '../api';

function Navbar() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount } = useCart();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { setUser(null); }
        } else {
            setUser(null);
        }
    }, [location]);

    useEffect(() => {
        if (user?.role === 'scrap_seller' || user?.role === 'craft_seller') {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await API.get('/orders/notifications/count');
            setUnreadCount(data.count);
        } catch { }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        setUser(null);
        navigate('/login');
    };

    const isSeller = user?.role === 'scrap_seller' || user?.role === 'craft_seller';
    const isBuyer = user?.role === 'scrap_buyer' || user?.role === 'craft_buyer';

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-green-600 p-1.5 rounded-lg">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-green-700">Rescrafted</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-5">
                        <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Home</Link>
                        <Link to="/marketplace" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Marketplace</Link>

                        {user ? (
                            <>
                                {isSeller && (
                                    <>
                                        <Link to="/add-product" className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all font-medium">
                                            <Plus className="w-4 h-4" /> Sell
                                        </Link>
                                        <Link to="/dashboard" className="relative flex items-center gap-1.5 text-gray-600 hover:text-green-600 font-medium transition-colors">
                                            <Bell className="w-4 h-4" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}

                                {isBuyer && (
                                    <Link to="/cart" className="relative flex items-center gap-1.5 text-gray-600 hover:text-green-600 font-medium transition-colors">
                                        <ShoppingCart className="w-5 h-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 font-medium transition-colors">
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>

                                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-700 font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <button onClick={logout} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-medium transition-colors">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Login</Link>
                                <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all font-medium">Register</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden pb-4 pt-2 space-y-2 border-t border-gray-100">
                        <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">Home</Link>
                        <Link to="/marketplace" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">Marketplace</Link>
                        {user ? (
                            <>
                                {isSeller && <Link to="/add-product" onClick={() => setMenuOpen(false)} className="block px-3 py-2 bg-green-600 text-white rounded-xl font-medium">+ Sell Product</Link>}
                                {isBuyer && (
                                    <Link to="/cart" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                        🛒 Cart {cartCount > 0 && `(${cartCount})`}
                                    </Link>
                                )}
                                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">Dashboard</Link>
                                <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">Login</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 bg-green-600 text-white rounded-xl font-medium">Register</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
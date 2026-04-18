import { useState, useEffect } from 'react';
import { Search, Filter, Package, RefreshCw, ShoppingCart, Lock } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import API from '../api';

function Marketplace() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [error, setError] = useState('');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Determine allowed categories based on role
    const getAllowedCategory = () => {
        if (!user) return 'all';
        if (user.role === 'scrap_seller' || user.role === 'scrap_buyer') return 'scrap';
        if (user.role === 'craft_seller' || user.role === 'craft_buyer') return 'handicraft';
        return 'all';
    };

    const allowedCategory = getAllowedCategory();

    useEffect(() => {
        // Set default category filter based on role
        if (allowedCategory !== 'all') {
            setCategory(allowedCategory);
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        let result = products;
        // Enforce role-based filtering
        if (allowedCategory !== 'all') {
            result = result.filter(p => p.category === allowedCategory);
        } else if (category !== 'all') {
            result = result.filter(p => p.category === category);
        }
        if (search) {
            result = result.filter(p =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFiltered(result);
    }, [search, category, products]);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await API.get('/products');
            setProducts(data);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = () => {
        if (user?.role === 'scrap_buyer' || user?.role === 'scrap_seller') return '♻️ Scrap Materials';
        if (user?.role === 'craft_buyer' || user?.role === 'craft_seller') return '🎨 Handicrafts';
        return 'All Products';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Marketplace</h1>
                    {user ? (
                        <div className="flex items-center gap-2">
                            <p className="text-gray-500">Showing</p>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                allowedCategory === 'scrap' ? 'bg-orange-100 text-orange-700' :
                                allowedCategory === 'handicraft' ? 'bg-purple-100 text-purple-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {getRoleLabel()}
                            </span>
                            <p className="text-gray-500">for your role</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Discover sustainable scrap materials and handcrafted products</p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text" placeholder="Search products..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>

                    {/* Only show category toggle if not role-restricted */}
                    {allowedCategory === 'all' && (
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            {['all', 'scrap', 'handicraft'].map(cat => (
                                <button key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                                        category === cat
                                            ? 'bg-green-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                    {cat === 'all' ? 'All' : cat === 'scrap' ? '♻️ Scrap' : '🎨 Handicraft'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Role restriction notice */}
                {user && allowedCategory !== 'all' && (
                    <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 ${
                        allowedCategory === 'scrap' ? 'bg-orange-50 border border-orange-100' : 'bg-purple-50 border border-purple-100'
                    }`}>
                        <Lock className={`w-4 h-4 ${allowedCategory === 'scrap' ? 'text-orange-500' : 'text-purple-500'}`} />
                        <p className={`text-sm font-medium ${allowedCategory === 'scrap' ? 'text-orange-700' : 'text-purple-700'}`}>
                            As a <strong>{user.role.replace('_', ' ')}</strong>, you can only view {allowedCategory === 'scrap' ? 'scrap materials' : 'handicraft products'}.
                        </p>
                    </div>
                )}

                {!loading && !error && (
                    <p className="text-sm text-gray-500 mb-5">
                        Showing <span className="font-semibold text-gray-700">{filtered.length}</span> products
                    </p>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button onClick={fetchProducts} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all mx-auto">
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                        <p className="text-gray-400">Try adjusting your search.</p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filtered.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default Marketplace;
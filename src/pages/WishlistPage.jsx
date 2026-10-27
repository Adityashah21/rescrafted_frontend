import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import SustainabilityBadge from '../components/common/SustainabilityBadge';

const WishlistPage = () => {
  const { wishlistProducts, removeFromWishlist, moveToCart, isLoading } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-4 shadow-soft">
          <Heart className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-forest-950 mb-2">Saved Sustainable Items</h2>
        <p className="text-xs text-charcoal-muted mb-6 leading-relaxed">
          Sign in to view and manage products you have saved across your devices.
        </p>
        <Link to="/login?redirect=/wishlist">
          <Button variant="primary" size="md">
            Sign In to View Wishlist
          </Button>
        </Link>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save your favorite handcrafted, upcycled, and restored items here to purchase later."
        actionLabel="Explore Marketplace"
        onAction={() => (window.location.href = '/products')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-sans">
            My Wishlist ({wishlistProducts.length} item{wishlistProducts.length > 1 ? 's' : ''})
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Keep track of unique circular crafts and restored electronics you love.
          </p>
        </div>

        <Link to="/products" className="text-xs font-bold text-forest-800 hover:underline">
          Browse More Products →
        </Link>
      </div>

      {/* Grid of Wishlisted Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => {
          const isOutOfStock = product.stockQuantity <= 0;
          const imageUrl =
            product.images?.[0]?.url ||
            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600';

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-square w-full bg-sand-100 overflow-hidden">
                <Link to={`/products/${product.slug}`}>
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="absolute top-2.5 left-2.5">
                  <SustainabilityBadge condition={product.condition} />
                </div>

                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-charcoal hover:text-red-600 transition-colors shadow-soft"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-1 gap-2">
                <span className="text-[11px] font-medium text-sage-700">
                  {product.sellerId?.storeName || 'Artisan Workshop'}
                </span>

                <Link
                  to={`/products/${product.slug}`}
                  className="text-sm font-semibold text-forest-950 hover:text-forest-700 transition-colors line-clamp-2"
                >
                  {product.title}
                </Link>

                <div className="flex items-baseline gap-2 mt-auto pt-2">
                  <span className="text-base font-bold text-forest-900">
                    {formatCurrency(product.pricePaise)}
                  </span>
                  {product.compareAtPricePaise && (
                    <span className="text-xs text-charcoal-light line-through">
                      {formatCurrency(product.compareAtPricePaise)}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-sand-100 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ShoppingBag}
                    disabled={isOutOfStock || isLoading}
                    onClick={() => moveToCart(product._id)}
                    className="w-full justify-center"
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;

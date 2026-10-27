import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import SustainabilityBadge from '../common/SustainabilityBadge';
import PriceDisplay from '../common/PriceDisplay';
import RatingDisplay from '../common/RatingDisplay';

const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  isAddingToCart = false,
}) => {
  if (!product) return null;

  const {
    slug,
    title,
    pricePaise,
    compareAtPricePaise,
    condition,
    images = [],
    sustainabilitySpecs,
    ratingsSummary,
    sellerId,
    stockQuantity = 0,
  } = product;

  const primaryImage =
    images.find((img) => img.isPrimary)?.url ||
    images[0]?.url ||
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600';

  const isOutOfStock = stockQuantity <= 0;
  const storeName = typeof sellerId === 'object' ? sellerId.storeName : 'ResCrafted Artisan';

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300">
      {/* Image & Overlays */}
      <div className="relative w-full aspect-square bg-sand-100 overflow-hidden">
        <Link to={`/products/${slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Sustainability Badge Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          <SustainabilityBadge
            condition={condition}
            recycledPercentage={sustainabilitySpecs?.recycledPercentage}
          />
        </div>

        {/* Wishlist Button Top Right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist?.(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-colors ${
            isWishlisted
              ? 'bg-red-50 text-red-600 shadow-sm'
              : 'bg-white/80 text-charcoal-muted hover:text-red-500 hover:bg-white shadow-soft'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-wider bg-charcoal/80 px-3 py-1.5 rounded-full border border-white/20">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Body Information */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Store Name & Rating */}
        <div className="flex items-center justify-between text-xs text-charcoal-light">
          <span className="font-medium truncate max-w-[140px] text-sage-700">
            {storeName}
          </span>
          <RatingDisplay
            rating={ratingsSummary?.averageRating || 0}
            reviewCount={ratingsSummary?.reviewCount || 0}
            size="xs"
          />
        </div>

        {/* Title */}
        <Link
          to={`/products/${slug}`}
          className="text-sm font-semibold text-forest-950 line-clamp-2 hover:text-forest-700 transition-colors leading-snug"
        >
          {title}
        </Link>

        {/* Environmental Quick Metric */}
        {sustainabilitySpecs?.estimatedCo2SavedKg > 0 && (
          <div className="text-[11px] text-forest-700 font-medium flex items-center gap-1">
            <span>🌱</span>
            <span>Est. ~{sustainabilitySpecs.estimatedCo2SavedKg}kg CO₂ diverted</span>
          </div>
        )}

        {/* Price and Cart Action */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-sand-100">
          <PriceDisplay
            pricePaise={pricePaise}
            compareAtPricePaise={compareAtPricePaise}
            size="sm"
          />

          <button
            onClick={() => onAddToCart?.(product)}
            disabled={isOutOfStock || isAddingToCart}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-forest-50 text-forest-800 hover:bg-forest-800 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-forest-200"
            aria-label={`Add ${title} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

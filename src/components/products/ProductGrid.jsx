import React from 'react';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';

const ProductGrid = ({
  products = [],
  isLoading = false,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  emptyTitle = 'No products found',
  emptyDescription = 'There are no sustainable items matching your selection at the moment.',
  onResetFilters,
}) => {
  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear Filters' : 'Explore All Products'}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id || product.slug}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistIds.includes(product._id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;

import React from 'react';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';

const PriceDisplay = ({
  pricePaise,
  compareAtPricePaise,
  size = 'md',
  showDiscount = true,
  className = '',
}) => {
  const discount = calculateDiscount(pricePaise, compareAtPricePaise);

  const sizes = {
    sm: {
      price: 'text-sm font-semibold text-forest-900',
      compare: 'text-xs text-charcoal-light line-through',
      discount: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      price: 'text-lg font-bold text-forest-900',
      compare: 'text-sm text-charcoal-light line-through',
      discount: 'text-xs px-2 py-0.5',
    },
    lg: {
      price: 'text-2xl font-extrabold text-forest-900',
      compare: 'text-base text-charcoal-light line-through',
      discount: 'text-xs px-2.5 py-1',
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={currentSize.price}>{formatCurrency(pricePaise)}</span>

      {compareAtPricePaise && compareAtPricePaise > pricePaise && (
        <span className={currentSize.compare}>
          {formatCurrency(compareAtPricePaise)}
        </span>
      )}

      {showDiscount && discount > 0 && (
        <span
          className={`font-semibold bg-emerald-100 text-emerald-800 rounded-md ${currentSize.discount}`}
        >
          {discount}% OFF
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;

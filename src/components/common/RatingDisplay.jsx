import React from 'react';
import { Star } from 'lucide-react';

const RatingDisplay = ({
  rating = 0,
  reviewCount = 0,
  size = 'sm',
  showCount = true,
  className = '',
}) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    xs: 'text-[11px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const currentIconSize = iconSizes[size] || iconSizes.sm;
  const currentTextSize = textSizes[size] || textSizes.sm;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = rating >= star - 0.5 && rating < star;

          return (
            <Star
              key={star}
              className={`${currentIconSize} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-200 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>

      <span className={`font-semibold text-charcoal ${currentTextSize}`}>
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </span>

      {showCount && reviewCount > 0 && (
        <span className={`text-charcoal-light ${currentTextSize}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;

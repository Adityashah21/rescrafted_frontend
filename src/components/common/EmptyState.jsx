import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white/60 rounded-2xl border border-dashed border-sand-300 max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4 shadow-soft">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-forest-900 mb-2">{title}</h3>
      <p className="text-sm text-charcoal-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {actionLabel && onAction && (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="ghost" size="md" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

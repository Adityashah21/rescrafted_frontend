import React from 'react';
import { Leaf, Recycle, RefreshCw, Sparkles, PackageCheck } from 'lucide-react';
import Badge from './Badge';

const SustainabilityBadge = ({ condition, recycledPercentage, packagingType, className = '' }) => {
  if (condition) {
    const conditionConfig = {
      upcycled: {
        label: 'Upcycled Craft',
        variant: 'forest',
        icon: Sparkles,
      },
      recycled: {
        label: recycledPercentage ? `${recycledPercentage}% Recycled` : 'Recycled Materials',
        variant: 'lime',
        icon: Recycle,
      },
      refurbished: {
        label: 'Refurbished',
        variant: 'info',
        icon: RefreshCw,
      },
      'pre-owned': {
        label: 'Pre-owned / Vintage',
        variant: 'neutral',
        icon: Leaf,
      },
    };

    const config = conditionConfig[condition] || {
      label: condition,
      variant: 'forest',
      icon: Leaf,
    };

    return (
      <Badge variant={config.variant} icon={config.icon} className={className}>
        {config.label}
      </Badge>
    );
  }

  if (packagingType === 'zero_waste') {
    return (
      <Badge variant="sage" icon={PackageCheck} className={className}>
        Zero Waste Packaging
      </Badge>
    );
  }

  return (
    <Badge variant="forest" icon={Leaf} className={className}>
      Sustainable
    </Badge>
  );
};

export default SustainabilityBadge;

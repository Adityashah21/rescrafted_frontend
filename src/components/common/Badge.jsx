import React from 'react';

const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon: Icon,
}) => {
  const variants = {
    neutral: 'bg-sand-100 text-charcoal-muted border-sand-200',
    forest: 'bg-forest-50 text-forest-800 border-forest-200',
    sage: 'bg-sage-100 text-sage-800 border-sage-200',
    lime: 'bg-lime-100 text-lime-900 border-lime-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

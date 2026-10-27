import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      type = 'button',
      className = '',
      icon: Icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-forest-800 text-white hover:bg-forest-900 focus:ring-forest-700 shadow-sm hover:shadow',
      secondary:
        'bg-forest-100 text-forest-800 hover:bg-forest-200 focus:ring-forest-400 border border-forest-200',
      outline:
        'bg-transparent border border-forest-600 text-forest-800 hover:bg-forest-50 focus:ring-forest-500',
      accent:
        'bg-accentLime text-forest-950 font-semibold hover:bg-lime-500 focus:ring-accentLime shadow-sm',
      ghost:
        'bg-transparent text-charcoal hover:bg-sand-100 focus:ring-sand-300',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

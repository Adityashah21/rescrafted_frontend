import React from 'react';

const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      id,
      name,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 6)}`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-charcoal flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 text-charcoal-light pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder-charcoal-light/60 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-sand-100 disabled:cursor-not-allowed ${
              Icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-sand-300 focus:border-forest-600 focus:ring-forest-100'
            } ${className}`}
            {...props}
          />
        </div>

        {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-charcoal-light">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

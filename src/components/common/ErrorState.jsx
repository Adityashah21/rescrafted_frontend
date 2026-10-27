import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Unable to load content',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-red-50/50 rounded-2xl border border-red-200 max-w-md mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-red-950 mb-1">{title}</h3>
      <p className="text-xs text-red-800/80 mb-5 max-w-xs">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={onRetry}
          className="border-red-300 text-red-800 hover:bg-red-100"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-sand-200/70 rounded-lg ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-sand-200 p-3 flex flex-col gap-3 shadow-soft">
    <Skeleton className="w-full aspect-square rounded-xl" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-4 w-12 rounded" />
    </div>
    <Skeleton className="h-5 w-4/5 rounded" />
    <Skeleton className="h-4 w-3/5 rounded" />
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-sand-100">
      <Skeleton className="h-6 w-24 rounded" />
      <Skeleton className="h-9 w-20 rounded-xl" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default Skeleton;

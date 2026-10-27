import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Filter,
  X,
  Search,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import ProductGrid from '../components/products/ProductGrid';
import Button from '../components/common/Button';
import { useToast } from '../contexts/ToastContext';

const CONDITIONS = [
  { value: 'upcycled', label: 'Upcycled Goods' },
  { value: 'recycled', label: 'Recycled Materials' },
  { value: 'refurbished', label: 'Refurbished Tech' },
  { value: 'pre-owned', label: 'Pre-owned / Vintage' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const toast = useToast();

  // Read search parameters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  // Local state for search bar input
  const [searchInput, setSearchInput] = useState(search);
  const [priceMinInput, setPriceMinInput] = useState(minPrice ? parseInt(minPrice, 10) / 100 : '');
  const [priceMaxInput, setPriceMaxInput] = useState(maxPrice ? parseInt(maxPrice, 10) / 100 : '');

  // Synchronize search input if URL changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  // Fetch products matching parameters
  const {
    data: productData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['products', { search, category, condition, minPrice, maxPrice, minRating, sort, page }],
    queryFn: () =>
      productService.getProducts({
        search,
        category,
        condition,
        minPrice,
        maxPrice,
        minRating,
        sort,
        page,
        limit: 12,
      }),
  });

  const products = productData?.products || [];
  const meta = productData?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 };

  // Helper to update URL params
  const updateParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    // Reset to page 1 whenever filters change (unless page itself is changing)
    if (!('page' in newParams)) {
      updated.set('page', '1');
    }
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() });
  };

  const handlePriceFilterApply = () => {
    const minPaise = priceMinInput ? Math.round(Number(priceMinInput) * 100) : '';
    const maxPaise = priceMaxInput ? Math.round(Number(priceMaxInput) * 100) : '';
    updateParams({ minPrice: minPaise, maxPrice: maxPaise });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setPriceMinInput('');
    setPriceMaxInput('');
    setSearchParams(new URLSearchParams({ page: '1' }));
  };

  const activeFilterCount = [
    category,
    condition,
    minPrice,
    maxPrice,
    minRating,
    search,
  ].filter(Boolean).length;

  const handleAddToCart = (product) => {
    toast.success(`"${product.title}" added to cart!`);
  };

  const handleToggleWishlist = (product) => {
    toast.info(`"${product.title}" saved to your wishlist.`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col gap-2 border-b border-sand-200 pb-6">
        <nav className="flex items-center gap-2 text-xs text-charcoal-light">
          <Link to="/" className="hover:text-forest-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-forest-900">Sustainable Marketplace</span>
          {category && (
            <>
              <span>/</span>
              <span className="capitalize text-forest-700">
                {categories.find((c) => c.slug === category)?.name || category}
              </span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-forest-950">
              Sustainable Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Explore {meta.total} verified circular products diverting waste from landfills.
            </p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products & materials..."
              className="w-full bg-white rounded-xl border border-sand-300 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-200"
            />
            <Search className="w-3.5 h-3.5 text-charcoal-light absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* 2. Top Controls & Active Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sand-50/60 p-4 rounded-2xl border border-sand-200">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sand-300 text-xs font-bold text-forest-900 shadow-soft"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          {/* Result Count */}
          <span className="text-xs font-semibold text-charcoal-light">
            Showing <strong className="text-forest-900">{products.length}</strong> of{' '}
            <strong className="text-forest-900">{meta.total}</strong> products
          </span>

          {/* Active Filter Chips */}
          {category && (
            <span className="inline-flex items-center gap-1 bg-forest-100 text-forest-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-forest-200">
              Category: {categories.find((c) => c.slug === category)?.name || category}
              <button onClick={() => updateParams({ category: '' })}>
                <X className="w-3 h-3 hover:text-red-600" />
              </button>
            </span>
          )}

          {condition && (
            <span className="inline-flex items-center gap-1 bg-lime-100 text-lime-900 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-lime-200">
              Condition: {condition}
              <button onClick={() => updateParams({ condition: '' })}>
                <X className="w-3 h-3 hover:text-red-600" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 bg-sand-200 text-charcoal text-[11px] font-semibold px-2.5 py-1 rounded-full border border-sand-300">
              Price: ₹{minPrice ? minPrice / 100 : '0'} - ₹{maxPrice ? maxPrice / 100 : '∞'}
              <button onClick={() => updateParams({ minPrice: '', maxPrice: '' })}>
                <X className="w-3 h-3 hover:text-red-600" />
              </button>
            </span>
          )}

          {minRating && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-amber-200">
              ★ {minRating}+ Rating
              <button onClick={() => updateParams({ minRating: '' })}>
                <X className="w-3 h-3 hover:text-red-600" />
              </button>
            </span>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-800 underline ml-1"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-charcoal-light font-medium whitespace-nowrap">
            Sort by:
          </span>
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="bg-white border border-sand-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-charcoal focus:outline-none focus:border-forest-600 shadow-soft"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Main Catalog Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters Desktop */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } bg-white rounded-3xl border border-sand-200 p-6 shadow-soft flex flex-col gap-6 sticky top-28`}
        >
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-forest-800" />
              <h3 className="text-sm font-bold text-forest-950">Filters</h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-forest-700 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Category
            </h4>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateParams({ category: '' })}
                className={`text-left text-xs py-1 px-2 rounded-lg transition-colors flex items-center justify-between ${
                  !category
                    ? 'bg-forest-50 text-forest-900 font-bold'
                    : 'text-charcoal-muted hover:bg-sand-50'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => updateParams({ category: cat.slug })}
                  className={`text-left text-xs py-1 px-2 rounded-lg transition-colors flex items-center justify-between ${
                    category === cat.slug
                      ? 'bg-forest-50 text-forest-900 font-bold'
                      : 'text-charcoal-muted hover:bg-sand-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.productCount > 0 && (
                    <span className="text-[10px] text-charcoal-light">
                      ({cat.productCount})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-sand-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Product Condition
            </h4>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => updateParams({ condition: '' })}
                className={`text-left text-xs py-1 px-2 rounded-lg transition-colors ${
                  !condition
                    ? 'bg-forest-50 text-forest-900 font-bold'
                    : 'text-charcoal-muted hover:bg-sand-50'
                }`}
              >
                All Conditions
              </button>
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.value}
                  type="button"
                  onClick={() => updateParams({ condition: cond.value })}
                  className={`text-left text-xs py-1 px-2 rounded-lg transition-colors ${
                    condition === cond.value
                      ? 'bg-forest-50 text-forest-900 font-bold'
                      : 'text-charcoal-muted hover:bg-sand-50'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-sand-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Price Range (₹)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={priceMinInput}
                onChange={(e) => setPriceMinInput(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 rounded-xl px-2.5 py-1.5 text-xs text-charcoal"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={priceMaxInput}
                onChange={(e) => setPriceMaxInput(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 rounded-xl px-2.5 py-1.5 text-xs text-charcoal"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={handlePriceFilterApply}>
              Apply Price
            </Button>
          </div>

          {/* Minimum Rating Filter */}
          <div className="flex flex-col gap-2 pt-3 border-t border-sand-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Customer Rating
            </h4>
            <div className="flex flex-col gap-1">
              {[4, 3].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateParams({ minRating: minRating === String(star) ? '' : String(star) })}
                  className={`text-left text-xs py-1 px-2 rounded-lg flex items-center justify-between ${
                    minRating === String(star)
                      ? 'bg-forest-50 text-forest-900 font-bold'
                      : 'text-charcoal-muted hover:bg-sand-50'
                  }`}
                >
                  <span>★ {star} Stars & Above</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onResetFilters={clearAllFilters}
          />

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-sand-200">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPrevPage}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParams({ page: String(p) })}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      page === p
                        ? 'bg-forest-800 text-white shadow-soft'
                        : 'bg-white text-charcoal-muted hover:bg-sand-100 border border-sand-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;

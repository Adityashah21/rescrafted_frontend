import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  ShoppingBag,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Sparkles,
  Recycle,
  Check,
  ChevronRight,
  Package,
  Star,
  Trash2,
  ShieldAlert,
  Info,
  CheckCircle2,
  MessageSquare,
  Award,
} from 'lucide-react';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import PriceDisplay from '../components/common/PriceDisplay';
import RatingDisplay from '../components/common/RatingDisplay';
import SustainabilityBadge from '../components/common/SustainabilityBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProductGrid from '../components/products/ProductGrid';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedStarFilter, setSelectedStarFilter] = useState(null);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // 1. Fetch Product Data
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug),
  });

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  // 2. Fetch Product Reviews & Star Distribution
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
  } = useQuery({
    queryKey: ['productReviews', product?._id, selectedStarFilter],
    queryFn: () =>
      reviewService.getProductReviews(
        product._id,
        selectedStarFilter ? { rating: selectedStarFilter } : {}
      ),
    enabled: !!product?._id,
  });

  // 3. Fetch Product LCA Environmental Impact Assessment
  const {
    data: impactData,
  } = useQuery({
    queryKey: ['productImpact', product?._id],
    queryFn: () => reviewService.getProductImpact(product._id),
    enabled: !!product?._id,
  });

  // 4. Fetch Verified Purchase Eligibility
  const {
    data: eligibilityData,
    refetch: refetchEligibility,
  } = useQuery({
    queryKey: ['reviewEligibility', product?._id],
    queryFn: () => reviewService.checkEligibility(product._id),
    enabled: !!product?._id && isAuthenticated,
  });

  // Review Submission Mutation
  const createReviewMutation = useMutation({
    mutationFn: (newReview) => reviewService.createReview(newReview),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', product?._id] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      queryClient.invalidateQueries({ queryKey: ['reviewEligibility', product?._id] });
      setIsReviewModalOpen(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      toast.success('Your verified review was submitted successfully! Thank you for supporting sustainable artisans.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit review.');
    },
  });

  // Review Deletion Mutation (Author or Admin)
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', product?._id] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      queryClient.invalidateQueries({ queryKey: ['reviewEligibility', product?._id] });
      toast.info('Review deleted.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete review.');
    },
  });

  // Review Moderation Mutation (Admin)
  const moderateReviewMutation = useMutation({
    mutationFn: ({ reviewId, status }) => reviewService.moderateReview(reviewId, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', product?._id] });
      toast.info(`Review status updated to ${updated?.status || 'updated'}.`);
    },
    onError: (err) => {
      toast.error(err.message || 'Moderation failed.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 py-10 animate-pulse">
        <div className="h-6 w-60 bg-sand-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-sand-200 rounded-3xl" />
          <div className="flex flex-col gap-4">
            <div className="h-8 w-4/5 bg-sand-200 rounded" />
            <div className="h-6 w-32 bg-sand-200 rounded" />
            <div className="h-24 w-full bg-sand-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-forest-950 mb-3">Product Not Found</h2>
        <p className="text-sm text-charcoal-muted mb-6">
          This sustainable product is no longer available or the link is broken.
        </p>
        <Link to="/products">
          <Button variant="primary">Browse All Products</Button>
        </Link>
      </div>
    );
  }

  const {
    _id: productId,
    title,
    pricePaise,
    compareAtPricePaise,
    condition,
    description,
    materials = [],
    sustainabilitySpecs = {},
    dimensions,
    stockQuantity = 0,
    sku,
    images = [],
    sellerId,
    ratingsSummary,
    categoryId,
  } = product;

  const isOutOfStock = stockQuantity <= 0;
  const activeImage = images[selectedImageIndex]?.url || images[0]?.url;
  const itemIsWishlisted = isWishlisted(productId);

  const reviews = reviewsData?.reviews || [];
  const ratingDist = reviewsData?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviewsCount = ratingsSummary?.reviewCount || reviewsData?.meta?.total || 0;
  const avgRatingVal = ratingsSummary?.averageRating || 0;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, stockQuantity)));
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity);
    } catch {
      // handled by context toast
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(productId, quantity);
      navigate('/checkout');
    } catch {
      // handled by context toast
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.warning('Please provide both a title and comments for your review.');
      return;
    }

    createReviewMutation.mutate({
      productId,
      orderId: eligibilityData?.orderId,
      rating: reviewRating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
    });
  };

  const ratingDescriptions = {
    1: 'Disappointing — Does not meet sustainability standards',
    2: 'Fair — Adequate but room for quality improvement',
    3: 'Good — Standard sustainable craftsmanship',
    4: 'Very Good — High quality and circular materials',
    5: 'Exceptional — Benchmark sustainable craftsmanship',
  };

  return (
    <div className="flex flex-col gap-16">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-charcoal-light flex-wrap">
        <Link to="/" className="hover:text-forest-800 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-forest-800 transition-colors">
          Marketplace
        </Link>
        {categoryId?.name && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              to={`/products?category=${categoryId.slug}`}
              className="hover:text-forest-800 transition-colors capitalize"
            >
              {categoryId.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-forest-950 truncate max-w-xs">{title}</span>
      </nav>

      {/* 2. Main Product Grid: Gallery + Purchasing Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-3xl bg-sand-100 overflow-hidden border border-sand-200 shadow-soft group">
            <img
              src={activeImage}
              alt={title}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {/* Condition badge */}
            <div className="absolute top-4 left-4 z-10">
              <SustainabilityBadge
                condition={condition}
                recycledPercentage={sustainabilitySpecs?.recycledPercentage}
              />
            </div>
            {/* Wishlist and Share */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-charcoal hover:bg-white transition-all shadow-soft"
                aria-label="Share product link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-soft ${
                  itemIsWishlisted
                    ? 'bg-red-50 text-red-600'
                    : 'bg-white/90 text-charcoal hover:text-red-500 hover:bg-white'
                }`}
                aria-label="Save to wishlist"
              >
                <Heart className={`w-4 h-4 ${itemIsWishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-forest-800 scale-95 shadow-soft'
                      : 'border-sand-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Purchasing & Specifications (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Seller / Store Link */}
          {sellerId && (
            <div className="flex items-center gap-2 text-xs font-semibold text-sage-800">
              <Store className="w-3.5 h-3.5" />
              <span>By {sellerId.storeName || 'ResCrafted Artisan'}</span>
              <span className="text-[10px] bg-forest-50 text-forest-800 border border-forest-200 px-2 py-0.5 rounded-full font-bold">
                Verified Maker
              </span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-sans leading-tight">
            {title}
          </h1>

          {/* Rating & SKU */}
          <div className="flex items-center justify-between text-xs text-charcoal-light pb-2 border-b border-sand-100">
            <a href="#reviews" className="hover:opacity-80 transition-opacity">
              <RatingDisplay
                rating={avgRatingVal}
                reviewCount={totalReviewsCount}
                size="sm"
              />
            </a>
            <span className="font-mono text-[11px] text-charcoal-light">SKU: {sku}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-4">
            <PriceDisplay
              pricePaise={pricePaise}
              compareAtPricePricePaise={compareAtPricePaise}
              size="lg"
            />
            <span className="text-xs text-charcoal-light">Taxes included</span>
          </div>

          {/* Stock Availability */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock ({stockQuantity} units remaining)
              </span>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-charcoal">Quantity:</span>
                <div className="flex items-center rounded-xl border border-sand-300 bg-white">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-sm font-bold text-charcoal hover:bg-sand-50 rounded-l-xl disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-forest-900 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= stockQuantity}
                    className="px-3 py-1.5 text-sm font-bold text-charcoal hover:bg-sand-50 rounded-r-xl disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={ShoppingBag}
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full justify-center"
              >
                Add to Cart
              </Button>
              <Button
                variant="accent"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full justify-center"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* 3. Sustainability Scorecard Box */}
          <div className="mt-4 p-5 rounded-3xl bg-forest-50/70 border border-forest-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-accentLime" />
                <span>Verified Impact Scorecard</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-forest-700 bg-white px-2 py-0.5 rounded-full border border-forest-200">
                Transparent LCA
              </span>
            </div>

            {/* Recycled % meter */}
            {sustainabilitySpecs?.recycledPercentage > 0 && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-forest-900 mb-1">
                  <span>Recycled / Reclaimed Content</span>
                  <span>{sustainabilitySpecs.recycledPercentage}%</span>
                </div>
                <div className="w-full bg-sand-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accentLime h-full rounded-full transition-all duration-500"
                    style={{ width: `${sustainabilitySpecs.recycledPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-forest-200/60 text-xs">
              {(impactData?.estimatedCo2SavedKg || sustainabilitySpecs?.estimatedCo2SavedKg) && (
                <div className="flex flex-col">
                  <span className="text-[11px] text-charcoal-muted">Avoided Carbon (CO₂)</span>
                  <span className="font-bold text-forest-950 mt-0.5">
                    ~{impactData?.estimatedCo2SavedKg || sustainabilitySpecs?.estimatedCo2SavedKg} kg CO₂
                  </span>
                </div>
              )}

              {(impactData?.estimatedWasteDivertedKg || sustainabilitySpecs?.estimatedWasteDivertedKg) && (
                <div className="flex flex-col">
                  <span className="text-[11px] text-charcoal-muted">Landfill Waste Diverted</span>
                  <span className="font-bold text-forest-950 mt-0.5">
                    {impactData?.estimatedWasteDivertedKg || sustainabilitySpecs?.estimatedWasteDivertedKg} kg material
                  </span>
                </div>
              )}

              {(impactData?.repairabilityIndex || sustainabilitySpecs?.repairabilityIndex) && (
                <div className="flex flex-col">
                  <span className="text-[11px] text-charcoal-muted">Repairability Score</span>
                  <span className="font-bold text-forest-950 mt-0.5">
                    {impactData?.repairabilityIndex || sustainabilitySpecs?.repairabilityIndex} / 10
                  </span>
                </div>
              )}

              {(impactData?.packagingType || sustainabilitySpecs?.packagingType) && (
                <div className="flex flex-col">
                  <span className="text-[11px] text-charcoal-muted">Packaging</span>
                  <span className="font-bold text-forest-950 mt-0.5 capitalize">
                    {(impactData?.packagingType || sustainabilitySpecs?.packagingType).replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Materials List */}
            {materials.length > 0 && (
              <div className="pt-2 border-t border-forest-200/60">
                <span className="text-[11px] font-bold text-charcoal block mb-1.5">
                  Verified Materials:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {materials.map((mat, i) => (
                    <span
                      key={i}
                      className="bg-white text-forest-950 text-[11px] font-medium px-2.5 py-0.5 rounded-lg border border-forest-100"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-charcoal-muted text-center border-t border-sand-100">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-forest-700" />
              <span>Carbon-Neutral Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Package className="w-4 h-4 text-forest-700" />
              <span>Plastic-Free Packaging</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-forest-700" />
              <span>Fair Return Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Product Description & Physical Dimensions */}
      <section className="bg-white rounded-3xl border border-sand-200 p-8 sm:p-10 shadow-soft flex flex-col gap-6">
        <h2 className="text-xl font-bold text-forest-950">About This Sustainable Craft</h2>
        <div className="text-sm text-charcoal-muted leading-relaxed whitespace-pre-line">
          {description}
        </div>

        {dimensions && (dimensions.lengthCm > 0 || dimensions.widthCm > 0) && (
          <div className="pt-4 border-t border-sand-100 flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Physical Dimensions
            </h4>
            <p className="text-xs text-charcoal-muted">
              {dimensions.lengthCm} cm (L) × {dimensions.widthCm} cm (W) × {dimensions.heightCm} cm
              (H)
            </p>
          </div>
        )}
      </section>

      {/* 5. Detailed Life Cycle Assessment (LCA) Transparency Report */}
      {impactData && (
        <section className="bg-forest-900 text-white rounded-3xl p-8 sm:p-10 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accentLime/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accentLime text-xs font-bold mb-3 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Life Cycle Assessment (LCA) Transparency</span>
                </div>
                <h3 className="text-2xl font-black text-white font-sans">
                  Environmental Savings Scorecard
                </h3>
                <p className="text-sm text-sand-200 mt-1 max-w-2xl">
                  ResCrafted tracks the verified ecological dividend of giving pre-existing materials
                  a second life versus virgin extraction.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[160px]">
                <span className="text-xs text-sand-300 uppercase tracking-wider font-semibold block">
                  Circularity Index
                </span>
                <span className="text-3xl font-black text-accentLime mt-1 block">
                  {impactData.recycledPercentage}%
                </span>
                <span className="text-[11px] text-sand-200">Reclaimed Content</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="text-xs text-sand-300 block mb-1">Avoided Carbon (CO₂)</span>
                <div className="text-2xl font-black text-white mb-2">
                  ~{impactData.estimatedCo2SavedKg} kg
                </div>
                <p className="text-[11px] text-sand-300 leading-normal">
                  84% reduction vs. virgin production (emitting ~5.5 kg CO₂/kg).
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="text-xs text-sand-300 block mb-1">Waste Diverted Mass</span>
                <div className="text-2xl font-black text-white mb-2">
                  {impactData.estimatedWasteDivertedKg} kg
                </div>
                <p className="text-[11px] text-sand-300 leading-normal">
                  Solid waste rescued directly from municipal landfills.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="text-xs text-sand-300 block mb-1">Repairability Score</span>
                <div className="text-2xl font-black text-accentLime mb-2">
                  {impactData.repairabilityIndex} / 10
                </div>
                <p className="text-[11px] text-sand-300 leading-normal">
                  Engineered for disassembly, restoration, and long lifecycle.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="text-xs text-sand-300 block mb-1">Packaging Footprint</span>
                <div className="text-2xl font-black text-white capitalize mb-2">
                  {impactData.packagingType.replace('_', ' ')}
                </div>
                <p className="text-[11px] text-sand-300 leading-normal">
                  100% biodegradable, plastic-free shipping materials.
                </p>
              </div>
            </div>

            {/* Certifications and provenance */}
            {impactData.certifications && impactData.certifications.length > 0 && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                <span className="text-xs text-sand-300 font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accentLime" />
                  Standards & Credentials:
                </span>
                {impactData.certifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-accentLime" />
                    {cert.name} ({cert.issuingBody})
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. Customer Reviews & Ratings Section */}
      <section id="reviews" className="bg-white rounded-3xl border border-sand-200 p-8 sm:p-10 shadow-soft flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-sand-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sage-800 bg-sage-50 border border-sage-200 px-3 py-1 rounded-full">
                Verified Customer Feedback
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-forest-950">
              Customer Reviews ({totalReviewsCount})
            </h2>
            <p className="text-xs text-charcoal-muted mt-1">
              All reviews on ResCrafted require verified purchase confirmation to eliminate astroturfing.
            </p>
          </div>

          {/* Review action buttons based on user eligibility */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              eligibilityData?.canReview ? (
                <Button
                  variant="primary"
                  onClick={() => setIsReviewModalOpen(true)}
                  icon={Sparkles}
                >
                  Write a Verified Review
                </Button>
              ) : eligibilityData?.reason === 'already_reviewed' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>You reviewed this purchase</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-sand-100 text-charcoal-muted border border-sand-200 rounded-xl text-xs">
                  <Info className="w-4 h-4 text-forest-700 flex-shrink-0" />
                  <span>Verified Purchase Required to Review</span>
                </div>
              )
            ) : (
              <Link to={`/login?redirect=/products/${slug}`}>
                <Button variant="outline" size="sm">
                  Sign in to Review
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Ratings Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-sand-50/60 p-6 rounded-2xl border border-sand-200">
          {/* Average Rating Block */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left gap-2 border-b md:border-b-0 md:border-r border-sand-200 pb-6 md:pb-0 md:pr-6">
            <span className="text-5xl font-black text-forest-950">
              {avgRatingVal ? avgRatingVal.toFixed(1) : '0.0'}
            </span>
            <div className="flex items-center text-amber-500 gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    avgRatingVal >= star
                      ? 'fill-amber-400 text-amber-400'
                      : avgRatingVal >= star - 0.5
                      ? 'fill-amber-200 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-charcoal-light">
              Based on {totalReviewsCount} verified {totalReviewsCount === 1 ? 'buyer' : 'buyers'}
            </span>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="md:col-span-8 flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDist[star] || 0;
              const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
              const isSelected = selectedStarFilter === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedStarFilter(isSelected ? null : star)}
                  className={`flex items-center gap-3 text-xs group text-left p-1 rounded-lg transition-colors ${
                    isSelected ? 'bg-forest-100 font-bold' : 'hover:bg-sand-100'
                  }`}
                >
                  <span className="w-12 text-charcoal font-semibold flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 bg-sand-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSelected ? 'bg-forest-800' : 'bg-forest-600 group-hover:bg-forest-700'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-charcoal-muted font-mono text-[11px]">
                    {count} ({percent}%)
                  </span>
                </button>
              );
            })}

            {selectedStarFilter && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedStarFilter(null)}
                  className="text-xs text-forest-800 underline font-semibold hover:text-forest-950"
                >
                  Clear star filter ({selectedStarFilter}★)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        {isReviewsLoading ? (
          <div className="flex flex-col gap-4 py-8 animate-pulse">
            <div className="h-20 bg-sand-100 rounded-2xl" />
            <div className="h-20 bg-sand-100 rounded-2xl" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3 bg-sand-50/40 rounded-2xl border border-sand-200 border-dashed">
            <MessageSquare className="w-10 h-10 text-charcoal-light/60" />
            <h4 className="text-base font-bold text-forest-950">No Reviews Yet</h4>
            <p className="text-xs text-charcoal-muted max-w-md">
              {selectedStarFilter
                ? `No verified reviews found for ${selectedStarFilter} stars.`
                : 'Be the first eco-conscious customer to purchase and share verified circular feedback for this craft!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {reviews.map((rev) => {
              const isAuthor = user?._id && rev.customerId?._id === user._id;
              const isAdmin = user?.role === 'admin';
              const canDelete = isAuthor || isAdmin;

              return (
                <div
                  key={rev._id}
                  className="p-6 rounded-2xl border border-sand-200 bg-white flex flex-col gap-3 shadow-soft transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-900 font-bold flex items-center justify-center text-sm border border-forest-200">
                        {rev.customerId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-forest-950">
                            {rev.customerId?.name || 'Artisan Supporter'}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified Circular Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-charcoal-light">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Admin Moderation Actions */}
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Flag review"
                            onClick={() =>
                              moderateReviewMutation.mutate({
                                reviewId: rev._id,
                                status: 'flagged',
                              })
                            }
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Author or Admin Delete */}
                      {canDelete && (
                        <button
                          type="button"
                          title="Delete review"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this review?')) {
                              deleteReviewMutation.mutate(rev._id);
                            }
                          }}
                          className="p-1.5 text-charcoal-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars & Title */}
                  <div className="flex items-center gap-2 pt-1">
                    <RatingDisplay rating={rev.rating} showCount={false} size="sm" />
                    <h4 className="text-sm font-bold text-forest-950">{rev.title}</h4>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-charcoal-muted leading-relaxed whitespace-pre-line">
                    {rev.comment}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7. Related Products Rail */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-forest-950">You May Also Like</h2>
          <ProductGrid
            products={relatedProducts}
            onAddToCart={(p) => addToCart(p._id, 1)}
            onToggleWishlist={(p) => toggleWishlist(p)}
          />
        </section>
      )}

      {/* Verified Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Write a Verified Customer Review"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitReview} className="p-6 flex flex-col gap-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-normal">
              <span className="font-bold block">Verified Circular Buyer</span>
              Your review is linked to order #{eligibilityData?.orderId?.toString().slice(-6) || 'VERIFIED'}. Thank you for championing circular craftsmanship!
            </div>
          </div>

          {/* Star selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-forest-900">Overall Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setReviewRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || reviewRating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-forest-950 ml-2">
                {reviewRating} / 5
              </span>
            </div>
            <span className="text-[11px] text-charcoal-light">
              {ratingDescriptions[hoverRating || reviewRating]}
            </span>
          </div>

          {/* Review Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-forest-900">
              Review Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Beautiful reclaimed finish & entirely zero-waste packing"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          {/* Review Comment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-forest-900">
              Detailed Experience & Circular Quality <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={1000}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Describe the build quality, sustainable materials, longevity, and artisan craftsmanship..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-800 resize-none"
            />
            <span className="text-[10px] text-charcoal-light text-right">
              {reviewComment.length}/1000 characters
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? 'Submitting...' : 'Submit Verified Review'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetailsPage;

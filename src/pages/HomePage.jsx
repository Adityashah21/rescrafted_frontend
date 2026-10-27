import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Sparkles,
  Recycle,
  ShieldCheck,
  PackageOpen,
  Store,
  Leaf,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import Button from '../components/common/Button';
import ProductGrid from '../components/products/ProductGrid';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import productService from '../services/productService';

// Featured categories for the visual rail
const FEATURED_CATEGORIES = [
  {
    name: 'Upcycled Decor',
    slug: 'upcycled-decor',
    description: 'Vases, lighting & planters crafted from reclaimed glass and metals.',
    image:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
    itemCount: '240+ items',
  },
  {
    name: 'Reclaimed Furniture',
    slug: 'reclaimed-furniture',
    description: 'Desks, shelves and stools made from century-old salvaged timber.',
    image:
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=600',
    itemCount: '180+ items',
  },
  {
    name: 'Refurbished Tech & Audio',
    slug: 'refurbished-tech',
    description: 'Precision-tested audio gear, vintage turntables, and renewed devices.',
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
    itemCount: '95+ items',
  },
  {
    name: 'Recycled Fashion & Bags',
    slug: 'recycled-fashion',
    description: 'Bags & accessories made from upcycled billboard canvas and tire tubes.',
    image:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    itemCount: '310+ items',
  },
  {
    name: 'Zero Waste Home',
    slug: 'zero-waste',
    description: 'Refillable essentials, bamboo brushes, and compostable everyday goods.',
    image:
      'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600',
    itemCount: '150+ items',
  },
];

// Curated sustainable sample listings
const SAMPLE_TRENDING_PRODUCTS = [
  {
    _id: 'sample-p1',
    slug: 'reclaimed-teak-minimalist-desk-lamp',
    title: 'Minimalist Desk Lamp from Century Reclaimed Teak',
    pricePaise: 249900, // ₹2,499.00
    compareAtPricePaise: 349900,
    condition: 'upcycled',
    materials: ['Reclaimed Teak Wood', 'Brass Fittings', 'Braided Cotton Wire'],
    sustainabilitySpecs: {
      recycledPercentage: 92,
      repairabilityIndex: 9,
      estimatedCo2SavedKg: 4.8,
      estimatedWasteDivertedKg: 2.1,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
        isPrimary: true,
      },
    ],
    ratingsSummary: { averageRating: 4.9, reviewCount: 38 },
    stockQuantity: 12,
    sellerId: { storeName: 'TimberCraft Studio' },
  },
  {
    _id: 'sample-p2',
    slug: 'upcycled-billboard-waterproof-messenger-bag',
    title: 'Waterproof Commuter Bag Upcycled from Vinyl Billboards',
    pricePaise: 189900, // ₹1,899.00
    compareAtPricePaise: 249900,
    condition: 'upcycled',
    materials: ['Repurposed Vinyl Billboard', 'Seatbelt Webbing', 'YKK Metal Zippers'],
    sustainabilitySpecs: {
      recycledPercentage: 98,
      repairabilityIndex: 8,
      estimatedCo2SavedKg: 6.2,
      estimatedWasteDivertedKg: 1.4,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
        isPrimary: true,
      },
    ],
    ratingsSummary: { averageRating: 4.8, reviewCount: 52 },
    stockQuantity: 7,
    sellerId: { storeName: 'Urban Salvage Bags' },
  },
  {
    _id: 'sample-p3',
    slug: 'restored-vintage-analog-headphones',
    title: 'Certified Refurbished 1980s Studio Hi-Fi Headphones',
    pricePaise: 420000, // ₹4,200.00
    compareAtPricePaise: 550000,
    condition: 'refurbished',
    materials: ['Recycled Aluminum', 'New Memory Foam Earpads', 'OFC Copper'],
    sustainabilitySpecs: {
      recycledPercentage: 85,
      repairabilityIndex: 10,
      estimatedCo2SavedKg: 12.5,
      estimatedWasteDivertedKg: 0.9,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
        isPrimary: true,
      },
    ],
    ratingsSummary: { averageRating: 5.0, reviewCount: 19 },
    stockQuantity: 4,
    sellerId: { storeName: 'RetroAcoustics Lab' },
  },
  {
    _id: 'sample-p4',
    slug: 'recycled-glass-terrazzo-serving-tray',
    title: 'Handmade Terrazzo Tray from Crushed Beverage Glass',
    pricePaise: 129900, // ₹1,299.00
    compareAtPricePaise: 169900,
    condition: 'recycled',
    materials: ['100% Recycled Bottle Glass', 'Eco-Resin Matrix', 'Cork Feet'],
    sustainabilitySpecs: {
      recycledPercentage: 90,
      repairabilityIndex: 7,
      estimatedCo2SavedKg: 3.1,
      estimatedWasteDivertedKg: 1.8,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600',
        isPrimary: true,
      },
    ],
    ratingsSummary: { averageRating: 4.7, reviewCount: 29 },
    stockQuantity: 15,
    sellerId: { storeName: 'Glassworks Reborn' },
  },
];

const HomePage = () => {
  const toast = useToast();

  const { data: productData, isLoading } = useQuery({
    queryKey: ['trending-products'],
    queryFn: () => productService.getProducts({ limit: 4, sort: 'popular' }),
  });

  const trendingProducts =
    productData?.products?.length > 0 ? productData.products : SAMPLE_TRENDING_PRODUCTS;

  const { addToCart } = useCart();
  const { toggleWishlist, wishlistIds = [] } = useWishlist();

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
  };

  return (
    <div className="flex flex-col gap-16 lg:gap-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-forest-900 text-warmWhite p-8 sm:p-12 lg:p-16 border border-forest-800 shadow-elevated">
        {/* Decorative background accent circle */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-forest-800/60 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-80 h-80 rounded-full bg-accentLime/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-800/80 border border-forest-700 text-accentLime text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Circular Economy Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white font-sans">
            Give Waste a <span className="text-accentLime">Second Life.</span>
          </h1>

          <p className="text-base sm:text-lg text-sand-200 leading-relaxed max-w-2xl">
            Discover extraordinary products handcrafted from discarded materials, rescued timber,
            and restored electronics by verified artisans and sustainable makers across India.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/products">
              <Button variant="accent" size="lg" icon={ArrowRight} iconPosition="right">
                Explore Marketplace
              </Button>
            </Link>

            <Link to="/seller/register">
              <Button
                variant="outline"
                size="lg"
                icon={Store}
                className="border-sand-300 text-white hover:bg-forest-800"
              >
                Become a Seller
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Counter */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-8 mt-4 border-t border-forest-800/80 w-full max-w-xl">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-accentLime">18.4 T</span>
              <p className="text-xs text-sand-300 mt-0.5">Waste Diverted</p>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white">42.6 T</span>
              <p className="text-xs text-sand-300 mt-0.5">CO₂ Avoided</p>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-accentLime">140+</span>
              <p className="text-xs text-sand-300 mt-0.5">Verified Artisans</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Rail */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
              Curated Circular Design
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-forest-950 mt-1">
              Explore by Sustainable Category
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-600 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl bg-white border border-sand-200 overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-sand-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[11px] font-bold text-sage-700 mb-1">{cat.itemCount}</span>
                <h3 className="text-sm font-bold text-forest-900 group-hover:text-forest-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-charcoal-muted mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Trending Sustainable Products */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accentLime" />
              <span>Trending Drops</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-forest-950">
              Popular Handcrafted & Refurbished Goods
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-600 transition-colors"
          >
            <span>See All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid
          products={trendingProducts}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistIds}
        />
      </section>

      {/* 4. How ResCrafted Works */}
      <section className="bg-sand-100/70 border border-sand-200 rounded-3xl p-8 sm:p-12 lg:p-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            The Circular Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-forest-950 mt-1">
            How ResCrafted Works
          </h2>
          <p className="text-sm text-charcoal-muted mt-2">
            Every product on ResCrafted goes through a verifiable lifecycle that prevents landfill
            waste and rewards local craftspeople.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-forest-800 text-accentLime flex items-center justify-center font-black text-xl shadow-soft">
              1
            </div>
            <h3 className="text-base font-bold text-forest-900">Waste Rescued</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Discarded timber, bottle glass, fabric cutoffs, and unused tech components are diverted
              from disposal.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-forest-800 text-accentLime flex items-center justify-center font-black text-xl shadow-soft">
              2
            </div>
            <h3 className="text-base font-bold text-forest-900">Artisan Crafting</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Independent artisans, engineers, and studios hand-refurbish and upcycle each piece
              with meticulous care.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-forest-800 text-accentLime flex items-center justify-center font-black text-xl shadow-soft">
              3
            </div>
            <h3 className="text-base font-bold text-forest-900">Verified Impact</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Material composition and calculated CO₂ savings are transparently displayed—no
              hollow greenwashing.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-forest-800 text-accentLime flex items-center justify-center font-black text-xl shadow-soft">
              4
            </div>
            <h3 className="text-base font-bold text-forest-900">Circular Delivery</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Shipped in plastic-free recycled packaging with carbon offset delivery right to your
              door.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Sustainability Education Spotlight */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-sand-200 p-8 sm:p-12 shadow-soft">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Evidence-Based Environmental Policy</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-forest-950">
            Why Material Transparency Matters
          </h2>

          <p className="text-sm text-charcoal-muted leading-relaxed">
            Most eco-labels use vague buzzwords without disclosing material sources. At ResCrafted,
            we require sellers to specify exact material breakdowns, recycled percentages, and
            repairability indices.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-charcoal">
                <strong className="text-forest-950">Quantified Waste Diversion:</strong> We calculate
                the direct mass in kilograms prevented from entering municipal dumps.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-charcoal">
                <strong className="text-forest-950">Documented Emissions LCA:</strong> Estimated CO₂
                offsets are calculated based on peer-reviewed life-cycle substitution factors.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-charcoal">
                <strong className="text-forest-950">Repairability Score:</strong> Encouraging products
                engineered to be disassembled and repaired rather than thrown away.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/sustainability">
              <Button variant="secondary" size="md" icon={ArrowRight} iconPosition="right">
                Read Our Impact Methodology
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-sand-200">
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"
            alt="Artisan working on upcycled craft"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/20 to-transparent flex flex-col justify-end p-6 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-accentLime">
              Artisan Spotlight
            </span>
            <h4 className="text-lg font-bold">TimberCraft Studio, Jaipur</h4>
            <p className="text-xs text-sand-200 mt-1">
              "ResCrafted allowed us to rescue 6,200 kg of colonial architectural teak and turn it
              into functional lighting."
            </p>
          </div>
        </div>
      </section>

      {/* 6. Seller Onboarding Call-to-Action Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-forest-800 to-forest-950 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-forest-700 shadow-elevated">
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-accentLime">
            <Store className="w-4 h-4" />
            <span>Sell on ResCrafted</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black leading-tight">
            Are You an Artisan, Refurbisher, or Circular Creator?
          </h2>
          <p className="text-xs sm:text-sm text-sand-300 leading-relaxed">
            Reach thousands of conscious consumers across India looking for meaningful, sustainable
            alternatives. Keep 95% of your sales with verified seller protection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full sm:w-auto">
          <Link to="/seller/register" className="w-full sm:w-auto">
            <Button
              variant="accent"
              size="lg"
              icon={Store}
              className="w-full sm:w-auto justify-center"
            >
              Open Your Store
            </Button>
          </Link>
          <Link to="/seller-guidelines" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="border-sand-300 text-white hover:bg-forest-800 w-full sm:w-auto justify-center"
            >
              Learn Guidelines
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

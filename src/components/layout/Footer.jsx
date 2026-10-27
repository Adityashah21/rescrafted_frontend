import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Truck, RefreshCcw, Heart, Send } from 'lucide-react';
import Button from '../common/Button';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-forest-950 text-sand-100 border-t border-forest-900 mt-20">
      {/* Sustainability Trust Badges Row */}
      <div className="border-b border-forest-900/80 bg-forest-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-forest-900/40 border border-forest-800/60">
            <div className="w-12 h-12 rounded-xl bg-forest-800 text-accentLime flex items-center justify-center flex-shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Verified Circular Materials</h4>
              <p className="text-xs text-sand-300">Upcycled, recycled & refurbished items</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-forest-900/40 border border-forest-800/60">
            <div className="w-12 h-12 rounded-xl bg-forest-800 text-accentLime flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Authentic Artisans</h4>
              <p className="text-xs text-sand-300">Vetted creators & sustainable brands</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-forest-900/40 border border-forest-800/60">
            <div className="w-12 h-12 rounded-xl bg-forest-800 text-accentLime flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Zero Single-Use Plastic</h4>
              <p className="text-xs text-sand-300">Biodegradable or paper packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-forest-900/40 border border-forest-800/60">
            <div className="w-12 h-12 rounded-xl bg-forest-800 text-accentLime flex items-center justify-center flex-shrink-0">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Transparent Returns</h4>
              <p className="text-xs text-sand-300">Fair policies supporting sellers & buyers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-accentLime flex items-center justify-center shadow-soft">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                Res<span className="text-accentLime">Crafted</span>
              </span>
            </Link>

            <p className="text-sm text-sand-300 leading-relaxed max-w-sm">
              ResCrafted is a sustainable e-commerce marketplace empowering artisans,
              refurbishers, and eco-conscious shoppers to give discarded materials a beautiful
              second life.
            </p>

            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accentLime">
                Tagline
              </span>
              <p className="text-sm font-bold text-sand-100 italic">"Give Waste a Second Life."</p>
            </div>
          </div>

          {/* Column: Marketplace */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link to="/products" className="hover:text-accentLime transition-colors">
                  Explore All Products
                </Link>
              </li>
              <li>
                <Link to="/products?condition=upcycled" className="hover:text-accentLime transition-colors">
                  Upcycled Home Decor
                </Link>
              </li>
              <li>
                <Link to="/products?condition=refurbished" className="hover:text-accentLime transition-colors">
                  Refurbished Tech & Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion" className="hover:text-accentLime transition-colors">
                  Recycled Apparel
                </Link>
              </li>
              <li>
                <Link to="/artisans" className="hover:text-accentLime transition-colors">
                  Featured Artisans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Sellers & Company */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">
              Sellers & About
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link to="/seller/register" className="hover:text-accentLime transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/seller-guidelines" className="hover:text-accentLime transition-colors">
                  Artisan Guidelines
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accentLime transition-colors">
                  Our Mission & Story
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="hover:text-accentLime transition-colors">
                  Sustainability Methodology
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-accentLime transition-colors">
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Policies & Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">
              Join the Movement
            </h4>
            <p className="text-xs text-sand-300 mb-3 leading-relaxed">
              Receive inspiring circular design stories and new artisan drops.
            </p>

            {isSubscribed ? (
              <div className="bg-forest-900 border border-forest-700 text-accentLime text-xs p-3 rounded-xl">
                ✓ Thank you for subscribing to circular living updates!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-forest-900 border border-forest-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-sand-400 focus:outline-none focus:border-accentLime"
                />
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  icon={Send}
                  className="w-full justify-center"
                >
                  Subscribe
                </Button>
              </form>
            )}

            <div className="mt-4 pt-4 border-t border-forest-900 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-sand-400">
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link to="/terms" className="hover:underline">Terms</Link>
              <Link to="/shipping" className="hover:underline">Shipping</Link>
              <Link to="/returns" className="hover:underline">Returns</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-400">
          <p>© {new Date().getFullYear()} ResCrafted Marketplace. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the Planet.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

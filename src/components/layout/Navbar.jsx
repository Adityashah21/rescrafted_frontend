import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Store,
  ChevronDown,
  Package,
  MapPin,
} from 'lucide-react';

const Navbar = ({
  cartCount = 0,
  wishlistCount = 0,
  currentUser = null,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Explore All', href: '/products' },
    { label: 'Upcycled Goods', href: '/products?condition=upcycled' },
    { label: 'Refurbished Tech', href: '/products?condition=refurbished' },
    { label: 'Zero Waste Living', href: '/products?category=zero-waste' },
    { label: 'Artisan Stores', href: '/artisans' },
    { label: 'Our Impact', href: '/about#impact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-warmWhite/95 backdrop-blur-md border-b border-sand-200 transition-all">
      {/* Main Top Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-accentLime flex items-center justify-center shadow-soft group-hover:bg-forest-900 transition-colors">
              <Leaf className="w-5 h-5 transition-transform group-hover:rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-forest-950 font-sans leading-none">
                Res<span className="text-forest-600">Crafted</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal-light mt-0.5">
                Give Waste a Second Life
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search upcycled decor, refurbished tech, zero waste..."
              className="w-full bg-white rounded-full border border-sand-300 pl-11 pr-24 py-2.5 text-sm text-charcoal placeholder-charcoal-light/70 focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100 shadow-soft transition-all"
            />
            <Search className="w-4 h-4 text-charcoal-light absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
            >
              Search
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Become a Seller Link */}
            {(!currentUser || currentUser.role === 'customer') && (
              <Link
                to="/seller/register"
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200 px-3.5 py-2 rounded-xl transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Sell Goods</span>
              </Link>
            )}

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-charcoal-muted hover:text-forest-800 hover:bg-sand-100 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-charcoal-muted hover:text-forest-800 hover:bg-sand-100 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-forest-800 text-accentLime text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Menu */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-white border border-sand-300 hover:border-forest-400 transition-all shadow-soft"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center">
                      {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-charcoal max-w-[100px] truncate">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-charcoal-light" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-sand-200 py-2 z-50 animate-in fade-in zoom-in-95"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-sand-100">
                        <p className="text-xs text-charcoal-light">Signed in as</p>
                        <p className="text-xs font-bold text-forest-900 truncate">
                          {currentUser.email}
                        </p>
                        <span className="inline-block mt-1 uppercase text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200">
                          {currentUser.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-50"
                        >
                          <Package className="w-4 h-4 text-charcoal-light" />
                          My Orders
                        </Link>

                        <Link
                          to="/addresses"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-50"
                        >
                          <MapPin className="w-4 h-4 text-charcoal-light" />
                          Saved Addresses
                        </Link>

                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-50"
                        >
                          <User className="w-4 h-4 text-charcoal-light" />
                          Profile Settings
                        </Link>

                        {currentUser.role === 'seller' && (
                          <Link
                            to="/seller/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-forest-800 hover:bg-forest-50"
                          >
                            <Store className="w-4 h-4 text-forest-700" />
                            Seller Dashboard
                          </Link>
                        )}

                        {currentUser.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50"
                          >
                            <Store className="w-4 h-4 text-purple-600" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-sand-100 pt-1">
                        <button
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-forest-900 hover:text-forest-700 px-3 py-2 rounded-xl transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex text-xs font-bold bg-forest-800 hover:bg-forest-900 text-white px-4 py-2 rounded-xl transition-colors shadow-soft"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-charcoal hover:bg-sand-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Category Navigation Rail */}
        <nav className="hidden md:flex items-center justify-between border-t border-sand-200/60 py-2.5 text-xs font-semibold text-charcoal">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="hover:text-forest-700 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-forest-700 bg-forest-50/80 px-2.5 py-1 rounded-full border border-forest-100">
            <span>🛡️ 100% Verified Sustainability Policy</span>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-warmWhite border-t border-sand-200 px-4 pt-3 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white rounded-xl border border-sand-300 pl-10 pr-4 py-2.5 text-sm"
            />
            <Search className="w-4 h-4 text-charcoal-light absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col gap-1 border-y border-sand-200 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 text-sm font-semibold text-charcoal hover:bg-sand-100 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {(!currentUser || currentUser.role === 'customer') && (
              <Link
                to="/seller/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-forest-300 bg-forest-50 text-forest-900 font-bold text-xs"
              >
                <Store className="w-4 h-4" />
                <span>Become a Seller</span>
              </Link>
            )}

            {currentUser && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl border border-sand-300 text-center text-xs font-bold text-charcoal flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" /> My Orders
                </Link>
                <Link
                  to="/addresses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl border border-sand-300 text-center text-xs font-bold text-charcoal flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" /> Addresses
                </Link>
              </div>
            )}

            {!currentUser && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl border border-sand-300 text-center text-xs font-bold text-charcoal"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-forest-800 text-white text-center text-xs font-bold"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

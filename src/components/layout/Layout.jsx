import React from 'react';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({
  children,
  cartCount = 0,
  wishlistCount = 0,
  currentUser = null,
  onLogout,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-warmWhite text-charcoal">
      <AnnouncementBar />
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

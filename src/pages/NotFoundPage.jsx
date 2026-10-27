import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-20 h-20 rounded-3xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 text-3xl font-black mb-6 shadow-soft">
        404
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-forest-950 mb-3">
        Page Not Found
      </h1>

      <p className="text-sm text-charcoal-muted max-w-md mb-8 leading-relaxed">
        The sustainable treasure or page you are looking for may have moved, found a new home, or
        doesn't exist.
      </p>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Link to="/">
          <Button variant="primary" size="md" icon={Home}>
            Back to Homepage
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="secondary" size="md">
            Explore Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

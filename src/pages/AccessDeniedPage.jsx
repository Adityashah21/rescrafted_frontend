import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

const AccessDeniedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-6 shadow-soft">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-black text-forest-950 mb-2">Access Denied</h1>

      <p className="text-sm text-charcoal-muted max-w-md mb-8 leading-relaxed">
        You do not have the required administrative or seller privileges to access this area. If
        you believe this is a mistake, please reach out to platform support.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" icon={Home}>
            Back to Home
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="secondary" size="md">
            My Account
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AccessDeniedPage;

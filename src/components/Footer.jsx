import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-green-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5" />
            <span className="text-xl font-bold">Rescrafted</span>
          </div>
          <p className="text-green-200 text-sm">A sustainable marketplace for upcycled scrap and handcrafted items.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-green-200 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Join Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-green-200 text-sm">rescrafted@email.com</p>
          <p className="text-green-200 text-sm mt-1">Made with 💚 for a greener planet</p>
        </div>
      </div>
      <div className="border-t border-green-700 text-center py-4 text-green-300 text-sm">
        © 2024 Rescrafted. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
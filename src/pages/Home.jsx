import { Link } from 'react-router-dom';
import { Leaf, Recycle, ShoppingBag, Award, ArrowRight, Package } from 'lucide-react';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-600 bg-opacity-50 px-4 py-2 rounded-full mb-6 text-sm">
            <Leaf className="w-4 h-4" /> Sustainable Marketplace
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Turn Scrap Into <br />
            <span className="text-green-300">Something Beautiful</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Rescrafted connects scrap sellers, craft artists, and conscious buyers in one eco-friendly marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace" className="bg-white text-green-700 px-8 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all flex items-center justify-center gap-2 shadow-lg">
              <ShoppingBag className="w-5 h-5" /> Browse Marketplace
            </Link>
            <Link to="/register" className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-green-700 transition-all flex items-center justify-center gap-2">
              Start Selling <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">How Rescrafted Works</h2>
            <p className="text-gray-500">Simple steps to buy or sell on our platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Recycle className="w-8 h-8 text-green-600" />, title: "List Your Scrap", desc: "Scrap sellers list waste materials. Craft buyers browse and source materials for their creations." },
              { icon: <Award className="w-8 h-8 text-purple-600" />, title: "Sell Handicrafts", desc: "Craft sellers list handmade products created from upcycled materials for craft buyers." },
              { icon: <ShoppingBag className="w-8 h-8 text-blue-600" />, title: "Buy Sustainably", desc: "Buyers discover unique, eco-friendly products and materials at great prices." },
            ].map((step, i) => (
              <div key={i} className="text-center p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Join As</h2>
            <p className="text-gray-500">Choose your role and get started</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Scrap Seller', emoji: '♻️', color: 'bg-orange-50 border-orange-200', btn: 'bg-orange-500', desc: 'List scrap materials and find buyers who can reuse them.' },
              { role: 'Craft Seller', emoji: '🎨', color: 'bg-purple-50 border-purple-200', btn: 'bg-purple-500', desc: 'Sell beautiful handcrafted products made from upcycled materials.' },
              { role: 'Scrap Buyer', emoji: '🔩', color: 'bg-blue-50 border-blue-200', btn: 'bg-blue-500', desc: 'Source raw scrap materials for your manufacturing or craft work.' },
              { role: 'Craft Buyer', emoji: '🛍️', color: 'bg-green-50 border-green-200', btn: 'bg-green-500', desc: 'Discover and purchase unique sustainable handcrafted items.' },
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-3xl border-2 ${item.color} hover:shadow-lg transition-all`}>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.role}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{item.desc}</p>
                <Link to="/register" className={`${item.btn} text-white text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-all font-medium block text-center`}>
                  Join as {item.role}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-green-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-green-200 text-lg mb-8">Join thousands of users building a sustainable future.</p>
          <Link to="/register" className="bg-white text-green-700 px-10 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all inline-flex items-center gap-2 shadow-lg">
            <Package className="w-5 h-5" /> Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
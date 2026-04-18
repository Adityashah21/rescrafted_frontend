import { Link } from 'react-router-dom';
import { Tag, Package, User } from 'lucide-react';

function ProductCard({ product }) {
  const imageUrl = product.images?.[0]?.url || null;

  return (
    <Link to={`/product/${product._id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:-translate-y-1">
        {/* Image */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-50">
              <Package className="w-12 h-12 text-green-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              product.category === 'scrap'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-purple-100 text-purple-600'
            }`}>
              {product.category === 'scrap' ? '♻️ Scrap' : '🎨 Handicraft'}
            </span>
            <span className="text-xs text-gray-400">{product.unit}</span>
          </div>

          <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{product.title}</h3>

          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <User className="w-3 h-3" />
            <span>{product.seller?.name || 'Unknown Seller'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">₹{product.price}</span>
            <span className="text-xs text-gray-500">Stock: {product.stock}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
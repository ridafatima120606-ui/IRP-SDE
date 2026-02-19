import React, { useState } from 'react';
import { ShoppingCart, Heart, Clock, Leaf, Flame, Sprout, Droplet, AlertCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  prepTime: number;
  calories?: number;
  isVegetarian: boolean;
  isVegan: boolean;
  carbonFootprint?: number;
  locallySourced: boolean;
  spiceLevel?: number;
  allergens: string[];
  image?: string;
  customizations?: string[];
}

interface MenuItemCardProps {
  item: MenuItem;
  quantity?: number;
  onAddToCart: (item: MenuItem, quantity: number, options: string[]) => void;
  onQuantityChange?: (quantity: number) => void;
}

export default function MenuItemCard({ item, quantity = 1, onAddToCart, onQuantityChange }: MenuItemCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [qty, setQty] = useState(quantity);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const commonOptions =
    item.customizations && item.customizations.length > 0
      ? item.customizations
      : ['No Salt', 'Extra Spicy', 'Less Oil', 'Gluten Free', 'Extra Cheese', 'Half Portion'];

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(item, qty, selectedOptions);
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleQuantityChange = (newQty: number) => {
    if (newQty > 0) {
      setQty(newQty);
      onQuantityChange?.(newQty);
    }
  };

  const toggleOption = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  // Generate image URL using placeholder service
  const getImageUrl = () => {
    if (item.image) {
      return item.image;
    }
    
    // Use reliable placeholder images based on category
    const imageMap: { [key: string]: string } = {
      'MAIN': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80',
      'APPETIZER': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80',
      'DESSERT': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&q=80',
      'BEVERAGE': 'https://images.unsplash.com/photo-1505252585461-04db1267ae5b?w=400&h=300&fit=crop&q=80',
      'SALAD': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&q=80',
      'SOUP': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80',
      'SANDWICH': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&q=80',
    };
    
    const category = item.category.toUpperCase();
    return imageMap[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80';
  };

  // Calculate sustainability score
  const getSustainabilityScore = () => {
    let score = 0;
    if (item.isVegetarian) score += 25;
    if (item.isVegan) score += 50;
    if (item.locallySourced) score += 25;
    return Math.min(score, 100);
  };

  // Get sustainability level
  const getSustainabilityLevel = (score: number) => {
    if (score >= 75) return { level: 'Excellent', color: 'text-green-500' };
    if (score >= 50) return { level: 'Good', color: 'text-emerald-500' };
    if (score >= 25) return { level: 'Fair', color: 'text-yellow-500' };
    return { level: 'Lower', color: 'text-orange-500' };
  };

  const sustainabilityScore = getSustainabilityScore();
  const { level: sustainabilityLevel, color: sustainabilityColor } =
    getSustainabilityLevel(sustainabilityScore);

  const spiceLevelDisplay = item.spiceLevel ? '🌶️'.repeat(item.spiceLevel) : '';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-orange-500 transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
        {!imageError && (
          <img 
            src={getImageUrl()} 
            alt={item.name} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        {imageError && (
          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-gradient-to-br from-slate-700 to-slate-800">
            <div className="text-4xl">🍽️</div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          {item.isVegan && (
            <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Vegan
            </div>
          )}
          {item.isVegetarian && !item.isVegan && (
            <div className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Veggie
            </div>
          )}
          {item.locallySourced && (
            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Local
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2 left-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition">
            {item.name}
          </h3>
          <p className="text-xs text-slate-400">{item.category}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 mb-3 line-clamp-2">{item.description}</p>

        {/* Info Row 1 - Prep Time, Calories, Spice */}
        <div className="flex gap-3 mb-3 text-xs">
          {/* Prep Time */}
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{item.prepTime}m</span>
          </div>

          {/* Calories */}
          {item.calories && (
            <div className="flex items-center gap-1 text-slate-400">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>{item.calories}cal</span>
            </div>
          )}

          {/* Spice */}
          {item.spiceLevel && item.spiceLevel > 0 && (
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-sm">{spiceLevelDisplay}</span>
            </div>
          )}
        </div>

        {/* Info Row 2 - Sustainability & Carbon */}
        <div className="flex gap-3 mb-3 text-xs">
          {/* Sustainability Score */}
          <div className={`flex items-center gap-1 ${sustainabilityColor}`}>
            <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'currentColor' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${sustainabilityScore}%`,
                  backgroundColor: 'currentColor',
                }}
              />
            </div>
            <span className="font-medium">{sustainabilityLevel}</span>
          </div>

          {/* Carbon Footprint */}
          {item.carbonFootprint && (
            <div className="flex items-center gap-1 text-slate-400">
              <Leaf className="w-3.5 h-3.5 text-green-500" />
              <span>{item.carbonFootprint}kg CO₂</span>
            </div>
          )}
        </div>

        {/* Allergens */}
        {item.allergens.length > 0 && (
          <div className="mb-3 p-2 bg-slate-700 rounded text-xs text-yellow-400 flex items-start gap-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Contains: {item.allergens.join(', ')}</span>
          </div>
        )}

        {/* Options Section */}
        <div className="mb-3">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
          >
            {showOptions ? '✕ Hide Options' : '+ Add Options'}
          </button>
          
          {showOptions && (
            <div className="mt-2 p-2 bg-slate-700 rounded border border-slate-600">
              <p className="text-xs font-semibold text-slate-300 mb-2">Customizations:</p>
              <div className="space-y-1.5">
                {commonOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option)}
                      onChange={() => toggleOption(option)}
                      className="w-4 h-4 rounded border-slate-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quantity and Price */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-2xl font-bold text-orange-500">₹{(item.price * qty).toFixed(2)}</div>
          <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-2 py-1.5">
            <button
              onClick={() => handleQuantityChange(qty - 1)}
              className="w-6 h-6 flex items-center justify-center rounded bg-slate-600 hover:bg-slate-500 text-white font-semibold text-sm"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-white text-sm">{qty}</span>
            <button
              onClick={() => handleQuantityChange(qty + 1)}
              className="w-6 h-6 flex items-center justify-center rounded bg-slate-600 hover:bg-slate-500 text-white font-semibold text-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
            isAdding
              ? 'bg-green-600 text-white'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{isAdding ? 'Added to Cart!' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}

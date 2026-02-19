'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/services/menu';
import { Heart, Clock, Utensils } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem, quantity?: number, options?: string[]) => void;
  onFavorite?: (item: MenuItem) => void;
}

// Sustainability badge icons
const SUSTAINABILITY_BADGES: Record<string, { icon: string; label: string; color: string }> = {
  VEGAN: { icon: '🌱', label: 'Vegan', color: 'bg-green-100' },
  VEGETARIAN: { icon: '🥬', label: 'Vegetarian', color: 'bg-green-50' },
  LOCAL: { icon: '🌍', label: 'Local', color: 'bg-blue-100' },
  ORGANIC: { icon: '🍃', label: 'Organic', color: 'bg-lime-100' },
  CARBON_NEUTRAL: { icon: '♻️', label: 'Carbon Neutral', color: 'bg-teal-100' },
  ECO_PACKAGING: { icon: '📦', label: 'Eco Packaging', color: 'bg-amber-100' },
  FAIR_TRADE: { icon: '🤝', label: 'Fair Trade', color: 'bg-orange-100' },
  SEASONAL: { icon: '🌾', label: 'Seasonal', color: 'bg-yellow-100' }
};

// Mood tag colors
const MOOD_COLORS: Record<string, string> = {
  HAPPY: 'bg-yellow-100 text-yellow-800',
  ROMANTIC: 'bg-red-100 text-red-800',
  CALM: 'bg-blue-100 text-blue-800',
  ENERGETIC: 'bg-orange-100 text-orange-800',
  ADVENTUROUS: 'bg-purple-100 text-purple-800',
  COMFORTABLE: 'bg-green-100 text-green-800'
};

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart, onFavorite }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const commonOptions =
    item.customizations && item.customizations.length > 0
      ? item.customizations
      : ['No Salt', 'Extra Spicy', 'Less Oil', 'Gluten Free', 'Extra Cheese', 'Half Portion'];

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(item);
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    onAddToCart?.(item, qty, selectedOptions);
    
    // Reset button after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  const toggleOption = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  // Get sustainability badges
  const badges = item.sustainabilityScore?.badges || [];
  const sustainability = item.sustainabilityMetrics;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {item.imageUrl && !imageBroken ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
            <Utensils className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Availability Badge */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Unavailable
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 text-xs font-semibold px-2 py-1 rounded-full">
          {item.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title and Price */}
        <div className="mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
            {item.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">
              ₹{item.price.toFixed(2)}
            </span>
            {item.prepTime && (
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <Clock className="w-4 h-4" />
                <span>{item.prepTime} min</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description || 'No description available'}
        </p>

        {/* Mood Tags */}
        {item.moodTags && item.moodTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {item.moodTags.slice(0, 2).map((mood) => (
              <span
                key={mood}
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  MOOD_COLORS[mood] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {mood}
              </span>
            ))}
            {item.moodTags.length > 2 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-medium">
                +{item.moodTags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Sustainability Badges */}
        {badges.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {badges.slice(0, 3).map((badgeKey) => {
              const badge = SUSTAINABILITY_BADGES[badgeKey];
              return badge ? (
                <div
                  key={badgeKey}
                  className={`${badge.color} rounded-full p-1.5 flex items-center gap-1 text-xs font-medium tooltip`}
                  title={badge.label}
                >
                  <span>{badge.icon}</span>
                </div>
              ) : null;
            })}
            {badges.length > 3 && (
              <div className="bg-gray-100 rounded-full px-2 py-1.5 flex items-center text-xs font-medium">
                +{badges.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Options Section */}
        <div className="mb-3">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
          >
            {showOptions ? '✕ Hide Options' : '+ Add Options'}
          </button>
          
          {showOptions && (
            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Customizations:</p>
              <div className="space-y-1.5">
                {commonOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option)}
                      onChange={() => toggleOption(option)}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 group-hover:text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quantity and Add to Cart */}
        <div className="mt-auto flex gap-2 items-center">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1.5 border border-gray-300">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-5 h-5 flex items-center justify-center rounded bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold text-xs"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-gray-900 text-xs">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-5 h-5 flex items-center justify-center rounded bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold text-xs"
            >
              +
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!item.available}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-300 ${
              isAdded
                ? 'bg-green-500 text-white'
                : item.available
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAdded ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

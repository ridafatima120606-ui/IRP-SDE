import React from 'react';
import { Sparkles } from 'lucide-react';
import MenuItemCard from './MenuItemCard';

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
}

interface RecommendedItemsProps {
  items: MenuItem[];
  selectedMood: string;
  onAddToCart: (item: MenuItem) => void;
}

const moodDescriptions: Record<string, string> = {
  romantic: 'Perfect for intimate evening dinners',
  family: 'Great dishes for the whole family',
  business: 'Professional and elegant selections',
  birthday: 'Celebratory and special occasion dishes',
  casual: 'Easy-going, everyday favorites',
};

export default function RecommendedItems({
  items,
  selectedMood,
  onAddToCart,
}: RecommendedItemsProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">No recommendations yet</p>
        <p className="text-slate-500 text-sm mt-2">Select a dining mood to get personalized suggestions</p>
      </div>
    );
  }

  const moodEmoji: Record<string, string> = {
    romantic: '💕',
    family: '👨‍👩‍👧‍👦',
    business: '💼',
    birthday: '🎉',
    casual: '😎',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{moodEmoji[selectedMood] || '✨'}</span>
          <div>
            <h2 className="text-2xl font-bold text-white capitalize">
              {selectedMood} Dining Recommendations
            </h2>
            <p className="text-slate-400 text-sm">
              {moodDescriptions[selectedMood] || 'Handpicked selections for your visit'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-orange-500" />
          Dining Tips for Your Mood
        </h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          {selectedMood === 'romantic' && (
            <>
              <li>✓ Arrive 10-15 minutes early for a relaxed check-in</li>
              <li>✓ Consider our wine pairing recommendations</li>
              <li>✓ Request a private corner or window seating</li>
            </>
          )}
          {selectedMood === 'family' && (
            <>
              <li>✓ We have kids menus available on request</li>
              <li>✓ High chairs provided for infants</li>
              <li>✓ Larger table options for group dining</li>
            </>
          )}
          {selectedMood === 'business' && (
            <>
              <li>✓ Quiet seating areas available</li>
              <li>✓ WiFi and power outlets at all tables</li>
              <li>✓ Invoice generation available</li>
            </>
          )}
          {selectedMood === 'birthday' && (
            <>
              <li>✓ Birthday cake delivery available</li>
              <li>✓ Special decorations on request</li>
              <li>✓ Group discounts available</li>
            </>
          )}
          {selectedMood === 'casual' && (
            <>
              <li>✓ Quick service available</li>
              <li>✓ Flexible timing to match your pace</li>
              <li>✓ Sharing platters recommended</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Gift, TrendingDown, ShoppingCart } from 'lucide-react';

interface ComboOffer {
  id: string;
  name: string;
  description: string;
  items: Array<{ name: string; quantity: number }>;
  regularPrice: number;
  comboPrice: number;
  discount: number;
  image?: string;
}

interface ComboOffersProps {
  onAddToCart: (combo: any) => void;
}

// Mock combo offers - in real app, fetch from API
const mockCombos: ComboOffer[] = [
  {
    id: 'combo-1',
    name: 'Romantic Dinner for Two',
    description: 'Perfect for date nights - includes appetizer, main course, dessert & wine',
    items: [
      { name: 'Garlic Bread', quantity: 1 },
      { name: "Steak with Sides", quantity: 2 },
      { name: 'Cheesecake', quantity: 2 },
    ],
    regularPrice: 1200,
    comboPrice: 899,
    discount: 25,
    image: '❤️',
  },
  {
    id: 'combo-2',
    name: 'Family Feast',
    description: '4 people, 2 appetizers, 2 mains, 1 dessert to share',
    items: [
      { name: 'Spring Rolls', quantity: 1 },
      { name: 'Samosas', quantity: 1 },
      { name: 'Butter Chicken', quantity: 1 },
      { name: 'Fish Curry', quantity: 1 },
      { name: 'Gulab Jamuns', quantity: 1 },
    ],
    regularPrice: 1600,
    comboPrice: 1099,
    discount: 31,
    image: '👨‍👩‍👧‍👦',
  },
  {
    id: 'combo-3',
    name: 'Business Lunch',
    description: 'Quick yet satisfying - appetizer, business special, beverage',
    items: [
      { name: 'Soup of the Day', quantity: 1 },
      { name: 'Grilled Chicken Salad', quantity: 1 },
      { name: 'Bottled Water', quantity: 1 },
    ],
    regularPrice: 450,
    comboPrice: 349,
    discount: 22,
    image: '💼',
  },
  {
    id: 'combo-4',
    name: 'Birthday Special',
    description: 'Celebration combo with appetizers, mains, cake & decorations',
    items: [
      { name: 'Nachos', quantity: 1 },
      { name: 'Loaded Fries', quantity: 1 },
      { name: 'Mixed Grill', quantity: 1 },
      { name: 'Chocolate Cake', quantity: 1 },
    ],
    regularPrice: 1400,
    comboPrice: 999,
    discount: 29,
    image: '🎉',
  },
  {
    id: 'combo-5',
    name: 'Vegan Delight',
    description: 'Plant-based menu - appetizer, main, sides & dessert',
    items: [
      { name: 'Veggie Spring Rolls', quantity: 1 },
      { name: 'Vegetable Biryani', quantity: 2 },
      { name: 'Cucumber Raita', quantity: 1 },
      { name: 'Fruit Sorbet', quantity: 2 },
    ],
    regularPrice: 850,
    comboPrice: 599,
    discount: 30,
    image: '🥗',
  },
  {
    id: 'combo-6',
    name: 'Power Brunch',
    description: 'Healthy options - fresh juices, light mains, salad',
    items: [
      { name: 'Fresh Juice', quantity: 2 },
      { name: 'Eggs Benedict', quantity: 1 },
      { name: 'Greek Salad', quantity: 1 },
    ],
    regularPrice: 650,
    comboPrice: 449,
    discount: 31,
    image: '🥤',
  },
];

export default function ComboOffers({ onAddToCart }: ComboOffersProps) {
  const [selectedCombos, setSelectedCombos] = useState<Set<string>>(new Set());

  const handleSelectCombo = (comboId: string) => {
    const newSelected = new Set(selectedCombos);
    if (newSelected.has(comboId)) {
      newSelected.delete(comboId);
    } else {
      newSelected.add(comboId);
    }
    setSelectedCombos(newSelected);
  };

  const handleAddComboToCart = (combo: ComboOffer) => {
    onAddToCart({
      id: combo.id,
      name: combo.name,
      description: combo.description,
      price: combo.comboPrice,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-8 h-8 text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold text-white">Special Combo Offers</h2>
            <p className="text-slate-400 text-sm">
              Save more with our carefully curated meal combos
            </p>
          </div>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCombos.map((combo) => {
          const isSelected = selectedCombos.has(combo.id);
          const savingsAmount = combo.regularPrice - combo.comboPrice;

          return (
            <div
              key={combo.id}
              className={`rounded-lg border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-orange-500 bg-slate-700 shadow-lg'
                  : 'border-slate-700 bg-slate-800 hover:border-orange-500'
              }`}
              onClick={() => handleSelectCombo(combo.id)}
            >
              {/* Image Section */}
              <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {combo.image}
                </div>

                {/* Discount Badge */}
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  {combo.discount}% OFF
                </div>

                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-6 h-6 accent-orange-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-1">{combo.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{combo.description}</p>

                {/* Items List */}
                <div className="mb-3 p-3 bg-slate-700 rounded-lg">
                  <p className="text-xs text-slate-400 font-semibold mb-2">INCLUDES:</p>
                  <ul className="space-y-1">
                    {combo.items.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-orange-500">✓</span>
                        {item.quantity > 1 && <span className="font-semibold">{item.quantity}x</span>}
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Section */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 line-through">₹{combo.regularPrice}</p>
                    <p className="text-2xl font-bold text-orange-500">₹{combo.comboPrice}</p>
                    <p className="text-xs text-green-400 font-semibold">
                      Save ₹{savingsAmount}
                    </p>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddComboToCart(combo);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Combo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Gift className="text-orange-500" />
          Why Choose Our Combos?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="text-2xl">💰</div>
            <div>
              <p className="font-semibold text-white text-sm">Save Up to 31%</p>
              <p className="text-slate-400 text-xs">Compared to ordering items individually</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">⏱️</div>
            <div>
              <p className="font-semibold text-white text-sm">Faster Service</p>
              <p className="text-slate-400 text-xs">Pre-planned meals are prepared quicker</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="font-semibold text-white text-sm">Curated Selection</p>
              <p className="text-slate-400 text-xs">Expert picks for perfect combinations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

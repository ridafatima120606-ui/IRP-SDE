import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MenuFiltersProps {
  filters: {
    search: string;
    category: string;
    priceRange: [number, number];
    dietary: string[];
    spiceLevel: number;
    isVegetarianOnly: boolean;
    isLocalOnly: boolean;
  };
  categories: string[];
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

export default function MenuFilters({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
}: MenuFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    dietary: true,
    spice: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (value: number, end: boolean) => {
    const newRange: [number, number] = end
      ? [filters.priceRange[0], value]
      : [value, filters.priceRange[1]];
    onFilterChange({ ...filters, priceRange: newRange });
  };

  const handleDietaryToggle = (dietary: string) => {
    const newDietary = filters.dietary.includes(dietary)
      ? filters.dietary.filter((d) => d !== dietary)
      : [...filters.dietary, dietary];
    onFilterChange({ ...filters, dietary: newDietary });
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sticky top-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-white text-lg">Filters</h2>
        <button
          onClick={onClearFilters}
          className="text-xs text-orange-500 hover:text-orange-400 transition"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex justify-between items-center text-white font-medium mb-2"
          >
            <span>Category</span>
            <ChevronDown
              className={`w-4 h-4 transition ${expandedSections.category ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.category && (
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.category === category}
                    onChange={() => onFilterChange({ ...filters, category })}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-slate-300 text-sm">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="border-t border-slate-700 pt-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex justify-between items-center text-white font-medium mb-2"
          >
            <span>Price Range</span>
            <ChevronDown
              className={`w-4 h-4 transition ${expandedSections.price ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.price && (
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs">Min: ₹{filters.priceRange[0]}</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(parseInt(e.target.value), false)}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs">Max: ₹{filters.priceRange[1]}</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(parseInt(e.target.value), true)}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dietary Filters */}
        <div className="border-t border-slate-700 pt-4">
          <button
            onClick={() => toggleSection('dietary')}
            className="w-full flex justify-between items-center text-white font-medium mb-2"
          >
            <span>Dietary</span>
            <ChevronDown
              className={`w-4 h-4 transition ${expandedSections.dietary ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.dietary && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isVegetarianOnly}
                  onChange={(e) =>
                    onFilterChange({ ...filters, isVegetarianOnly: e.target.checked })
                  }
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-slate-300 text-sm">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.dietary.includes('vegan')}
                  onChange={() => handleDietaryToggle('vegan')}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-slate-300 text-sm">Vegan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.dietary.includes('gluten-free')}
                  onChange={() => handleDietaryToggle('gluten-free')}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-slate-300 text-sm">Gluten Free</span>
              </label>
            </div>
          )}
        </div>

        {/* Spice Level */}
        <div className="border-t border-slate-700 pt-4">
          <button
            onClick={() => toggleSection('spice')}
            className="w-full flex justify-between items-center text-white font-medium mb-2"
          >
            <span>Max Spice Level</span>
            <ChevronDown
              className={`w-4 h-4 transition ${expandedSections.spice ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.spice && (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.spiceLevel === level}
                    onChange={() => onFilterChange({ ...filters, spiceLevel: level })}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-slate-300 text-sm">
                    {level === 0 ? 'No Spice' : `Level ${level}`}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Local Ingredients */}
        <div className="border-t border-slate-700 pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isLocalOnly}
              onChange={(e) => onFilterChange({ ...filters, isLocalOnly: e.target.checked })}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-slate-300 text-sm font-medium">Locally Sourced Only</span>
          </label>
        </div>
      </div>
    </div>
  );
}

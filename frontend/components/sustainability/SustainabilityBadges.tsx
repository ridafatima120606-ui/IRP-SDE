'use client';

import React from 'react';

interface Badge {
  icon: string;
  label: string;
  description: string;
}

interface SustainabilityBadgesProps {
  badges: Badge[];
  size?: 'small' | 'medium' | 'large';
}

export const SustainabilityBadges: React.FC<SustainabilityBadgesProps> = ({
  badges,
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'text-lg gap-1',
    medium: 'text-2xl gap-2',
    large: 'text-3xl gap-3',
  };

  const tooltipSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div className={`flex flex-wrap ${sizeClasses[size]}`}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className="relative group cursor-help"
          title={badge.description}
        >
          <span className="hover:scale-110 transition-transform duration-200">
            {badge.icon}
          </span>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white rounded px-3 py-2 whitespace-nowrap text-center">
              <p className={`font-semibold ${tooltipSize[size]}`}>
                {badge.label}
              </p>
              <p className={`text-gray-300 ${tooltipSize[size]}`}>
                {badge.description}
              </p>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SustainabilityBadges;

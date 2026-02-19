'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SustainabilityScore {
  overallScore: number;
  carbonScore: number;
  vegetarianScore: number;
  localScore: number;
  organicScore: number;
  badges: any[];
  recommendation: string;
}

interface SustainabilityScoreDisplayProps {
  score: SustainabilityScore;
  compact?: boolean;
}

const ScoreBar: React.FC<{ label: string; score: number }> = ({
  label,
  score,
}) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-lime-500';
    if (s >= 40) return 'bg-yellow-500';
    if (s >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{score}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export const SustainabilityScoreDisplay: React.FC<
  SustainabilityScoreDisplayProps
> = ({ score, compact = false }) => {
  const getMainColor = (s: number) => {
    if (s >= 85) return 'from-green-400 to-green-600';
    if (s >= 70) return 'from-lime-400 to-green-500';
    if (s >= 50) return 'from-yellow-400 to-lime-500';
    return 'from-red-400 to-orange-500';
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gradient-to-r rounded-lg text-white">
        <div>
          <p className="text-sm font-semibold">Sustainability Score</p>
          <p className="text-xs text-white/80">{score.recommendation}</p>
        </div>
        <motion.div
          className={`text-4xl font-bold bg-gradient-to-br ${getMainColor(
            score.overallScore
          )} bg-clip-text text-transparent`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {score.overallScore}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Sustainability Score</h3>

        <motion.div
          className={`text-6xl font-bold bg-gradient-to-br ${getMainColor(
            score.overallScore
          )} bg-clip-text text-transparent mb-2`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {score.overallScore}
        </motion.div>

        <p className="text-lg font-semibold text-gray-700">
          {score.recommendation}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ScoreBar label="🌍 Carbon" score={score.carbonScore} />
        <ScoreBar label="🥬 Vegetarian" score={score.vegetarianScore} />
        <ScoreBar label="🌾 Local" score={score.localScore} />
        <ScoreBar label="🍃 Organic" score={score.organicScore} />
      </div>

      {score.badges && score.badges.length > 0 && (
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Badges:</p>
          <div className="flex flex-wrap gap-2">
            {score.badges.map((badge, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                title={badge.description}
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-xs font-medium text-green-700">
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityScoreDisplay;

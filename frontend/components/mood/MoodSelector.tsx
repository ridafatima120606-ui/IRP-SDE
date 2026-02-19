'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Mood {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const moods: Mood[] = [
  {
    id: 'romantic',
    name: 'Romantic',
    icon: '💕',
    color: 'from-pink-400 to-red-400',
    description: 'Intimate and elegant',
  },
  {
    id: 'family',
    name: 'Family',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-blue-400 to-cyan-400',
    description: 'Fun and casual',
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    color: 'from-gray-600 to-slate-600',
    description: 'Professional and quiet',
  },
  {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎉',
    color: 'from-yellow-400 to-orange-400',
    description: 'Festive and celebratory',
  },
];

interface MoodSelectorProps {
  onMoodSelect: (moodId: string) => void;
  selectedMood?: string;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  onMoodSelect,
  selectedMood,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-2">
        How's your mood today?
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Select your dining mood to get personalized recommendations
      </p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            variants={itemVariants}
            onClick={() => onMoodSelect(mood.id)}
            className={`relative p-6 rounded-xl text-center transition-all duration-300 ${
              selectedMood === mood.id
                ? `bg-gradient-to-br ${mood.color} text-white shadow-lg scale-105`
                : 'bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-900'
            }`}
          >
            <div className="text-5xl mb-2">{mood.icon}</div>
            <h3 className="font-bold text-lg mb-1">{mood.name}</h3>
            <p
              className={`text-sm ${
                selectedMood === mood.id
                  ? 'text-white/90'
                  : 'text-gray-600'
              }`}
            >
              {mood.description}
            </p>

            {selectedMood === mood.id && (
              <motion.div
                className="absolute top-2 right-2 text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default MoodSelector;

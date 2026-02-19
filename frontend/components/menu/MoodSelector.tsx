import React from 'react';
import { Heart, Users, Briefcase, Cake, Utensils, Sparkles } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

const moods = [
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'from-red-500 to-pink-500' },
  { id: 'family', label: 'Family', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'business', label: 'Business', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
  { id: 'birthday', label: 'Birthday', icon: Cake, color: 'from-yellow-500 to-orange-500' },
  { id: 'casual', label: 'Casual', icon: Utensils, color: 'from-purple-500 to-indigo-500' },
];

export default function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-white">What's Your Dining Mood?</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onMoodChange(isSelected ? '' : mood.id)}
              className={`p-4 rounded-lg transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-br ${mood.color} text-white shadow-lg scale-105`
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">{mood.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

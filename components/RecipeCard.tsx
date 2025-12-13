import React from 'react';
import { Recipe, FlavorProfile } from '../types';
import { Clock, ChefHat, ArrowRight } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const FLAVOR_THEMES = {
  [FlavorProfile.SWEET]: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-600',
    badge: 'bg-pink-100 text-pink-700',
    gradient: 'from-pink-400 to-rose-400',
    icon: '🍬'
  },
  [FlavorProfile.SOUR]: {
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    text: 'text-lime-600',
    badge: 'bg-lime-100 text-lime-700',
    gradient: 'from-lime-400 to-green-400',
    icon: '🍋'
  },
  [FlavorProfile.SALTY]: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-400 to-indigo-400',
    icon: '🥨'
  }
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const theme = FLAVOR_THEMES[recipe.flavorProfile] || FLAVOR_THEMES[FlavorProfile.SALTY];

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden cursor-pointer
        rounded-3xl border-2 ${theme.border} ${theme.bg}
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        group h-full flex flex-col
      `}
    >
      {/* Header Gradient */}
      <div className={`h-24 bg-gradient-to-r ${theme.gradient} p-4 flex items-start justify-between relative`}>
        <span className="text-4xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">
          {theme.icon}
        </span>
        <span className={`
          px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white/90 shadow-sm
          ${theme.text}
        `}>
          {recipe.flavorProfile}
        </span>
        
        {/* Decorative bubbles */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {recipe.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {recipe.prepTimeMinutes}m
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-3 h-3" />
            {recipe.difficulty}
          </div>
          <div className="ml-auto flex items-center gap-1 text-gray-900 group-hover:translate-x-1 transition-transform">
            Let's Cook <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

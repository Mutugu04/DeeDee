import React from 'react';
import { Recipe } from '../types';
import { ChefHat, Star, Leaf, Award, ArrowLeft, Recycle } from 'lucide-react';

interface MyKitchenProps {
  completedRecipes: Recipe[];
  onBack: () => void;
}

export const MyKitchen: React.FC<MyKitchenProps> = ({ completedRecipes, onBack }) => {
  return (
    <div className="animate-in slide-in-from-right fade-in duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </button>

      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-ocean-teal to-blue-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">My Kitchen</h1>
            <p className="text-blue-100">
              You've cooked <span className="font-bold text-yellow-300 text-xl">{completedRecipes.length}</span> meals! 
              {completedRecipes.length > 2 && " You're on fire! 🔥"}
            </p>
          </div>
          <ChefHat className="absolute bottom-[-20px] right-[-20px] w-40 h-40 text-white/20 rotate-12" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Completed Tasks Column */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <Award className="w-6 h-6 text-candy-pink" />
              Completed Meals
            </h2>
            
            {completedRecipes.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400">
                <p>No meals yet! Start cooking to fill up your trophy case.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedRecipes.map((recipe, idx) => (
                  <div key={`${recipe.id}-${idx}`} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-pink-200 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-800">{recipe.title}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(recipe.dateCooked || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-pink-50 text-candy-pink flex items-center justify-center font-bold text-xs">
                      {recipe.flavorProfile[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions Column */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <Leaf className="w-6 h-6 text-green-500" />
              Chef's Suggestions
            </h2>
            
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100 space-y-6">
              <div className="flex gap-4">
                 <div className="bg-white p-2 h-fit rounded-lg text-green-600 shadow-sm">
                   <Recycle className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="font-bold text-green-900 text-sm mb-1">Eco-Tip: Regrow Veggies</h3>
                   <p className="text-sm text-green-700 leading-relaxed">
                     Did you know you can regrow green onions and celery? Just place the white roots in a cup of water!
                   </p>
                 </div>
              </div>

              <div className="w-full h-px bg-green-200/50"></div>

              <div className="flex gap-4">
                 <div className="bg-white p-2 h-fit rounded-lg text-green-600 shadow-sm">
                   <Star className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="font-bold text-green-900 text-sm mb-1">Storage Hack</h3>
                   <p className="text-sm text-green-700 leading-relaxed">
                     Wrap cheese in parchment paper, not plastic wrap, to let it breathe and last longer.
                   </p>
                 </div>
              </div>
            </div>

             <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
                 <h3 className="font-bold text-yellow-800 text-sm mb-2">Challenge of the Week</h3>
                 <p className="text-sm text-yellow-700">
                   Try making a meal using only items that are about to expire. Zero waste hero! 🦸‍♀️
                 </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

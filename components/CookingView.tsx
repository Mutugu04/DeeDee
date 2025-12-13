import React from 'react';
import { Recipe } from '../types';
import { ArrowLeft, Clock, AlertCircle, CheckCircle2, PartyPopper } from 'lucide-react';

interface CookingViewProps {
  recipe: Recipe;
  onBack: () => void;
  onComplete?: (recipe: Recipe) => void;
}

export const CookingView: React.FC<CookingViewProps> = ({ recipe, onBack, onComplete }) => {
  return (
    <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 pb-24">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> Back to choices
      </button>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold">
                {recipe.flavorProfile}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" /> {recipe.prepTimeMinutes} mins
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{recipe.title}</h1>
            <p className="text-gray-300 text-lg">{recipe.description}</p>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-candy-pink opacity-20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-ocean-teal opacity-20 blur-[60px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          {/* Ingredients Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
              <h3 className="font-bold text-xl text-yellow-800 mb-4 flex items-center gap-2">
                Grocery Bag
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-600 mb-2">From Left-overs</h4>
                  <ul className="space-y-2">
                    {recipe.ingredientsUsed.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                {recipe.missingIngredients.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-600 mb-2">Pantry Needs</h4>
                    <ul className="space-y-2">
                      {recipe.missingIngredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                          <div className="w-4 h-4 border-2 border-yellow-400 rounded-full mt-0.5 shrink-0"></div>
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
              <h3 className="font-bold text-sm text-purple-800 mb-2">💡 Fun Fact</h3>
              <p className="text-purple-600 text-sm italic">
                {recipe.funFact}
              </p>
            </div>
          </div>

          {/* Steps Column */}
          <div className="md:col-span-2 space-y-8">
            <h3 className="font-bold text-2xl text-gray-800">Let's Cook!</h3>
            
            <div className="space-y-6">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    {index < recipe.steps.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <p className="text-lg text-gray-800 font-medium leading-relaxed">
                      {step.instruction}
                    </p>
                    {step.tip && (
                      <div className="mt-3 flex items-start gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-700 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><span className="font-bold">Pro Tip:</span> {step.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Complete Action */}
            <div className="mt-12 flex flex-col items-center space-y-4">
              <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-100 w-full">
                <h3 className="text-2xl font-bold text-green-700 mb-2">Bon Appétit! 😋</h3>
                <p className="text-green-600 mb-6">Don't forget to take a picture and share it with Mom/Dad!</p>
                
                {onComplete && (
                  <button 
                    onClick={() => onComplete(recipe)}
                    className="group bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-green-200 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <PartyPopper className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    I Made This!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

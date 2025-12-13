import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { analyzeLeftovers, getChefChat } from './services/geminiService';
import { CameraCapture } from './components/CameraCapture';
import { RecipeCard } from './components/RecipeCard';
import { ChatAssistant } from './components/ChatAssistant';
import { CookingView } from './components/CookingView';
import { MyKitchen } from './components/MyKitchen';
import { DailyLesson } from './components/DailyLesson';
import { LiveAudioAssistant } from './components/LiveAudioAssistant';
import { AppState, Recipe, AnalysisResult } from './types';
import { Utensils, Sparkles, ChefHat, User, Mic } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedRecipes, setCompletedRecipes] = useState<Recipe[]>([]);
  const [isLiveAudioOpen, setIsLiveAudioOpen] = useState(false);
  
  // Chat session persistence
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize chat session on mount
    chatSessionRef.current = getChefChat();

    // Load completed recipes
    const saved = localStorage.getItem('deedee_completed_recipes');
    if (saved) {
      try {
        setCompletedRecipes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recipes");
      }
    }
  }, []);

  const handleCapture = async (base64Image: string) => {
    setAppState(AppState.ANALYZING);
    setIsProcessing(true);
    try {
      const result = await analyzeLeftovers(base64Image);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Oops! I couldn't recognize the food. Try snapping closer!");
      setAppState(AppState.HOME);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setAppState(AppState.COOKING);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToResults = () => {
    setSelectedRecipe(null);
    setAppState(AppState.RESULTS);
  };

  const handleBackToHome = () => {
    setAnalysisResult(null);
    setSelectedRecipe(null);
    setAppState(AppState.HOME);
  };

  const handleCompleteRecipe = (recipe: Recipe) => {
    const newRecipe = { ...recipe, dateCooked: Date.now() };
    const updated = [newRecipe, ...completedRecipes];
    setCompletedRecipes(updated);
    localStorage.setItem('deedee_completed_recipes', JSON.stringify(updated));
    setAppState(AppState.MY_KITCHEN);
  };

  return (
    <div className="min-h-screen bg-creamy-white font-sans text-gray-800 selection:bg-candy-pink selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={handleBackToHome}
        >
          <div className="bg-candy-pink text-white p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-candy-pink to-electric-purple text-transparent bg-clip-text">
            DeeDee's Kitchen
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
             onClick={() => setAppState(AppState.MY_KITCHEN)}
             className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-candy-pink transition-colors"
          >
             <User className="w-5 h-5" />
             <span className="hidden sm:inline">My Kitchen</span>
          </button>
          
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span className="hidden sm:inline">AI Powered</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* State: HOME */}
        {appState === AppState.HOME && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8 max-w-2xl">
              <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 text-gray-900 leading-tight">
                Turn <span className="text-candy-pink underline decoration-wavy decoration-4">Left-overs</span> into <span className="text-electric-purple">Legends</span>
              </h1>
              <p className="text-lg text-gray-500">
                Hi DeeDee! Ready to cook? Snap a photo of what's in the fridge and pick your vibe: Sweet, Sour, or Salty.
              </p>
            </div>
            <CameraCapture onCapture={handleCapture} />
            <DailyLesson />
          </div>
        )}

        {/* State: ANALYZING */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-gray-100 border-t-candy-pink rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-gray-300 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mt-8 text-gray-800 animate-pulse">Scanning the fridge...</h2>
            <p className="text-gray-500 mt-2">Identifying ingredients & dreaming up recipes</p>
          </div>
        )}

        {/* State: RESULTS */}
        {appState === AppState.RESULTS && analysisResult && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Look what I found! 👀</h2>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {analysisResult.identifiedIngredients.map((ing, i) => (
                  <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {analysisResult.recipes.map((recipe, index) => (
                <div key={recipe.id} className="h-full" style={{ animationDelay: `${index * 150}ms` }}>
                  <RecipeCard 
                    recipe={recipe} 
                    onClick={() => handleRecipeSelect(recipe)} 
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
               <button 
                 onClick={handleBackToHome}
                 className="text-gray-400 hover:text-gray-600 underline decoration-dotted underline-offset-4 text-sm"
               >
                 Start Over
               </button>
            </div>
          </div>
        )}

        {/* State: COOKING */}
        {appState === AppState.COOKING && selectedRecipe && (
          <CookingView 
            recipe={selectedRecipe} 
            onBack={handleBackToResults} 
            onComplete={handleCompleteRecipe}
          />
        )}

        {/* State: MY KITCHEN */}
        {appState === AppState.MY_KITCHEN && (
          <MyKitchen 
            completedRecipes={completedRecipes}
            onBack={handleBackToHome}
          />
        )}
      </main>

      {/* Floating Buttons Group */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
        {/* Audio Assistant Trigger */}
        <button
          onClick={() => setIsLiveAudioOpen(true)}
          className="p-4 rounded-full shadow-lg bg-gray-900 text-white hover:scale-110 transition-transform duration-300 border-2 border-electric-purple"
        >
          <Mic className="w-6 h-6" />
        </button>

        {/* Text Chat Trigger */}
        <ChatAssistant 
          chatSession={chatSessionRef} 
          currentRecipe={selectedRecipe} 
        />
      </div>

      {/* Live Audio Overlay */}
      {isLiveAudioOpen && (
        <LiveAudioAssistant onClose={() => setIsLiveAudioOpen(false)} />
      )}
    </div>
  );
};

export default App;

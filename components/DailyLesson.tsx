import React, { useState, useEffect } from 'react';
import { generateDailyLesson } from '../services/geminiService';
import { DailyLessonContent } from '../types';
import { BookOpen, Sparkles, X } from 'lucide-react';

export const DailyLesson: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lesson, setLesson] = useState<DailyLessonContent | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLesson = async () => {
    setLoading(true);
    setIsOpen(true);
    const data = await generateDailyLesson();
    setLesson(data);
    setLoading(false);
  };

  return (
    <>
      <div 
        onClick={fetchLesson}
        className="mt-8 mx-auto max-w-sm cursor-pointer group"
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-0.5 shadow-lg transform transition-all group-hover:-translate-y-1">
          <div className="bg-white rounded-[14px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-800 text-sm">Daily Special Lesson</h3>
                <p className="text-xs text-gray-500">Learn a new pro tip!</p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-500 group-hover:rotate-12 transition-transform" />
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>

            {loading ? (
              <div className="flex flex-col items-center py-8 space-y-4">
                <Sparkles className="w-12 h-12 text-candy-pink animate-spin" />
                <p className="text-gray-500 font-medium">Cooking up some knowledge...</p>
              </div>
            ) : lesson ? (
              <div className="text-center py-4">
                <div className="text-6xl mb-4 animate-bounce-slow">{lesson.emoji}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{lesson.title}</h2>
                <div className="w-16 h-1 bg-candy-pink rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {lesson.content}
                </p>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="mt-8 w-full py-3 rounded-xl bg-electric-purple text-white font-bold hover:bg-purple-600 transition-colors"
                >
                  Got it!
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

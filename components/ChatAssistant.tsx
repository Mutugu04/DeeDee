import React, { useState, useEffect, useRef } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { MessageCircle, X, Send, Bot, ChefHat, Loader2 } from 'lucide-react';
import { ChatMessage, Recipe } from '../types';

interface ChatAssistantProps {
  chatSession: React.MutableRefObject<Chat | null>;
  currentRecipe: Recipe | null;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ chatSession, currentRecipe }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: currentRecipe 
            ? `Hey DeeDee! I'm ready to help you nail this **${currentRecipe.title}**. Ask me anything!` 
            : "Hi DeeDee! Snap a pic of some food and I'll help you cook!",
          timestamp: Date.now()
        }
      ]);
    }
  }, [currentRecipe]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSession.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Provide context about the current recipe if this is the first real query during cooking
      let messageToSend = userMsg.text;
      if (currentRecipe && messages.length <= 1) {
         messageToSend = `[Context: I am currently cooking "${currentRecipe.title}". Ingredients: ${currentRecipe.ingredientsUsed.join(', ')}. Steps: ${currentRecipe.steps.map(s => s.instruction).join('; ')}]. \n\n User Question: ${userMsg.text}`;
      }

      const result = await chatSession.current.sendMessage({ message: messageToSend });
      const responseText = (result as GenerateContentResponse).text || "Oops! I got distracted eating pixels. Say that again?";
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "My brain is buffering... try asking again!",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg
          bg-gradient-to-r from-electric-purple to-candy-pink text-white
          hover:scale-110 transition-transform duration-300
          ${isOpen ? 'hidden' : 'flex'}
        `}
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold text-black px-2 py-0.5 rounded-full animate-bounce">
          Help!
        </span>
      </button>

      {/* Chat Window */}
      <div 
        className={`
          fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 
          bg-white sm:rounded-3xl shadow-2xl border border-pink-100 flex flex-col
          transition-all duration-300 ease-in-out transform
          ${isOpen ? 'h-[80vh] sm:h-[600px] translate-y-0 opacity-100' : 'h-0 translate-y-20 opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-electric-purple to-candy-pink p-4 sm:rounded-t-3xl flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Chef Dee-Lite</h3>
              <p className="text-xs text-white/80">Always ready to cook!</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-candy-pink text-white rounded-tr-sm' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'}
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-100 flex items-center gap-2 text-gray-400 text-sm">
                 <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-100 sm:rounded-b-3xl">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-200 focus-within:border-electric-purple focus-within:ring-2 focus-within:ring-purple-100 transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="How do I chop this?"
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="p-2 bg-electric-purple text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

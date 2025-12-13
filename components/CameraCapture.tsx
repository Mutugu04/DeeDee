import React, { useRef, useState } from 'react';
import { Camera, Upload, Sparkles } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for Gemini API (keep only base64 data)
        const base64Data = base64String.split(',')[1];
        onCapture(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div 
        className={`
          relative group cursor-pointer w-64 h-64 rounded-full flex items-center justify-center
          bg-gradient-to-br from-candy-pink via-purple-500 to-ocean-teal
          shadow-[0_0_40px_rgba(255,105,180,0.4)]
          transition-all duration-500 transform hover:scale-105
          ${isHovering ? 'scale-105' : 'scale-100'}
        `}
        onClick={triggerInput}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center z-10">
          <Camera className={`w-16 h-16 text-electric-purple mb-2 transition-transform duration-300 ${isHovering ? 'rotate-12' : ''}`} />
          <span className="font-bold text-lg text-gray-700">Snap Left-overs</span>
          <span className="text-xs text-gray-400 mt-1">or upload photo</span>
        </div>
        
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-ping"></div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment" // Favors the camera on mobile
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-xs mx-auto text-gray-600 bg-white/80 p-4 rounded-2xl backdrop-blur-sm shadow-sm border border-pink-100">
        <div className="flex items-center justify-center gap-2 text-candy-pink font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Magic Mode</span>
        </div>
        <p className="text-sm">Snap a pic of what's in the fridge, and I'll dream up something yummy!</p>
      </div>
    </div>
  );
};
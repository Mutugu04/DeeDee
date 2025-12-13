import React, { useEffect, useRef, useState } from 'react';
import { Modality, LiveServerMessage } from '@google/genai';
import { Mic, X, Volume2, MicOff, Loader2 } from 'lucide-react';
import { ai } from '../services/geminiService';
import { arrayBufferToBase64, decodeAudioData, float32ToInt16 } from '../utils/audio';

interface LiveAudioAssistantProps {
  onClose: () => void;
}

export const LiveAudioAssistant: React.FC<LiveAudioAssistantProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup and audio handling
  const videoRef = useRef<HTMLVideoElement>(null); // For visualizer placeholder or future video
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    let active = true;

    const startSession = async () => {
      try {
        // 1. Setup Audio Input
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        const source = inputCtx.createMediaStreamSource(stream);
        // Using ScriptProcessor for compatibility as AudioWorklet is more complex to bundle inline
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        // 2. Connect to Gemini Live
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              if (active) setIsConnected(true);
            },
            onmessage: async (msg: LiveServerMessage) => {
              if (!active) return;
              
              const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData) {
                setIsTalking(true);
                const buffer = await decodeAudioData(
                  new Uint8Array(await (await fetch(`data:application/octet-stream;base64,${audioData}`)).arrayBuffer()),
                  outputCtx
                );
                
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputCtx.destination);
                
                // Schedule playback
                const now = outputCtx.currentTime;
                // Add a small buffer if we fell behind, otherwise strict scheduling
                const startTime = Math.max(now, nextStartTimeRef.current);
                source.start(startTime);
                nextStartTimeRef.current = startTime + buffer.duration;
                
                sourcesRef.current.add(source);
                source.onended = () => {
                   sourcesRef.current.delete(source);
                   if (sourcesRef.current.size === 0) setIsTalking(false);
                };
              }

              if (msg.serverContent?.interrupted) {
                // Clear audio queue
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsTalking(false);
              }
            },
            onclose: () => {
              if (active) setIsConnected(false);
            },
            onerror: (err) => {
              console.error("Live API Error", err);
              if (active) setError("Connection failed");
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            systemInstruction: "You are Chef Dee-Lite, a high-energy, fun cooking assistant for a teenager. Keep responses short and spoken naturally.",
          }
        });

        sessionRef.current = sessionPromise;

        // 3. Stream Audio Input
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 to Int16 PCM
          const int16Data = float32ToInt16(inputData);
          // Convert to base64
          const base64Audio = arrayBufferToBase64(int16Data.buffer);

          sessionPromise.then(session => {
            session.sendRealtimeInput({
              media: {
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio
              }
            });
          });
        };

        source.connect(processor);
        processor.connect(inputCtx.destination); // Required for script processor to run

      } catch (err) {
        console.error(err);
        if (active) setError("Microphone access denied or error starting session.");
      }
    };

    startSession();

    return () => {
      active = false;
      // Cleanup
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (sessionRef.current) {
         // There is no explicit .close() on the session object in the provided snippet structure, 
         // but disconnecting the socket/callbacks is handled by the instance destruction conceptually.
         // Real cleanup usually involves closing the websocket if exposed, but the SDK handles it.
         sessionRef.current.then(session => {
           if(session.close) session.close();
         });
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-gray-900 to-electric-purple w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative overflow-hidden border border-white/10">
        
        {/* Background Animation */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-candy-pink rounded-full blur-[80px] opacity-20 transition-all duration-300 ${isTalking ? 'scale-150 opacity-40' : 'scale-100'}`}></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center justify-center text-center space-y-8 relative z-10 py-8">
          
          <div className="relative">
            {/* Visualizer Circle */}
            <div className={`
              w-32 h-32 rounded-full border-4 flex items-center justify-center
              transition-all duration-300
              ${isConnected 
                ? isTalking 
                  ? 'border-lime-zest shadow-[0_0_30px_#CCFF00]' 
                  : 'border-ocean-teal shadow-[0_0_20px_#00C7BE]' 
                : 'border-gray-600'}
            `}>
              {isConnected ? (
                <Mic className={`w-12 h-12 text-white ${isTalking ? 'animate-bounce-slow' : ''}`} />
              ) : (
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
              )}
            </div>
            
            {/* Ripple Effects when talking */}
            {isTalking && (
              <>
                <div className="absolute inset-0 rounded-full border border-lime-zest/50 animate-ping"></div>
                <div className="absolute -inset-4 rounded-full border border-lime-zest/30 animate-pulse"></div>
              </>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {isConnected ? (isTalking ? "Chef is talking..." : "I'm listening...") : "Connecting..."}
            </h3>
            <p className="text-gray-300 text-sm">
              Ask about cooking times, substitutions, or tell me a joke!
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-200 px-4 py-2 rounded-xl text-sm border border-red-500/30">
              {error}
            </div>
          )}

          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-xs">
                <Volume2 className="w-4 h-4" /> Sound On
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-xs">
                <Mic className="w-4 h-4" /> Mic Active
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

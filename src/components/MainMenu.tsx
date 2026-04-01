import React from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Github } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  highScores: number[];
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, highScores }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex flex-col items-center max-w-lg w-full px-6"
      >
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-white to-purple-400 italic mb-2 tracking-tighter"
          >
            NEON ROGUE
          </motion.h1>
          <div className="h-1 w-32 bg-blue-500 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
        </div>

        <div className="space-y-4 w-full mb-12">
          <button 
            onClick={onStart}
            className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 hover:bg-blue-400 hover:text-white transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
          >
            <Play fill="currentColor" />
            JOUER
          </button>
        </div>

        {highScores.length > 0 && (
          <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-500" />
              Meilleurs Scores
            </h3>
            <div className="space-y-2">
              {highScores.map((score, idx) => (
                <div key={idx} className="flex justify-between items-center text-lg font-bold">
                  <span className="text-slate-500">#{idx + 1}</span>
                  <span className="text-white tabular-nums">{score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex gap-4 text-slate-500">
          <p className="text-sm font-medium">Flash Style Roguelike • v1.0</p>
        </div>
      </motion.div>
    </div>
  );
};
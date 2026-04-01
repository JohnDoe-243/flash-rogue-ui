import React from 'react';
import { PlayerStats, GameState } from '../App';
import { Heart, Trophy, Sword, Shield, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UIOverlayProps {
  stats: PlayerStats;
  inventory: string[];
  gameState: GameState;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ stats, inventory, gameState }) => {
  if (gameState === 'MENU' || gameState === 'GAME_OVER') return null;

  const hpPercent = (stats.hp / stats.maxHp) * 100;
  const expPercent = (stats.exp / stats.expToNext) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-3 w-64">
          {/* Health Bar */}
          <div className="relative h-8 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden shadow-lg pointer-events-auto">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-600 to-rose-500"
              initial={{ width: '100%' }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black drop-shadow-md">
              <Heart size={14} className="mr-1 fill-white" /> {Math.ceil(stats.hp)} / {stats.maxHp}
            </div>
          </div>

          {/* EXP Bar */}
          <div className="relative h-4 bg-slate-800 rounded-full border border-slate-700 overflow-hidden shadow-sm pointer-events-auto">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              animate={{ width: `${expPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
              LVL {stats.level} • {stats.exp} / {stats.expToNext} XP
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-white pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 shadow-xl">
            <Trophy className="text-yellow-400" size={20} />
            <span className="text-xl font-black tabular-nums">{stats.score.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 shadow-xl">
            <Coins className="text-amber-400" size={20} />
            <span className="text-xl font-black tabular-nums">{stats.gold}</span>
          </div>
        </div>
      </div>

      {/* Bottom Inventory */}
      <div className="flex justify-center">
        <div className="bg-slate-900/90 border-2 border-slate-700 p-2 rounded-2xl flex gap-2 pointer-events-auto shadow-2xl backdrop-blur-sm">
          {inventory.map((item, i) => (
            <div key={i} className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600 hover:border-blue-400 transition-colors cursor-help group relative">
              <Sword size={24} className="text-slate-400 group-hover:text-blue-400" />
              <div className="absolute bottom-full mb-2 bg-slate-800 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item}
              </div>
            </div>
          ))}
          {Array.from({ length: 5 - inventory.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-12 h-12 bg-slate-800/40 rounded-lg border border-slate-700/50" />
          ))}
        </div>
      </div>

      {/* Stats Sidebar */}
      <div className="absolute left-6 bottom-32 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg text-sm border border-slate-700/50">
          <Sword size={16} className="text-red-400" />
          <span>Atk: {stats.attack}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg text-sm border border-slate-700/50">
          <Shield size={16} className="text-blue-400" />
          <span>Def: {stats.defense}</span>
        </div>
      </div>
    </div>
  );
};
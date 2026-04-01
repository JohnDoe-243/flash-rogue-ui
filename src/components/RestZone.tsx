import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Heart, Shield, ArrowRight, ShoppingCart } from 'lucide-react';
import { PlayerStats } from '../App';

interface RestZoneProps {
  gold: number;
  onContinue: () => void;
  onPurchase: (item: string, cost: number, effect: () => void) => void;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
}

export const RestZone: React.FC<RestZoneProps> = ({ gold, onContinue, onPurchase, setStats }) => {
  const shopItems = [
    { 
      name: 'Potion de Vie', 
      desc: 'Restaure 50 PV', 
      cost: 15, 
      icon: <Heart className="text-red-500" />,
      effect: () => setStats(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 50) }))
    },
    { 
      name: 'Lame Aiguisée', 
      desc: '+5 Attaque', 
      cost: 40, 
      icon: <Sword className="text-orange-500" />,
      effect: () => setStats(prev => ({ ...prev, attack: prev.attack + 5 }))
    },
    { 
      name: 'Armure de Fer', 
      desc: '+3 Défense', 
      cost: 50, 
      icon: <Shield className="text-blue-500" />,
      effect: () => setStats(prev => ({ ...prev, defense: prev.defense + 3 }))
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-slate-900 border-4 border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-black text-white italic">ZONE DE REPOS</h2>
            <p className="text-slate-400">Le calme avant la tempête...</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-amber-400 text-2xl font-black">{gold}</span>
            <span className="text-amber-500/50 font-bold uppercase tracking-widest text-xs">Or</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {shopItems.map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              disabled={gold < item.cost}
              onClick={() => onPurchase(item.name, item.cost, item.effect)}
              className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                gold >= item.cost 
                  ? 'border-slate-700 bg-slate-800 hover:border-amber-500 cursor-pointer' 
                  : 'border-slate-800 bg-slate-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="mb-3 p-3 bg-slate-900 rounded-full">{item.icon}</div>
              <h3 className="font-bold text-white mb-1">{item.name}</h3>
              <p className="text-xs text-slate-400 mb-4 text-center">{item.desc}</p>
              <div className="mt-auto flex items-center gap-1 font-black text-amber-400">
                <ShoppingCart size={14} />
                {item.cost}
              </div>
            </motion.button>
          ))}
        </div>

        <button 
          onClick={onContinue}
          className="w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-blue-400 hover:text-white transition-all flex items-center justify-center gap-2 group"
        >
          CONTINUER L'AVENTURE
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};
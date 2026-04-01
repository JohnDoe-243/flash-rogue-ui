import React, { useState, useEffect, useCallback } from 'react';
import Phaser from 'phaser';
import { GameContainer } from './game/GameContainer';
import { UIOverlay } from './components/UIOverlay';
import { MainMenu } from './components/MainMenu';
import { RestZone } from './components/RestZone';
import { audioManager } from './utils/audioManager';
import { Shield, Sword, Heart, Trophy } from 'lucide-react';

export type GameState = 'MENU' | 'PLAYING' | 'REST_ZONE' | 'GAME_OVER';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  gold: number;
  level: number;
  exp: number;
  expToNext: number;
  kills: number;
  score: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [stats, setStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 2,
    gold: 0,
    level: 1,
    exp: 0,
    expToNext: 50,
    kills: 0,
    score: 0,
  });
  
  const [inventory, setInventory] = useState<string[]>(['Rusted Sword']);
  const [highScores, setHighScores] = useState<number[]>([]);

  // Initialize high scores
  useEffect(() => {
    const saved = localStorage.getItem('flash_rogue_highscores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
    audioManager.init();
  }, []);

  const saveHighScore = (score: number) => {
    const newScores = [...highScores, score].sort((a, b) => b - a).slice(0, 5);
    setHighScores(newScores);
    localStorage.setItem('flash_rogue_highscores', JSON.stringify(newScores));
  };

  const handleStart = () => {
    setGameState('PLAYING');
    setStats({
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 2,
      gold: 0,
      level: 1,
      exp: 0,
      expToNext: 50,
      kills: 0,
      score: 0,
    });
    audioManager.playMusic();
  };

  const handleLevelComplete = useCallback((earnedGold: number, earnedExp: number) => {
    setStats(prev => {
      let newExp = prev.exp + earnedExp;
      let newLevel = prev.level;
      let newExpToNext = prev.expToNext;
      let newAttack = prev.attack;
      let newMaxHp = prev.maxHp;

      if (newExp >= prev.expToNext) {
        newLevel++;
        newExp -= prev.expToNext;
        newExpToNext = Math.floor(newExpToNext * 1.5);
        newAttack += 5;
        newMaxHp += 20;
        audioManager.playSfx('levelUp');
      }

      const nextLevel = prev.level + 1;
      if (nextLevel % 5 === 0) {
        setGameState('REST_ZONE');
      }

      return {
        ...prev,
        level: nextLevel,
        exp: newExp,
        expToNext: newExpToNext,
        attack: newAttack,
        maxHp: newMaxHp,
        hp: Math.min(prev.hp + 20, newMaxHp),
        gold: prev.gold + earnedGold,
        score: prev.score + (earnedExp * 10),
      };
    });
  }, []);

  const handleGameOver = (finalScore: number) => {
    saveHighScore(finalScore);
    setGameState('GAME_OVER');
    audioManager.stopMusic();
  };

  const handlePurchase = (item: string, cost: number, effect: () => void) => {
    if (stats.gold >= cost) {
      setStats(prev => ({ ...prev, gold: prev.gold - cost }));
      effect();
      audioManager.playSfx('buy');
      if (!inventory.includes(item)) {
        setInventory(prev => [...prev, item]);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 font-sans text-slate-100 select-none">
      {/* Phaser Canvas */}
      {gameState !== 'MENU' && (
        <GameContainer 
          gameState={gameState} 
          stats={stats}
          onEnemyKill={(gold, exp) => {
            setStats(prev => ({ ...prev, kills: prev.kills + 1 }));
            handleLevelComplete(gold, exp);
          }}
          onPlayerHit={(dmg) => {
            setStats(prev => {
              const newHp = Math.max(0, prev.hp - Math.max(1, dmg - prev.defense));
              if (newHp <= 0) handleGameOver(prev.score);
              return { ...prev, hp: newHp };
            });
          }}
        />
      )}

      {/* UI Layers */}
      <UIOverlay 
        stats={stats} 
        inventory={inventory} 
        gameState={gameState}
      />

      {gameState === 'MENU' && (
        <MainMenu onStart={handleStart} highScores={highScores} />
      )}

      {gameState === 'REST_ZONE' && (
        <RestZone 
          gold={stats.gold} 
          onContinue={() => setGameState('PLAYING')} 
          onPurchase={handlePurchase}
          setStats={setStats}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50 animate-in fade-in duration-500">
          <h1 className="text-6xl font-black text-red-500 mb-4 drop-shadow-glow">FIN DE PARTIE</h1>
          <p className="text-2xl mb-2">Score Final: {stats.score}</p>
          <p className="text-xl text-slate-400 mb-8">Niveau Atteint: {stats.level}</p>
          <button 
            onClick={() => setGameState('MENU')}
            className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:scale-105 transition-transform active:scale-95 shadow-xl"
          >
            RETOUR AU MENU
          </button>
        </div>
      )}

      {/* Global Sound Control */}
      <div className="absolute bottom-4 right-4 z-[100]">
        <button 
          onClick={() => audioManager.toggleMute()}
          className="p-3 bg-slate-800/80 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          {audioManager.isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
};

export default App;
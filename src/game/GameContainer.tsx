import React, { useEffect, useRef } from 'react';
import { initGame, destroyGame } from './PhaserGame';
import { GameState, PlayerStats } from '../App';

interface GameContainerProps {
  gameState: GameState;
  stats: PlayerStats;
  onEnemyKill: (gold: number, exp: number) => void;
  onPlayerHit: (dmg: number) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ 
  gameState, 
  stats, 
  onEnemyKill, 
  onPlayerHit 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = initGame(containerRef.current, { 
        onEnemyKill, 
        onPlayerHit,
        playerStats: stats 
      });
    }

    return () => {
      if (gameRef.current) {
        destroyGame();
        gameRef.current = null;
      }
    };
  }, []);

  // Update game state within Phaser if needed
  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene');
      if (scene) {
        (scene as any).updateStats(stats);
        (scene as any).updateGameState(gameState);
      }
    }
  }, [gameState, stats]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-crosshair"
    />
  );
};
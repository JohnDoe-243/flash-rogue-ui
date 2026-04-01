import Phaser from 'phaser';
import { audioManager } from '../utils/audioManager';

interface GameConfig {
  onEnemyKill: (gold: number, exp: number) => void;
  onPlayerHit: (dmg: number) => void;
  playerStats: any;
}

let gameInstance: Phaser.Game | null = null;

export const initGame = (container: HTMLElement, config: GameConfig) => {
  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: container,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: [MainScene],
    backgroundColor: '#0f172a',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
  };

  gameInstance = new Phaser.Game(phaserConfig);
  gameInstance.registry.set('callbacks', config);
  return gameInstance;
};

export const destroyGame = () => {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
};

class MainScene extends Phaser.Scene {
  private player: any;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private cursors: any;
  private lastFired = 0;
  private spawnTimer = 0;
  private stats: any;
  private currentGameState: string = 'PLAYING';

  constructor() {
    super('MainScene');
  }

  preload() {
    this.createProceduralTexture('player', 32, 0x3b82f6);
    this.createProceduralTexture('enemy', 32, 0xef4444);
    this.createProceduralTexture('bullet', 8, 0xfacc15);
    this.createProceduralTexture('particle', 4, 0xffffff);
  }

  createProceduralTexture(key: string, size: number, color: number) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(color, 1);
    if (key === 'bullet' || key === 'particle') {
      graphics.fillCircle(size / 2, size / 2, size / 2);
    } else {
      graphics.fillRect(0, 0, size, size);
      graphics.lineStyle(2, 0xffffff, 0.5);
      graphics.strokeRect(0, 0, size, size);
    }
    graphics.generateTexture(key, size, size);
  }

  create() {
    const { width, height } = this.scale;
    this.stats = this.registry.get('callbacks').playerStats;

    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(1500);

    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();

    this.cursors = this.input.keyboard?.createCursorKeys();
    
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, undefined, this);

    // Initial message
    this.add.text(width / 2, height - 100, "Z-Q-S-D pour bouger • Clic pour tirer", {
      fontSize: '16px',
      color: '#ffffff66'
    }).setOrigin(0.5);
  }

  update(time: number, delta: number) {
    if (this.currentGameState !== 'PLAYING') {
      this.physics.pause();
      return;
    }
    
    this.physics.resume();

    // Movement
    const speed = 350;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    if (this.cursors.left.isDown || this.input.keyboard?.addKey('A').isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.input.keyboard?.addKey('D').isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.input.keyboard?.addKey('W').isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.input.keyboard?.addKey('S').isDown) {
      body.setVelocityY(speed);
    }

    // Shooting
    if (this.input.activePointer.isDown && time > this.lastFired) {
      this.shoot();
      this.lastFired = time + 150;
    }

    // Spawning
    if (time > this.spawnTimer) {
      this.spawnEnemy();
      const spawnRate = Math.max(400, 2000 - (this.stats.level * 150));
      this.spawnTimer = time + spawnRate;
    }

    // Enemy AI
    this.enemies.getChildren().forEach((enemy: any) => {
      this.physics.moveToObject(enemy, this.player, 120 + (this.stats.level * 5));
    });
  }

  shoot() {
    const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
    if (bullet) {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.x, this.input.activePointer.y);
      this.physics.velocityFromRotation(angle, 800, bullet.body.velocity);
      audioManager.playSfx('click');
      
      // Cleanup bullet off-screen
      this.time.delayedCall(2000, () => bullet.destroy());
    }
  }

  spawnEnemy() {
    const { width, height } = this.scale;
    let x, y;
    const padding = 50;
    
    if (Math.random() > 0.5) {
      x = Math.random() > 0.5 ? -padding : width + padding;
      y = Math.random() * height;
    } else {
      x = Math.random() * width;
      y = Math.random() > 0.5 ? -padding : height + padding;
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setData('hp', 20 + (this.stats.level * 12));
    enemy.setTint(0xff0000);
    
    // Smooth appearance
    enemy.setScale(0);
    this.tweens.add({
      targets: enemy,
      scale: 1,
      duration: 300
    });
  }

  hitEnemy(bullet: any, enemy: any) {
    bullet.destroy();
    const hp = enemy.getData('hp') - this.stats.attack;
    enemy.setData('hp', hp);

    this.showDamage(enemy.x, enemy.y, this.stats.attack);
    audioManager.playSfx('hit');

    if (hp <= 0) {
      this.createExplosion(enemy.x, enemy.y);
      enemy.destroy();
      const gold = Math.floor(Math.random() * 5) + 1;
      const exp = 15;
      this.registry.get('callbacks').onEnemyKill(gold, exp);
    } else {
      enemy.setTint(0xffffff);
      this.time.delayedCall(50, () => enemy.setTint(0xff0000));
      // Knockback
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      enemy.body.velocity.x = Math.cos(angle) * 200;
      enemy.body.velocity.y = Math.sin(angle) * 200;
    }
  }

  hitPlayer(player: any, enemy: any) {
    enemy.destroy();
    this.registry.get('callbacks').onPlayerHit(10 + (this.stats.level * 2));
    this.cameras.main.shake(150, 0.01);
    this.player.setTint(0xff0000);
    this.time.delayedCall(150, () => this.player.clearTint());
    audioManager.playSfx('hit');
  }

  showDamage(x: number, y: number, amount: number) {
    const text = this.add.text(x, y - 20, `-${amount}`, { 
      fontSize: '24px', 
      color: '#ff4444', 
      fontStyle: '900',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.tweens.add({
      targets: text,
      y: y - 80,
      x: x + (Math.random() * 40 - 20),
      alpha: 0,
      duration: 600,
      ease: 'Cubic.out',
      onComplete: () => text.destroy()
    });
  }

  createExplosion(x: number, y: number) {
    for(let i=0; i<8; i++) {
      const p = this.physics.add.sprite(x, y, 'particle');
      p.setTint(0xef4444);
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 100;
      p.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.tweens.add({
        targets: p,
        alpha: 0,
        scale: 0,
        duration: 500,
        onComplete: () => p.destroy()
      });
    }
  }

  updateStats(stats: any) {
    this.stats = stats;
  }

  updateGameState(state: string) {
    this.currentGameState = state;
  }
}
import { Howl } from 'howler';

class AudioManager {
  private music: Howl | null = null;
  private sfx: Record<string, Howl> = {};
  public isMuted: boolean = false;

  init() {
    this.isMuted = localStorage.getItem('game_muted') === 'true';

    // Loopable background music
    this.music = new Howl({
      src: ['https://assets.mixkit.co/music/preview/mixkit-arcade-retro-game-211.mp3'],
      loop: true,
      volume: 0.3,
      html5: true, // Use HTML5 audio for long tracks
      mute: this.isMuted
    });

    // SFX
    const sfxUrls = {
      click: 'https://assets.mixkit.co/sfx/preview/mixkit-click-release-1006.mp3',
      hit: 'https://assets.mixkit.co/sfx/preview/mixkit-hard-typewriter-hit-1364.mp3',
      levelUp: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
      buy: 'https://assets.mixkit.co/sfx/preview/mixkit-payout-item-2003.mp3',
    };

    Object.entries(sfxUrls).forEach(([key, url]) => {
      this.sfx[key] = new Howl({ 
        src: [url], 
        volume: 0.5,
        mute: this.isMuted 
      });
    });
  }

  playMusic() {
    if (this.music && !this.music.playing()) {
      this.music.play();
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
    }
  }

  playSfx(key: string) {
    if (this.sfx[key]) {
      this.sfx[key].play();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('game_muted', String(this.isMuted));
    
    if (this.music) this.music.mute(this.isMuted);
    Object.values(this.sfx).forEach(s => s.mute(this.isMuted));
  }
}

export const audioManager = new AudioManager();
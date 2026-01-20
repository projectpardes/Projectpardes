
export const SFX = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Som suave de clique
  PAPER: 'https://assets.mixkit.co/active_storage/sfx/1471/1471-preview.mp3', // Som de pergaminho
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Nota musical ascendente
  ERROR: 'https://assets.mixkit.co/active_storage/sfx/253/253-preview.mp3', // Som de erro suave
  VICTORY: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Fanfarra mística
  UNROLL: 'https://assets.mixkit.co/active_storage/sfx/1470/1470-preview.mp3' // Abrir pergaminho
};

class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private audioContext: AudioContext | null = null;

  private constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new SoundManager();
    return this.instance;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  play(url: string, volume: number = 0.5) {
    if (!this.enabled) return;
    this.init();
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(e => console.debug("Audio play blocked", e));
  }

  toggle(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const soundManager = SoundManager.getInstance();

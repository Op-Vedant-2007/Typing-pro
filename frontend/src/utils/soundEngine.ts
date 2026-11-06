// Web Audio API synthesized mechanical keyboard and UI sounds

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private currentTheme: string = 'mechanical';

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public setTheme(theme: string) {
    this.currentTheme = theme;
  }

  // Play keystroke sound based on current theme
  public playKey(isSpace: boolean = false) {
    if (!this.enabled || this.currentTheme === 'mute') return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      if (this.currentTheme === 'typewriter') {
        // Metallic mechanical typewriter sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        const baseFreq = isSpace ? 320 : 540 + Math.random() * 80;
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, t);
        filter.Q.setValueAtTime(3, t);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
      } else if (this.currentTheme === 'pop') {
        // Soft bubble pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = isSpace ? 280 : 400 + Math.random() * 120;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.8, t + 0.03);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.05);
      } else {
        // Default: Crisp mechanical switch click (Cherry MX Blue / tactile style)
        // High frequency click + low bottom-out thump
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        const clickFilter = this.ctx.createBiquadFilter();

        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(1800 + Math.random() * 300, t);
        clickFilter.type = 'highpass';
        clickFilter.frequency.setValueAtTime(1200, t);

        clickGain.gain.setValueAtTime(0.12, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        clickOsc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(this.ctx.destination);

        // Low frequency thud
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();

        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(isSpace ? 110 : 160 + Math.random() * 20, t);
        thudOsc.frequency.exponentialRampToValueAtTime(40, t + 0.04);

        thudGain.gain.setValueAtTime(0.15, t);
        thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        thudOsc.connect(thudGain);
        thudGain.connect(this.ctx.destination);

        clickOsc.start(t);
        clickOsc.stop(t + 0.025);
        thudOsc.start(t);
        thudOsc.stop(t + 0.045);
      }
    } catch {
      // Ignore audio errors
    }
  }

  // Play error sound (muted low warning thud)
  public playError() {
    if (!this.enabled || this.currentTheme === 'mute') return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.07);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch {}
  }

  // Play success chime for Personal Best
  public playSuccess() {
    if (!this.enabled || this.currentTheme === 'mute') return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.07);

        gain.gain.setValueAtTime(0, t + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.07);
        osc.stop(t + idx * 0.07 + 0.28);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();

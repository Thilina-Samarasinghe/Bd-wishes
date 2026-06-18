// Frequencies of notes in octave 4 (C4 to B4)
const NOTES: { [key: string]: number } = {
  'C4': 261.63, 'D#4': 277.18, 'D4': 293.66, 'F#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'G#4': 369.99, 'G4': 392.00, 'A#4': 415.30, 'A4': 440.00,
  'B#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D#5': 554.37, 'D5': 587.33, 'F#5': 622.25, 'E5': 659.25,
  'F5': 698.46, 'G#5': 739.99, 'G5': 783.99, 'A#5': 830.61, 'A5': 880.00,
  'B#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98,
  'A6': 1760.00, 'B#6': 1864.66, 'B6': 1975.53
};

// Happy Birthday melody in C major
// [Note, Duration in beats]
const MELODY: [string, number][] = [
  ['C4', 0.75], ['C4', 0.25], ['D4', 1], ['C4', 1], ['F4', 1], ['E4', 2],
  ['C4', 0.75], ['C4', 0.25], ['D4', 1], ['C4', 1], ['G4', 1], ['F4', 2],
  ['C4', 0.75], ['C4', 0.25], ['C5', 1], ['A4', 1], ['F4', 1], ['E4', 1], ['D4', 2],
  ['B#4', 0.75], ['B#4', 0.25], ['A4', 1], ['F4', 1], ['G4', 1], ['F4', 2]
];

export class BirthdaySynth {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private isPlaying: boolean = false;
  private loopTimeout: ReturnType<typeof setTimeout> | null = null;
  private mainVolumeNode: GainNode | null = null;

  constructor(private theme: 'music-box' | 'lofi' | 'piano' | 'none') {}

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(onEnded?: () => void) {
    if (this.theme === 'none') return;
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.isPlaying = true;

    // Master volume node
    this.mainVolumeNode = this.ctx.createGain();
    this.mainVolumeNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
    this.mainVolumeNode.connect(this.ctx.destination);

    const bpm = this.theme === 'lofi' ? 95 : 115;
    const beatDuration = 60 / bpm; // duration of 1 beat in seconds
    let timeCursor = this.ctx.currentTime + 0.1; // small delay to buffer smoothly

    // Create notes and schedule them
    MELODY.forEach(([noteName, beats]) => {
      if (!this.ctx || !this.mainVolumeNode) return;

      const duration = beats * beatDuration;
      const noteFreq = this.getFrequency(noteName);

      if (noteFreq > 0) {
        this.playNote(noteFreq, timeCursor, duration);
      }

      timeCursor += duration;
    });

    const totalDuration = timeCursor - this.ctx.currentTime;

    // Loop
    this.loopTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.play(onEnded);
      } else if (onEnded) {
        onEnded();
      }
    }, totalDuration * 1000);
  }

  private getFrequency(noteName: string): number {
    let transposed = noteName;
    if (this.theme === 'music-box') {
      // Music box is high pitched, transpose up 2 octaves
      const octave = parseInt(noteName.slice(-1));
      transposed = noteName.slice(0, -1) + (octave + 2);
    } else if (this.theme === 'piano') {
      // Piano is centered, transpose up 1 octave for clarity
      const octave = parseInt(noteName.slice(-1));
      transposed = noteName.slice(0, -1) + (octave + 1);
    }
    return NOTES[transposed] || 0;
  }

  private playNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.mainVolumeNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.mainVolumeNode);

    // Apply sound signature depending on the instrument theme
    if (this.theme === 'music-box') {
      // Sine wave (bell-like)
      osc.type = 'sine';
      
      // Extremely sharp attack, very fast decay, long ring ring
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.8, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.9);
      gain.gain.setValueAtTime(0, startTime + duration);
      
      // Dual oscillator layer for retro mechanical chime vibe
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, startTime); // One octave higher harmonic
      osc2.connect(gain2);
      gain2.connect(this.mainVolumeNode);
      
      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(0.2, startTime + 0.005);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.4);
      gain2.gain.setValueAtTime(0, startTime + duration);

      osc2.start(startTime);
      osc2.stop(startTime + duration);
      this.oscillators.push(osc2);
      this.gains.push(gain2);

    } else if (this.theme === 'lofi') {
      // Lofi uses soft triangle waves with lowpass filter
      osc.type = 'triangle';
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, startTime); // warm, muffled
      osc.disconnect(gain);
      osc.connect(filter);
      filter.connect(gain);

      // Low frequency oscillator (LFO) for cassette tape wobble
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.5, startTime); // Wobble frequency
      lfoGain.gain.setValueAtTime(1.5, startTime); // Wobble depth in Hz
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      lfo.start(startTime);
      lfo.stop(startTime + duration);
      this.oscillators.push(lfo);
      // lfoGain is a GainNode which matches this.gains element types
      this.gains.push(lfoGain);

      // Smooth soft attack, decay to sustain
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.7, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.1, startTime + duration - 0.02);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

    } else {
      // Elegant Piano
      osc.type = 'triangle'; // rich fundamental
      
      // Layer a subtle sine wave for pure bass
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq / 2, startTime); // sub octave
      subOsc.connect(subGain);
      subGain.connect(this.mainVolumeNode);

      subGain.gain.setValueAtTime(0, startTime);
      subGain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);
      subGain.gain.setValueAtTime(0, startTime + duration);

      subOsc.start(startTime);
      subOsc.stop(startTime + duration);
      this.oscillators.push(subOsc);
      this.gains.push(subGain);

      // Piano envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.9, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.02, startTime + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
    }

    osc.frequency.setValueAtTime(freq, startTime);
    osc.start(startTime);
    osc.stop(startTime + duration);

    this.oscillators.push(osc);
    this.gains.push(gain);
  }

  stop() {
    this.isPlaying = false;
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    
    // Stop and clear all active nodes
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.gains.forEach(gain => {
      try {
        gain.disconnect();
      } catch {}
    });
    
    if (this.mainVolumeNode) {
      try {
        this.mainVolumeNode.disconnect();
      } catch {}
      this.mainVolumeNode = null;
    }

    this.oscillators = [];
    this.gains = [];
  }

  setTheme(theme: 'music-box' | 'lofi' | 'piano' | 'none') {
    const wasPlaying = this.isPlaying;
    this.theme = theme;
    if (wasPlaying) {
      this.play();
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

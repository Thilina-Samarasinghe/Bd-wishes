import type { MusicTrack } from '@/lib/cardText';
import { compileSong, SONGS, type DrumKind, type Song, type Voice } from '@/utils/songs';
import { closestSample, loadViolinSamples, type ViolinSample, type ViolinSamples } from '@/utils/violinSamples';

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

// Tracks that play the Happy Birthday melody with a shared backing. Original pieces are in songs.ts.
interface Instrument {
  bpm: number;
  octaveShift: number;
  volume: number;
  voice: Voice;
}

const INSTRUMENTS: Partial<Record<MusicTrack, Instrument>> = {
  guitar: {
    bpm: 105, octaveShift: 1, volume: 0.2,
    voice: { wave: 'triangle', attack: 0.004, peak: 0.9, fade: 0.04, cutoff: 2600, overtone: { ratio: 2, level: 0.25 } },
  },
  // Only heard if the real violin recordings cannot be loaded
  strings: {
    bpm: 84, octaveShift: 1, volume: 0.15,
    voice: { wave: 'sawtooth', attack: 0.09, peak: 0.5, fade: 0.65, cutoff: 2800, vibrato: { rate: 5.5, depth: 5 } },
  },
};

const VIOLIN_BPM = 84;
const VIOLIN_VOLUME = 0.24;
const VIOLIN_SECTION_LEVEL = 0.3;

// Chords under the melody, as [first beat, beats long, notes in Hz]. Beat 0 is the pick-up note.
const CHORD_F = [174.61, 220.0, 261.63];
const CHORD_C7 = [196.0, 233.08, 261.63, 329.63];
const CHORD_BB = [174.61, 233.08, 293.66];
const CHORDS: [number, number, number[]][] = [
  [1, 3, CHORD_F], [4, 3, CHORD_C7], [7, 3, CHORD_C7], [10, 3, CHORD_F], [13, 3, CHORD_F],
  [16, 4, CHORD_BB], [20, 2, CHORD_F], [22, 1, CHORD_C7], [23, 2, CHORD_F],
];

const SCHEDULE_AHEAD_SECONDS = 1;
const COWBELL: Voice = { wave: 'square', attack: 0.001, peak: 0.5, fade: 0.05, cutoff: 2400 };

// One shared context per page, so a tap that unlocks audio also unlocks every player.
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    sharedCtx = new AudioCtx();
  }
  return sharedCtx;
}

/**
 * Browsers keep audio locked until the visitor touches the page. Call this directly inside
 * a tap or click handler: iOS only unlocks audio during the gesture itself.
 */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'running') return;
  ctx.resume().catch(() => {});
  // A silent one-sample sound is what unlocks audio on older iOS versions
  const source = ctx.createBufferSource();
  source.buffer = ctx.createBuffer(1, 1, 22050);
  source.connect(ctx.destination);
  source.start(0);
}

/** Starts downloading a track's recordings early, so it can begin right away on the first tap. */
export function preloadTrack(track: MusicTrack) {
  if (track !== 'strings') return;
  const ctx = getAudioContext();
  if (ctx) loadViolinSamples(ctx).catch(() => {});
}

/** Pauses all sound on the page, for when the visitor switches away. */
export function suspendAudio() {
  if (sharedCtx?.state === 'running') sharedCtx.suspend().catch(() => {});
}

export class BirthdaySynth {
  private ctx: AudioContext | null = null;
  private oscillators: AudioScheduledSourceNode[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private gains: GainNode[] = [];
  private isPlaying: boolean = false;
  private loopTimeout: ReturnType<typeof setTimeout> | null = null;
  private scheduleTimeout: ReturnType<typeof setTimeout> | null = null;
  private mainVolumeNode: GainNode | null = null;
  private cancelPendingStart: (() => void) | null = null;
  private loop: boolean = true;
  private violinRun = 0;
  private violinUnavailable = false;

  constructor(private theme: MusicTrack) {}

  /** When false, the melody plays once and then stops. */
  setLoop(loop: boolean) {
    this.loop = loop;
  }

  play(onEnded?: () => void) {
    if (this.theme === 'none') return;
    this.stop();
    this.ctx = getAudioContext();
    if (!this.ctx) return;

    this.isPlaying = true;

    if (this.ctx.state === 'running') {
      this.startMelody(onEnded);
      return;
    }

    // Audio is still locked: begin from the first note as soon as a tap unlocks it
    const ctx = this.ctx;
    const onStateChange = () => {
      if (ctx.state !== 'running') return;
      this.cancelPendingStart?.();
      this.startMelody(onEnded);
    };
    ctx.addEventListener('statechange', onStateChange);
    this.cancelPendingStart = () => {
      ctx.removeEventListener('statechange', onStateChange);
      this.cancelPendingStart = null;
    };
    ctx.resume().catch(() => {});
  }

  private startMelody(onEnded?: () => void) {
    if (!this.ctx) return;

    // Master volume node
    this.mainVolumeNode = this.ctx.createGain();
    const instrument = INSTRUMENTS[this.theme];
    const song = SONGS[this.theme];
    this.mainVolumeNode.gain.setValueAtTime(song?.volume ?? instrument?.volume ?? 0.15, this.ctx.currentTime);
    this.mainVolumeNode.connect(this.ctx.destination);

    if (song) {
      this.startSong(song, onEnded);
      return;
    }

    if (this.theme === 'strings' && !this.violinUnavailable) {
      this.startViolin(onEnded);
      return;
    }

    const bpm = instrument?.bpm ?? (this.theme === 'lofi' ? 95 : 115);
    const beatDuration = 60 / bpm; // duration of 1 beat in seconds
    let timeCursor = this.ctx.currentTime + 0.1; // small delay to buffer smoothly

    if (this.theme === 'guitar') this.playStrumBacking(timeCursor, beatDuration);

    // Create notes and schedule them
    MELODY.forEach(([noteName, beats]) => {
      if (!this.ctx || !this.mainVolumeNode) return;

      const duration = beats * beatDuration;
      const noteFreq = this.getFrequency(noteName);

      if (noteFreq > 0) {
        if (instrument) {
          this.playTone(noteFreq, timeCursor, duration, instrument.voice);
        } else {
          this.playNote(noteFreq, timeCursor, duration);
        }
      }

      timeCursor += duration;
    });

    const totalDuration = timeCursor - this.ctx.currentTime;

    this.scheduleTrackEnd(totalDuration, onEnded);
  }

  /** Waits for the real violin recordings, then plays. Falls back to the synth if they fail. */
  private startViolin(onEnded?: () => void) {
    if (!this.ctx) return;
    const run = ++this.violinRun;
    loadViolinSamples(this.ctx)
      .then((samples) => {
        if (run === this.violinRun && this.isPlaying) this.playViolin(samples, onEnded);
      })
      .catch(() => {
        this.violinUnavailable = true;
        if (run === this.violinRun && this.isPlaying) {
          this.mainVolumeNode?.disconnect();
          this.startMelody(onEnded);
        }
      });
  }

  private playViolin(samples: ViolinSamples, onEnded?: () => void) {
    if (!this.ctx || !this.mainVolumeNode) return;
    const beat = 60 / VIOLIN_BPM;
    const songStart = this.ctx.currentTime + 0.1;
    this.mainVolumeNode.gain.setValueAtTime(VIOLIN_VOLUME, this.ctx.currentTime);

    // A real violin section holds the chords softly under the solo
    CHORDS.forEach(([firstBeat, beats, notes]) => {
      notes.forEach((freq) => {
        const pitch = freq * 2;
        this.playSample(closestSample(samples.section, pitch), pitch, songStart + firstBeat * beat, beats * beat, VIOLIN_SECTION_LEVEL, 0.35);
      });
    });

    // The solo violin plays the Happy Birthday melody, each note ringing into the next
    let cursor = songStart;
    MELODY.forEach(([noteName, beats]) => {
      const duration = beats * beat;
      const freq = this.getFrequency(noteName);
      if (freq > 0) this.playSample(closestSample(samples.solo, freq), freq, cursor, duration, 1, 0.12);
      cursor += duration;
    });

    // One quiet beat before the song repeats
    this.scheduleTrackEnd(cursor - this.ctx.currentTime + beat, onEnded);
  }

  private playSample(sample: ViolinSample, freq: number, start: number, duration: number, level: number, release: number) {
    if (!this.ctx || !this.mainVolumeNode) return;
    const source = this.ctx.createBufferSource();
    source.buffer = sample.buffer;
    source.playbackRate.setValueAtTime(freq / sample.hz, start);

    const end = start + duration;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(level, start + 0.012);
    gain.gain.setValueAtTime(level, end);
    gain.gain.exponentialRampToValueAtTime(0.0001, end + release);

    source.connect(gain);
    gain.connect(this.mainVolumeNode);
    source.start(start);
    source.stop(end + release + 0.01);
    this.oscillators.push(source);
    this.gains.push(gain);
  }

  private scheduleTrackEnd(seconds: number, onEnded?: () => void) {
    this.loopTimeout = setTimeout(() => {
      if (this.isPlaying && this.loop) {
        this.play(onEnded);
      } else {
        this.stop();
        onEnded?.();
      }
    }, seconds * 1000);
  }

  /**
   * Plays an original piece. Notes are created shortly before they sound, a second at a time,
   * so a long song does not make a slow phone stutter when it starts.
   */
  private startSong(song: Song, onEnded?: () => void) {
    if (!this.ctx || !this.mainVolumeNode) return;
    const ctx = this.ctx;
    const main = this.mainVolumeNode;
    const { events, totalSteps } = compileSong(song);
    const stepSeconds = 60 / song.bpm / song.stepsPerBeat;
    const songStart = ctx.currentTime + 0.1;
    const swingSeconds = (song.swing ?? 0) * stepSeconds;
    const stepTime = (step: number) => songStart + step * stepSeconds + (step % 2 === 1 ? swingSeconds : 0);

    let pumpBus: GainNode | null = null;
    if (song.pump) {
      pumpBus = ctx.createGain();
      pumpBus.connect(main);
      this.gains.push(pumpBus);
      const beatSeconds = stepSeconds * song.stepsPerBeat;
      for (let beat = 0; beat < song.bars * song.beatsPerBar; beat++) {
        const at = songStart + beat * beatSeconds;
        pumpBus.gain.setValueAtTime(0.25, at);
        pumpBus.gain.linearRampToValueAtTime(1, at + beatSeconds * 0.6);
      }
    }

    let next = 0;
    const scheduleUpcoming = () => {
      if (!this.isPlaying) return;
      const horizon = ctx.currentTime + SCHEDULE_AHEAD_SECONDS;
      while (next < events.length && stepTime(events[next].step) < horizon) {
        const event = events[next++];
        const time = stepTime(event.step);
        if ('drum' in event) {
          this.playDrumHit(event.drum, time, event.level);
        } else {
          const bus = event.pumped && pumpBus ? pumpBus : main;
          event.freqs.forEach((freq) => this.playTone(freq, time, event.steps * stepSeconds, event.voice, 1, bus));
        }
      }
      if (next < events.length) {
        this.scheduleTimeout = setTimeout(scheduleUpcoming, 250);
      }
    };
    scheduleUpcoming();

    this.scheduleTrackEnd(totalSteps * stepSeconds + 0.1, onEnded);
  }

  private getFrequency(noteName: string): number {
    const base = NOTES[noteName] || 0;
    const legacyShift = this.theme === 'music-box' ? 2 : this.theme === 'piano' ? 1 : 0;
    const octaveShift = INSTRUMENTS[this.theme]?.octaveShift ?? legacyShift;
    return base * 2 ** octaveShift;
  }

  private playTone(freq: number, startTime: number, duration: number, voice: Voice, level = 1, bus?: AudioNode) {
    if (!this.ctx || !this.mainVolumeNode) return;
    const end = startTime + duration;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(voice.peak * level, startTime + Math.min(voice.attack, duration / 2));
    gain.gain.exponentialRampToValueAtTime(Math.max(voice.peak * level * voice.fade, 0.0001), end - 0.01);
    gain.gain.linearRampToValueAtTime(0, end);
    this.gains.push(gain);

    let output: AudioNode = gain;
    if (voice.cutoff) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(voice.cutoff, startTime);
      filter.connect(gain);
      output = filter;
    }
    gain.connect(bus ?? this.mainVolumeNode);

    const osc = this.ctx.createOscillator();
    osc.type = voice.wave;
    osc.frequency.setValueAtTime(freq, startTime);
    osc.connect(output);
    osc.start(startTime);
    osc.stop(end);
    this.oscillators.push(osc);

    if (voice.overtone) {
      const overtone = this.ctx.createOscillator();
      const overtoneGain = this.ctx.createGain();
      overtone.type = voice.wave;
      overtone.frequency.setValueAtTime(freq * voice.overtone.ratio, startTime);
      overtoneGain.gain.setValueAtTime(voice.overtone.level, startTime);
      overtone.connect(overtoneGain);
      overtoneGain.connect(output);
      overtone.start(startTime);
      overtone.stop(end);
      this.oscillators.push(overtone);
      this.gains.push(overtoneGain);
    }

    if (voice.vibrato) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(voice.vibrato.rate, startTime);
      lfoGain.gain.setValueAtTime(voice.vibrato.depth, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(startTime);
      lfo.stop(end);
      this.oscillators.push(lfo);
      this.gains.push(lfoGain);
    }

    voice.unison?.forEach((cents) => {
      if (!this.ctx) return;
      const copy = this.ctx.createOscillator();
      copy.type = voice.wave;
      copy.frequency.setValueAtTime(freq, startTime);
      copy.detune.setValueAtTime(cents, startTime);
      copy.connect(output);
      copy.start(startTime);
      copy.stop(end);
      this.oscillators.push(copy);
    });

    voice.partials?.forEach(({ ratio, level: partialLevel, decay }) => {
      if (!this.ctx) return;
      const partialEnd = startTime + Math.min(decay, duration);
      const partial = this.ctx.createOscillator();
      const partialGain = this.ctx.createGain();
      partial.frequency.setValueAtTime(freq * ratio, startTime);
      partialGain.gain.setValueAtTime(partialLevel, startTime);
      partialGain.gain.exponentialRampToValueAtTime(0.0001, partialEnd);
      partial.connect(partialGain);
      partialGain.connect(output);
      partial.start(startTime);
      partial.stop(partialEnd);
      this.oscillators.push(partial);
      this.gains.push(partialGain);
    });

    if (voice.tremolo) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(voice.tremolo.rate, startTime);
      lfoGain.gain.setValueAtTime(voice.tremolo.depth * voice.peak * level, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start(startTime);
      lfo.stop(end);
      this.oscillators.push(lfo);
      this.gains.push(lfoGain);
    }
  }

  /** A short burst of filtered noise, for snares, hats, and shakers. */
  private playNoise(startTime: number, duration: number, level: number, highpass: number) {
    if (!this.ctx || !this.mainVolumeNode) return;
    if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== this.ctx.sampleRate) {
      const length = Math.floor(this.ctx.sampleRate * 0.4);
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const samples = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(highpass, startTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(level, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.mainVolumeNode);
    source.start(startTime);
    source.stop(startTime + duration);
    this.oscillators.push(source);
    this.gains.push(gain);
  }

  /** A drum hit that falls quickly in pitch. It starts high enough for phone speakers to play it. */
  private playDrum(startTime: number, fromFreq: number, toFreq: number, duration: number, level: number) {
    if (!this.ctx || !this.mainVolumeNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(fromFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(toFreq, startTime + duration);
    gain.gain.setValueAtTime(level, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.mainVolumeNode);
    osc.start(startTime);
    osc.stop(startTime + duration);
    this.oscillators.push(osc);
    this.gains.push(gain);
  }

  private playDrumHit(kind: DrumKind, time: number, level: number) {
    switch (kind) {
      case 'kick':
        this.playDrum(time, 165, 50, 0.2, level);
        this.playNoise(time, 0.012, level * 0.3, 3000); // the click is what phone speakers can play
        break;
      case 'snare':
        this.playDrum(time, 250, 170, 0.1, level * 0.7);
        this.playNoise(time, 0.15, level, 1500);
        break;
      case 'clap':
        [0, 0.012, 0.024].forEach((delay) => this.playNoise(time + delay, 0.09, level, 1200));
        break;
      case 'hat':
        this.playNoise(time, 0.035, level, 8000);
        break;
      case 'open-hat':
        this.playNoise(time, 0.14, level, 7000);
        break;
      case 'ride':
        this.playNoise(time, 0.22, level, 6000);
        break;
      case 'shaker':
        this.playNoise(time, 0.03, level, 5000);
        break;
      case 'conga-high':
        this.playDrum(time, 430, 340, 0.12, level);
        break;
      case 'conga-low':
        this.playDrum(time, 290, 205, 0.17, level);
        break;
      case 'cowbell':
        this.playTone(800, time, 0.09, COWBELL, level);
        this.playTone(540, time, 0.09, COWBELL, level);
        break;
      case 'chip-kick':
        this.playDrum(time, 300, 80, 0.09, level);
        break;
      case 'chip-noise':
        this.playNoise(time, 0.09, level, 3500);
        break;
    }
  }

  private playStrumBacking(songStart: number, beat: number) {
    const pluck: Voice = { wave: 'triangle', attack: 0.004, peak: 0.5, fade: 0.05, cutoff: 1800 };

    CHORDS.forEach(([firstBeat, beats, notes]) => {
      const at = (b: number) => songStart + (firstBeat + b) * beat;
      for (let b = 0; b < beats; b++) {
        this.playTone(notes[b % notes.length], at(b), beat * 0.95, pluck);
        this.playTone(notes[(b + 1) % notes.length], at(b + 0.5), beat * 0.45, pluck, 0.7);
      }
    });
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
    this.violinRun++;
    this.cancelPendingStart?.();
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    if (this.scheduleTimeout) {
      clearTimeout(this.scheduleTimeout);
      this.scheduleTimeout = null;
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

  setTheme(theme: MusicTrack) {
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

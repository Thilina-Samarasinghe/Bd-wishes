import type { MusicTrack } from '@/lib/cardText';

/**
 * Original instrumental pieces. Unlike the Happy Birthday tracks, each has its own melody,
 * chords, tempo, rhythm, and drums.
 *
 * Melodic patterns are space-separated "note:steps" tokens. Use "-" for a rest and "+" for a
 * chord, as in "C5:2 -:1 C4+E4+G4:1". Drum patterns are grids where "x" is a hit. A pattern
 * shorter than the song repeats until the song ends.
 */

export interface Voice {
  wave: OscillatorType;
  attack: number; // seconds to reach full level
  peak: number;
  fade: number; // level left at the end of the note, as a share of peak (above 0)
  cutoff?: number; // lowpass filter frequency in Hz, softens the tone
  vibrato?: { rate: number; depth: number };
  overtone?: { ratio: number; level: number };
  /** Extra oscillators detuned by these cents, for a wide, ensemble sound. */
  unison?: number[];
  /** Metallic or bell overtones, each fading out within `decay` seconds. */
  partials?: { ratio: number; level: number; decay: number }[];
  /** Rapid volume wobble, like a steel pan roll. */
  tremolo?: { rate: number; depth: number };
}

export type DrumKind = 'kick' | 'snare' | 'clap' | 'hat' | 'open-hat' | 'ride' | 'shaker' | 'conga-high' | 'conga-low' | 'cowbell' | 'chip-kick' | 'chip-noise';

interface MelodicLayer {
  voice: Voice;
  pattern: string;
  /** Sends the layer through the rhythmic volume pump. */
  pumped?: boolean;
}

interface DrumLayer {
  drum: DrumKind;
  pattern: string;
  level: number;
}

export interface Song {
  bpm: number;
  stepsPerBeat: number;
  bars: number;
  beatsPerBar: number;
  volume: number;
  /** How late off-beat steps fall, as a share of a step. This is what makes jazz swing. */
  swing?: number;
  /** Ducks pumped layers on every beat, the classic dance-music breathing effect. */
  pump?: boolean;
  layers: (MelodicLayer | DrumLayer)[];
}

export type SongEvent =
  | { step: number; steps: number; freqs: number[]; voice: Voice; pumped: boolean }
  | { step: number; drum: DrumKind; level: number };

const SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function noteToFrequency(note: string): number {
  const match = /^([A-G])([#b]?)(\d)$/.exec(note);
  if (!match) throw new Error(`Invalid note: ${note}`);
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  const midi = 12 * (Number(match[3]) + 1) + SEMITONES[match[1]] + accidental;
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Turns a song's patterns into a list of timed notes and drum hits, sorted by step. */
export function compileSong(song: Song): { events: SongEvent[]; totalSteps: number } {
  const totalSteps = song.bars * song.beatsPerBar * song.stepsPerBeat;
  const events: SongEvent[] = [];

  for (const layer of song.layers) {
    if ('drum' in layer) {
      const grid = layer.pattern.replace(/\s/g, '');
      for (let step = 0; step < totalSteps; step++) {
        if (grid[step % grid.length] === 'x') {
          events.push({ step, drum: layer.drum, level: layer.level });
        }
      }
      continue;
    }

    const tokens = layer.pattern.trim().split(/\s+/).map((token) => {
      const [notes, steps] = token.split(':');
      return { freqs: notes === '-' ? [] : notes.split('+').map(noteToFrequency), steps: Number(steps) };
    });
    let step = 0;
    while (step < totalSteps) {
      for (const { freqs, steps } of tokens) {
        if (step >= totalSteps) break;
        if (freqs.length) {
          events.push({ step, steps, freqs, voice: layer.voice, pumped: !!layer.pumped });
        }
        step += steps;
      }
    }
  }

  return { events: events.sort((a, b) => a.step - b.step), totalSteps };
}

// ---- Swing jazz: fast walking bass, off-beat piano, sax solo, ride cymbal ----
const SAX: Voice = { wave: 'sawtooth', attack: 0.02, peak: 0.62, fade: 0.55, cutoff: 3000, vibrato: { rate: 5.5, depth: 4 }, overtone: { ratio: 0.5, level: 0.22 } };
const UPRIGHT_BASS: Voice = { wave: 'triangle', attack: 0.006, peak: 1, fade: 0.12, cutoff: 1500, overtone: { ratio: 2, level: 0.55 } };
const JAZZ_PIANO: Voice = { wave: 'triangle', attack: 0.004, peak: 0.34, fade: 0.1, cutoff: 2600, overtone: { ratio: 3, level: 0.12 } };

const Cm7 = 'C4+Eb4+G4+Bb4';
const F7 = 'A3+C4+Eb4+F4';
const BbMaj7 = 'Bb3+D4+F4+A4';
const Gm7 = 'Bb3+D4+F4+G4';
const Eb7 = 'G3+Bb3+Db4+Eb4';
const Edim = 'G3+Bb3+Db4+E4';
const G7 = 'B3+D4+F4+G4';

const JAZZ: Song = {
  bpm: 148,
  stepsPerBeat: 2,
  beatsPerBar: 4,
  bars: 8,
  volume: 0.148,
  swing: 0.34,
  layers: [
    {
      voice: SAX,
      pattern: `G4:1 Bb4:1 C5:2 Eb5:1 D5:1 C5:2
                D5:3 Bb4:1 G4:2 -:2
                Eb5:1 D5:1 C5:1 Bb4:1 A4:1 C5:1 Eb5:2
                D5:4 -:4
                Bb4:1 Db5:1 Eb5:2 G5:2 F5:1 Eb5:1
                D5:2 F5:2 B4:2 D5:2
                C5:1 Eb5:1 G5:1 F5:1 Eb5:1 C5:1 A4:1 F4:1
                Bb4:2 D5:1 F5:1 Bb5:4`,
    },
    {
      voice: UPRIGHT_BASS,
      pattern: `C3:2 Eb3:2 F3:2 A3:2
                Bb3:2 A3:2 G3:2 F3:2
                C3:2 Eb3:2 F3:2 Eb3:2
                D3:2 F3:2 Bb3:2 G3:2
                Eb3:2 G3:2 E3:2 G3:2
                F3:2 D3:2 G3:2 B3:2
                C3:2 Eb3:2 F3:2 A3:2
                Bb3:2 F3:2 Bb3:2 -:2`,
    },
    {
      voice: JAZZ_PIANO,
      pattern: `${Cm7}:1 -:2 ${F7}:1 -:4
                ${BbMaj7}:1 -:2 ${Gm7}:1 -:4
                ${Cm7}:1 -:2 ${F7}:1 -:4
                ${BbMaj7}:1 -:2 ${Gm7}:1 -:4
                ${Eb7}:1 -:2 ${Edim}:1 -:4
                ${BbMaj7}:1 -:2 ${G7}:1 -:4
                ${Cm7}:1 -:2 ${F7}:1 -:4
                ${BbMaj7}:1 -:7`,
    },
    { drum: 'ride', pattern: 'x.xxx.xx', level: 0.2 },
    { drum: 'hat', pattern: '..x...x.', level: 0.3 },
  ],
};

// ---- 8-bit arcade: racing video game music ----
const CHIP_LEAD: Voice = { wave: 'square', attack: 0.001, peak: 0.5, fade: 0.55 };
const CHIP_ARP: Voice = { wave: 'square', attack: 0.001, peak: 0.13, fade: 0.5 };
const CHIP_BASS: Voice = { wave: 'triangle', attack: 0.001, peak: 1, fade: 0.7 };

const ARCADE: Song = {
  bpm: 168,
  stepsPerBeat: 4,
  beatsPerBar: 4,
  bars: 8,
  volume: 0.105,
  layers: [
    {
      voice: CHIP_LEAD,
      pattern: `A5:2 C6:2 E6:2 A6:2 G6:2 E6:2 C6:2 D6:2
                C6:2 F6:4 E6:2 C6:2 A5:2 C6:4
                G5:2 C6:2 E6:2 G6:4 E6:2 C6:2 E6:2
                D6:2 G6:2 B6:4 A6:2 G6:2 D6:4
                E6:1 E6:1 -:2 E6:2 C6:2 E6:4 G6:4
                F6:2 E6:2 C6:2 A5:6 -:4
                G5:2 A5:2 C6:4 E6:2 D6:2 C6:4
                G5:1 B5:1 D6:1 G6:1 B6:2 D7:2 G7:4 -:4`,
    },
    {
      voice: CHIP_ARP,
      pattern: `A4:1 C5:1 E5:1 A5:1 A4:1 C5:1 E5:1 A5:1 A4:1 C5:1 E5:1 A5:1 A4:1 C5:1 E5:1 A5:1
                F4:1 A4:1 C5:1 F5:1 F4:1 A4:1 C5:1 F5:1 F4:1 A4:1 C5:1 F5:1 F4:1 A4:1 C5:1 F5:1
                C5:1 E5:1 G5:1 C6:1 C5:1 E5:1 G5:1 C6:1 C5:1 E5:1 G5:1 C6:1 C5:1 E5:1 G5:1 C6:1
                G4:1 B4:1 D5:1 G5:1 G4:1 B4:1 D5:1 G5:1 G4:1 B4:1 D5:1 G5:1 G4:1 B4:1 D5:1 G5:1`,
    },
    {
      voice: CHIP_BASS,
      pattern: `A3:2 A3:2 E4:2 A3:2 A3:2 A3:2 E4:2 G3:2
                F3:2 F3:2 C4:2 F3:2 F3:2 F3:2 C4:2 F3:2
                C3:2 C3:2 G3:2 C3:2 C3:2 C3:2 G3:2 C3:2
                G3:2 G3:2 D4:2 G3:2 G3:2 G3:2 D4:2 B3:2`,
    },
    { drum: 'chip-kick', pattern: 'x.......x.......', level: 0.9 },
    { drum: 'chip-noise', pattern: '....x.......x...', level: 0.55 },
    { drum: 'hat', pattern: 'x.x.x.x.x.x.x.x.', level: 0.14 },
  ],
};

// ---- Party beat: four-on-the-floor dance track that builds and drops ----
const SUPERSAW: Voice = { wave: 'sawtooth', attack: 0.004, peak: 0.26, fade: 0.2, cutoff: 3800, unison: [-14, 14] };
const PUMP_BASS: Voice = { wave: 'sawtooth', attack: 0.004, peak: 0.75, fade: 0.3, cutoff: 900 };
const HOOK: Voice = { wave: 'square', attack: 0.002, peak: 0.34, fade: 0.08, cutoff: 5000, overtone: { ratio: 2, level: 0.3 } };

const stab = (chord: string) => `${chord}:3 ${chord}:3 ${chord}:2 -:4 ${chord}:2 -:2`;
const offbeat = (note: string) => `-:2 ${note}:2 -:2 ${note}:2 -:2 ${note}:2 -:2 ${note}:2`;

const PARTY: Song = {
  bpm: 128,
  stepsPerBeat: 4,
  beatsPerBar: 4,
  bars: 8,
  volume: 0.22,
  pump: true,
  layers: [
    { drum: 'kick', pattern: 'x...x...x...x...', level: 1 },
    { drum: 'clap', pattern: '....x.......x...', level: 0.6 },
    { drum: 'open-hat', pattern: '..x...x...x...x.', level: 0.3 },
    { drum: 'hat', pattern: 'x.xxx.xxx.xxx.xx', level: 0.13 },
    // A snare roll in bar 4 builds into the hook in bar 5
    {
      drum: 'snare',
      pattern: `................ ................ ................ x.x.x.x.xxxxxxxx
                ................ ................ ................ ................`,
      level: 0.45,
    },
    { voice: PUMP_BASS, pumped: true, pattern: `${offbeat('F3')} ${offbeat('Db3')} ${offbeat('Ab3')} ${offbeat('Eb3')}` },
    {
      voice: SUPERSAW,
      pumped: true,
      pattern: `${stab('F4+Ab4+C5')} ${stab('F4+Ab4+Db5')} ${stab('Eb4+Ab4+C5')} ${stab('Eb4+G4+Bb4')}`,
    },
    {
      voice: HOOK,
      pattern: `-:64
                C6:2 Ab5:2 F5:2 C6:2 -:2 Bb5:2 Ab5:2 G5:2
                Ab5:2 F5:2 Db5:2 F5:2 Ab5:2 Db6:2 C6:4
                C6:2 Ab5:2 Eb5:2 C6:2 -:2 Bb5:2 Ab5:2 Bb5:2
                G5:2 Bb5:2 Eb6:4 F6:2 Eb6:2 Bb5:4`,
    },
  ],
};

// ---- Island: sunny calypso with steel pan, congas, and clave ----
const STEEL_PAN: Voice = {
  wave: 'sine', attack: 0.003, peak: 0.72, fade: 0.1,
  partials: [{ ratio: 2, level: 0.55, decay: 0.22 }, { ratio: 3.01, level: 0.3, decay: 0.12 }, { ratio: 4.2, level: 0.12, decay: 0.07 }],
  tremolo: { rate: 13, depth: 0.28 },
};
const PAN_CHORD: Voice = { wave: 'sine', attack: 0.003, peak: 0.3, fade: 0.08, partials: [{ ratio: 2, level: 0.45, decay: 0.12 }] };
const ISLAND_BASS: Voice = { wave: 'triangle', attack: 0.006, peak: 1, fade: 0.25, overtone: { ratio: 2, level: 0.4 } };

const skank = (chord: string) => `-:2 ${chord}:2 -:2 ${chord}:2 -:2 ${chord}:2 -:2 ${chord}:2`;

const ISLAND: Song = {
  bpm: 112,
  stepsPerBeat: 4,
  beatsPerBar: 4,
  bars: 4,
  volume: 0.128,
  layers: [
    {
      voice: STEEL_PAN,
      pattern: `B5:2 D6:2 -:1 B5:1 G5:2 A5:3 B5:3 D6:2
                E6:3 D6:3 C6:2 G5:3 E5:3 G5:2
                F#5:2 A5:2 D6:3 C6:3 A5:2 F#5:4
                G5:3 B5:3 D6:2 G6:6 -:2`,
    },
    { voice: PAN_CHORD, pattern: `${skank('G4+B4+D5')} ${skank('G4+C5+E5')} ${skank('F#4+A4+D5')} ${skank('G4+B4+D5')}` },
    {
      voice: ISLAND_BASS,
      pattern: `G3:3 G3:3 D3:2 G3:3 B3:3 D4:2
                C3:3 C3:3 G3:2 C3:3 E3:3 G3:2
                D3:3 D3:3 A3:2 D3:3 F#3:3 A3:2
                G3:3 G3:3 D3:2 G3:3 B3:3 D4:2`,
    },
    { drum: 'cowbell', pattern: 'x..x..x...x.x...', level: 0.32 },
    { drum: 'conga-high', pattern: '..x..x....x..x..', level: 0.62 },
    { drum: 'conga-low', pattern: 'x.....x...x.....', level: 0.8 },
    { drum: 'shaker', pattern: 'xxxxxxxxxxxxxxxx', level: 0.13 },
  ],
};

export const SONGS: Partial<Record<MusicTrack, Song>> = {
  jazz: JAZZ,
  arcade: ARCADE,
  party: PARTY,
  island: ISLAND,
};

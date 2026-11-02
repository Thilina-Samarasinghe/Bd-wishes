/**
 * Real violin recordings from VSCO 2: Community Edition by Versilian Studios (CC0).
 * See public/sounds/violin/CREDITS.txt.
 *
 * Each `hz` is the pitch measured from the recording, not the note in the source file's name.
 * The section files sound an octave above their names, and using measured pitch keeps every
 * note in tune when it is shifted.
 */
const SOLO = [
  { file: 'solo-C5', hz: 523.2 },
  { file: 'solo-E5', hz: 666.2 },
  { file: 'solo-G5', hz: 787.6 },
  { file: 'solo-A5', hz: 881.1 },
  { file: 'solo-C6', hz: 1045.2 },
];

const SECTION = [
  { file: 'section-Fs3', hz: 370.3 },
  { file: 'section-A3', hz: 440.2 },
  { file: 'section-C4', hz: 523.4 },
  { file: 'section-E4', hz: 659.2 },
];

export interface ViolinSample {
  buffer: AudioBuffer;
  hz: number;
}

export interface ViolinSamples {
  solo: ViolinSample[];
  section: ViolinSample[];
}

let loading: Promise<ViolinSamples> | null = null;

async function loadSample(ctx: AudioContext, file: string, hz: number): Promise<ViolinSample> {
  const response = await fetch(`/sounds/violin/${file}.mp3`);
  if (!response.ok) throw new Error(`Could not load ${file}: ${response.status}`);
  const data = await response.arrayBuffer();
  // The callback form also works on older iPhones
  const buffer = await new Promise<AudioBuffer>((resolve, reject) => ctx.decodeAudioData(data, resolve, reject));
  return { buffer, hz };
}

/** Loads the recordings once per page. A failed load can be tried again later. */
export function loadViolinSamples(ctx: AudioContext): Promise<ViolinSamples> {
  if (!loading) {
    loading = Promise.all([
      Promise.all(SOLO.map(({ file, hz }) => loadSample(ctx, file, hz))),
      Promise.all(SECTION.map(({ file, hz }) => loadSample(ctx, file, hz))),
    ]).then(([solo, section]) => ({ solo, section }));
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** Finds the recording closest in pitch, so it needs the smallest possible shift. */
export function closestSample(samples: ViolinSample[], freq: number): ViolinSample {
  return samples.reduce((best, sample) =>
    Math.abs(Math.log2(sample.hz / freq)) < Math.abs(Math.log2(best.hz / freq)) ? sample : best
  );
}

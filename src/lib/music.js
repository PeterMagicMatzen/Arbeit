// Shared music helpers, colours and formatting for Christophs Noten App

export const COL = {
  rh: { base: '#35D07F', light: '#8AF5BE', dark: '#1E9E5B', name: 'RECHTE HAND', short: 'Rechte Hand' },
  lh: { base: '#F2709C', light: '#FFA9C6', dark: '#C54373', name: 'LINKE HAND', short: 'Linke Hand' },
  ped: { base: '#5B8DEF', light: '#9DBBFF', dark: '#3A62C2', name: 'PEDAL', short: 'Pedal' },
};

// colours used when the "Stimmen" button colours notes by voice (S, A, T, B)
export const VOICE_COL = {
  1: { base: '#35D07F', light: '#8AF5BE', dark: '#1E9E5B', name: 'Sopran' },
  2: { base: '#F5B83D', light: '#FFDC8F', dark: '#C1841A', name: 'Alt' },
  3: { base: '#B47CFF', light: '#D7B8FF', dark: '#7F49D1', name: 'Tenor' },
  4: { base: '#5B8DEF', light: '#9DBBFF', dark: '#3A62C2', name: 'Bass' },
};

export const GREEN = '#3DDC84';
export const BLACK = new Set([1, 3, 6, 8, 10]);
export const HANDS = ['rh', 'lh', 'ped'];
export const DEFAULT_NAMES = ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'B', 'H'];

export const isBlack = (p) => BLACK.has(((p % 12) + 12) % 12);
export const midiFreq = (p, a4 = 440) => a4 * Math.pow(2, (p - 69) / 12);
export const octaveLabel = (p) => `C${Math.floor(p / 12) - 1}`;

export function fmt(t) {
  const s = Math.max(0, Math.floor(t + 1e-6));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// neon hue for the reward highlight: green (low) -> cyan -> blue -> purple -> pink (high)
export function neonHue(p, lo = 36, hi = 84) {
  const f = Math.min(1, Math.max(0, (p - lo) / Math.max(1, hi - lo)));
  return 150 + f * 180;
}

// --- chord parsing (German names: H = B natural, B = B flat, Es, As, Fis ...) ---
const ROOTS = { C: 0, Cis: 1, Des: 1, D: 2, Dis: 3, Es: 3, E: 4, F: 5, Fis: 6, Ges: 6, G: 7, Gis: 8, As: 8, A: 9, Ais: 10, B: 10, H: 11 };
export function chordPitches(name) {
  if (!name) return null;
  const m = /^(Cis|Des|Dis|Es|Fis|Ges|Gis|As|Ais|C|D|E|F|G|A|B|H)(.*)$/.exec(name.trim());
  if (!m) return null;
  const r = ROOTS[m[1]];
  const suf = m[2] || '';
  let iv = [0, 4, 7];
  if (suf.startsWith('m') && !suf.startsWith('maj')) iv = [0, 3, 7];
  if (suf.includes('°') || suf.includes('dim')) iv = [0, 3, 6];
  if (/7/.test(suf)) iv = [...iv, suf.includes('maj') ? 11 : (suf.includes('°') ? 9 : 10)];
  const out = [36 + r + (r < 5 ? 12 : 0)];
  for (const i of iv) {
    const p = 60 + r + i;
    out.push(p > 79 ? p - 12 : p);
  }
  return out;
}

export function composerShort(c) {
  if (!c) return '';
  if (/Johann Sebastian Bach/i.test(c)) return 'J. S. Bach';
  return c;
}

export function lowerBound(arr, x, key = (v) => v) {
  let lo = 0, hi = arr.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (key(arr[mid]) < x) lo = mid + 1; else hi = mid; }
  return lo;
}

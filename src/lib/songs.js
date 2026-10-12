// Loading songs + variations from the Base44 database (with static fallback files in /public/data)
import { base44 } from '@/api/base44Client';
import { DEFAULT_NAMES, HANDS } from './music';

const SLUGS = ['toccata', 'bwv870', 'bwv542'];

const FALLBACK_VARIATIONS = SLUGS.flatMap((slug) => [
  { id: `${slug}-100`, song_slug: slug, label: 'Originaltempo', tempo_factor: 1, order: 1, description: 'Spiele im Tempo der Aufnahme (100 %).' },
  { id: `${slug}-60`, song_slug: slug, label: 'Übungstempo', tempo_factor: 0.6, order: 2, description: 'Langsames Üben mit 60 % Tempo.' },
]);

function normalise(song) {
  const chords = (song.chords || []).map((c) => (Array.isArray(c) ? { s: c[0], e: c[1], name: c[2] } : c));
  return { ...song, chords, default_names: song.default_names?.length === 12 ? song.default_names : DEFAULT_NAMES };
}

async function staticMeta(slug) {
  const r = await fetch(`/data/${slug}.meta.json`);
  if (!r.ok) throw new Error('Song nicht gefunden');
  return normalise({ ...(await r.json()), _static: true });
}

export async function fetchSongs() {
  try {
    const list = await base44.entities.Song.list('order', 50);
    if (Array.isArray(list) && list.length) {
      return list.map(normalise).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  } catch (e) {
    console.warn('Song-Datenbank nicht erreichbar, nutze lokale Daten', e);
  }
  return Promise.all(SLUGS.map(staticMeta));
}

export async function fetchVariations() {
  try {
    const list = await base44.entities.SongVariation.list('order', 100);
    if (Array.isArray(list) && list.length) return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (e) {
    console.warn('Variationen nicht erreichbar, nutze Standard', e);
  }
  return FALLBACK_VARIATIONS;
}

export async function loadSong(slug) {
  let song = null;
  try {
    const list = await base44.entities.Song.filter({ slug });
    if (list?.length) song = normalise(list[0]);
  } catch (e) {
    console.warn('Song aus Datenbank nicht ladbar', e);
  }
  if (!song) song = await staticMeta(slug);
  let raw = song.notes_chunks?.length ? song.notes_chunks.join('') : '';
  if (!raw) {
    const r = await fetch(`/data/${slug}.notes.txt`);
    raw = await r.text();
  }
  const notes = parseNotes(raw, song.default_names);
  let variations = [];
  try {
    variations = (await base44.entities.SongVariation.filter({ song_slug: slug })) || [];
  } catch { /* ignore */ }
  if (!variations.length) variations = FALLBACK_VARIATIONS.filter((v) => v.song_slug === slug);
  variations.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return { song, notes, variations };
}

// "Δstart_cs,dur_cs,midi,code[,name]" joined by ";" ; code = hand + 3*voice
export function parseNotes(raw, names = DEFAULT_NAMES) {
  const out = [];
  let t = 0;
  for (const part of raw.split(';')) {
    if (!part) continue;
    const f = part.split(',');
    t += Number(f[0]);
    const s = t / 100;
    const d = Number(f[1]) / 100;
    const p = Number(f[2]);
    const code = Number(f[3]);
    out.push({
      i: out.length, s, e: s + d, p,
      hand: HANDS[code % 3], voice: Math.floor(code / 3),
      nm: f[4] || names[((p % 12) + 12) % 12],
      state: 0, hitAt: 0, dt: 0, hue: 0,
    });
  }
  out.sort((a, b) => a.s - b.s || a.p - b.p);
  out.forEach((n, i) => { n.i = i; });
  return out;
}

export function songSections(song) {
  const M = (m) => song.measures[Math.max(0, Math.min(song.measures.length - 1, m - 1))];
  const end = song.measures[song.measures.length - 1] ?? song.duration;
  const secs = (song.sections || []).map((s, i, arr) => ({
    label: s.label, measure: s.measure,
    s: M(s.measure), e: i + 1 < arr.length ? M(arr[i + 1].measure) : Math.max(end, song.duration || end),
  }));
  return secs;
}

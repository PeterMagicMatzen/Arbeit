// Loading songs + variations from the Base44 database (with static fallback files in /public/data)
import { base44 } from '@/api/base44Client';
import { DEFAULT_NAMES, HANDS } from './music';

const SLUGS = ['toccata', 'bwv870', 'bwv542', 'bwv1066'];

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

// Songs from the database; songs that exist only as static files in /public/data (e.g. a newly added piece
// before its records were created) are added from there.
export async function fetchSongs() {
  let list = [];
  try {
    list = (await base44.entities.Song.list('order', 50)) || [];
  } catch (e) {
    console.warn('Song-Datenbank nicht erreichbar, nutze lokale Daten', e);
  }
  const have = new Set(list.map((s) => s.slug));
  const extra = (await Promise.all(SLUGS.filter((s) => !have.has(s)).map((s) => staticMeta(s).catch(() => null)))).filter(Boolean);
  return [...list.map(normalise), ...extra].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function fetchVariations() {
  let list = [];
  try {
    list = (await base44.entities.SongVariation.list('order', 100)) || [];
  } catch (e) {
    console.warn('Variationen nicht erreichbar, nutze Standard', e);
  }
  const have = new Set(list.map((v) => v.song_slug));
  return [...list, ...FALLBACK_VARIATIONS.filter((v) => !have.has(v.song_slug))].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Admin only: create database records (Song + 2 SongVariations) for songs that so far exist only as static files.
// Returns the list of created slugs. Does nothing if the database cannot be read.
export async function seedMissingSongs() {
  const list = await base44.entities.Song.list('order', 50);
  if (!Array.isArray(list)) return [];
  const have = new Set(list.map((s) => s.slug));
  const vars = (await base44.entities.SongVariation.list('order', 100)) || [];
  const created = [];
  for (const slug of SLUGS) {
    if (have.has(slug)) continue;
    const r = await fetch(`/data/${slug}.meta.json`);
    if (!r.ok) continue;
    const meta = await r.json();
    const raw = await (await fetch(`/data/${slug}.notes.txt`)).text();
    const chunks = [];
    let rest = raw;
    while (rest.length > 5500) {
      const cut = rest.lastIndexOf(';', 5500) + 1;
      chunks.push(rest.slice(0, cut)); rest = rest.slice(cut);
    }
    if (rest) chunks.push(rest);
    const { measures, sections, default_names: names, ...fields } = meta;
    const chords = (meta.chords || []).map((c) => (Array.isArray(c) ? { s: c[0], e: c[1], name: c[2] || '' } : c));
    await base44.entities.Song.create({ ...fields, measures, sections, default_names: names, chords, notes_chunks: chunks, note_count: meta.note_count || parseNotes(raw).length });
    if (!vars.some((v) => v.song_slug === slug)) {
      for (const v of FALLBACK_VARIATIONS.filter((x) => x.song_slug === slug)) {
        const { id, ...rec } = v; // eslint-disable-line no-unused-vars
        await base44.entities.SongVariation.create(rec);
      }
    }
    created.push(slug);
  }
  return created;
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

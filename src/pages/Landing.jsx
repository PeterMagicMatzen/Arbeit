import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, ChevronDown, Piano, Mic, Sparkles, Music2, LogIn, LogOut, Upload, Trash2, Check, Trophy, Headphones } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import NeonHero from '@/components/landing/NeonHero';
import { fetchSongs, fetchVariations, parseNotes, seedMissingSongs } from '@/lib/songs';
import { engine } from '@/lib/audioEngine';
import { MidiInput, MicDetector } from '@/lib/inputs';
import { DEFAULT_NAMES, fmt, neonHue } from '@/lib/music';

const RAINBOW_TEXT = { background: 'linear-gradient(90deg,#35D07F 0%,#36C8F0 28%,#5B8DEF 50%,#B47CFF 74%,#F2709C 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };

function noteLabel(p, names = DEFAULT_NAMES) {
  return `${names[((p % 12) + 12) % 12]}${Math.floor(p / 12) - 1}`;
}

// ------------------------------------------------------------------ mini piano roll + audio preview
function MiniRoll({ song, accent, recordingUrl }) {
  const ref = useRef(null);
  const [notes, setNotes] = useState(null);
  const [playing, setPlaying] = useState(false);
  const stopTimer = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      let raw = song.notes_chunks?.length ? song.notes_chunks.slice(0, 2).join('') : '';
      if (!raw) { try { raw = await (await fetch(`/data/${song.slug}.notes.txt`)).text(); } catch { raw = ''; } }
      const all = parseNotes(raw.slice(0, raw.lastIndexOf(';') > 0 ? raw.lastIndexOf(';') : raw.length), song.default_names);
      if (alive) setNotes(all);
    };
    load();
    return () => { alive = false; };
  }, [song]);

  useEffect(() => {
    const cv = ref.current; if (!cv || !notes?.length) return;
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const t0 = notes[0].s, span = 12;
    const vis = notes.filter((n) => n.s < t0 + span);
    const lo = Math.min(...vis.map((n) => n.p)) - 2, hi = Math.max(...vis.map((n) => n.p)) + 2;
    ctx.fillStyle = '#07070C'; ctx.fillRect(0, 0, r.width, r.height);
    ctx.globalCompositeOperation = 'lighter';
    for (const n of vis) {
      const x = ((n.s - t0) / span) * r.width;
      const w = Math.max(3, ((n.e - n.s) / span) * r.width - 1.5);
      const y = r.height - 10 - ((n.p - lo) / (hi - lo)) * (r.height - 20);
      const hue = neonHue(n.p, 36, 84);
      ctx.shadowColor = `hsl(${hue},100%,60%)`; ctx.shadowBlur = 8;
      ctx.fillStyle = `hsla(${hue},100%,62%,.95)`;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y - 2.5, w, 5, 2.5) : ctx.rect(x, y - 2.5, w, 5); ctx.fill();
    }
  }, [notes]);

  const toggle = async (e) => {
    e.stopPropagation();
    if (playing) { engine.stopAll(); audioRef.current?.pause(); setPlaying(false); clearTimeout(stopTimer.current); return; }
    if (recordingUrl) {
      const a = audioRef.current && audioRef.current.dataset.src === recordingUrl ? audioRef.current : new Audio(recordingUrl);
      a.dataset.src = recordingUrl; audioRef.current = a;
      try { a.currentTime = Math.max(0, (notes?.[0]?.s || 0) - 0.3); } catch { /* ignore */ }
      a.play().catch(() => setPlaying(false));
      setPlaying(true);
      stopTimer.current = setTimeout(() => { a.pause(); setPlaying(false); }, 12000);
      return;
    }
    if (!notes?.length) return;
    await engine.resume();
    engine.setInstrument(song.instrument);
    const t0 = notes[0].s; const now = engine.now + 0.08;
    notes.filter((n) => n.s < t0 + 10).forEach((n) => engine.note(n.p, now + (n.s - t0), Math.max(0.05, n.e - n.s - 0.02), { hand: n.hand }));
    setPlaying(true);
    stopTimer.current = setTimeout(() => setPlaying(false), 11000);
  };
  useEffect(() => () => { clearTimeout(stopTimer.current); audioRef.current?.pause(); }, []);

  return (
    <div className="relative h-36 overflow-hidden">
      <canvas ref={ref} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, transparent 40%, rgba(14,14,22,.95)), radial-gradient(circle at 85% 0%, ${accent}33, transparent 60%)` }} />
      <button type="button" onClick={toggle} className="absolute right-4 bottom-3 flex items-center gap-2 rounded-full bg-black/60 border border-white/15 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-black/80 hover:border-white/40 transition">
        {playing ? <Square size={14} fill="#fff" /> : <Headphones size={15} />} {playing ? 'Stopp' : recordingUrl ? 'Hörprobe (Aufnahme)' : 'Hörprobe'}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ admin upload of recordings
function RecordingAdmin({ variation, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const inputRef = useRef(null);
  const upload = async (file) => {
    if (!file) return;
    setBusy(true); setMsg('Lade hoch …');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.SongVariation.update(variation.id, { audio_url: file_url });
      setMsg('Aufnahme gespeichert'); onChanged();
    } catch (e) {
      setMsg(`Fehler: ${e?.message || 'Upload fehlgeschlagen'}`);
    } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await base44.entities.SongVariation.update(variation.id, { audio_url: '' }); setMsg('Aufnahme entfernt'); onChanged(); } catch (e) { setMsg(e?.message || 'Fehler'); }
    setBusy(false);
  };
  return (
    <div className="flex items-center gap-2 text-xs text-[#9C9CB0]">
      <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 hover:border-white/40 hover:text-white disabled:opacity-50">
        <Upload size={12} /> {variation.audio_url ? 'Aufnahme ersetzen' : 'Aufnahme hochladen'}
      </button>
      {variation.audio_url && (
        <button type="button" disabled={busy} onClick={remove} className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 hover:border-red-400/60 hover:text-red-300 disabled:opacity-50"><Trash2 size={12} /></button>
      )}
      <span>{msg}</span>
    </div>
  );
}

// ------------------------------------------------------------------ admin: all recordings at once
function matchVariation(fileName, variations) {
  const n = fileName.toLowerCase();
  const slug = /1066|ouvert|suite/.test(n) ? 'bwv1066'
    : /toccata|buxwv|157|buxtehude/.test(n) ? 'toccata'
      : /870|c-dur|c_dur|cdur/.test(n) ? 'bwv870'
        : /542|g-moll|g_moll|gmoll|g_minor|gminor/.test(n) ? 'bwv542' : null;
  if (!slug) return null;
  const slow = /(^|[^0-9])60([^0-9]|$)|uebung|übung|langsam|slow/.test(n);
  return variations.find((v) => v.song_slug === slug && (slow ? v.tempo_factor < 0.99 : v.tempo_factor >= 0.99)) || null;
}

function BulkUpload({ songs, variations, onDone }) {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const title = (v) => { const s = songs.find((x) => x.slug === v.song_slug); return `${s ? `${s.title}, ${s.catalog}` : v.song_slug} – ${v.label} ${Math.round(v.tempo_factor * 100)} %`; };
  const run = async (files) => {
    const list = [...(files || [])];
    if (!list.length) return;
    setBusy(true);
    const init = list.map((f) => { const v = matchVariation(f.name, variations); return { name: f.name, v, state: v ? 'wartet' : 'nicht zuordenbar' }; });
    setRows(init);
    for (let i = 0; i < list.length; i++) {
      const v = init[i].v; if (!v) continue;
      setRows((r) => r.map((x, j) => (j === i ? { ...x, state: 'lädt hoch …' } : x)));
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: list[i] });
        await base44.entities.SongVariation.update(v.id, { audio_url: file_url });
        setRows((r) => r.map((x, j) => (j === i ? { ...x, state: 'fertig' } : x)));
      } catch (e) {
        setRows((r) => r.map((x, j) => (j === i ? { ...x, state: `Fehler: ${e?.message || 'Upload fehlgeschlagen'}` } : x)));
      }
    }
    setBusy(false);
    onDone();
  };
  const have = variations.filter((v) => v.audio_url).length;
  return (
    <div className="mb-8 rounded-3xl border border-[#B47CFF]/40 bg-[#B47CFF]/[0.07] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-bold text-white">Original-Aufnahmen ({have} von {variations.length} hochgeladen)</div>
          <div className="text-sm text-[#CFCFDC]">Alle MP3s aus dem Chat auf einmal auswählen – sie werden anhand des Namens (Stück + „100"/„60") zugeordnet und ab dann immer abgespielt.</div>
        </div>
        <input ref={inputRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => run(e.target.files)} />
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#B47CFF] px-4 py-2.5 font-bold text-[#12061F] transition hover:brightness-110 disabled:opacity-50">
          <Upload size={16} /> {busy ? 'Lädt hoch …' : 'Aufnahmen hochladen'}
        </button>
      </div>
      {rows.length > 0 && (
        <div className="mt-4 grid gap-1.5 text-sm">
          {rows.map((r) => (
            <div key={r.name} className="flex flex-wrap justify-between gap-2 rounded-lg bg-black/30 px-3 py-2">
              <span className="text-[#DADAE6]">{r.name}{r.v && <span className="text-[#9C9CB0]"> → {title(r.v)}</span>}</span>
              <span className={r.state === 'fertig' ? 'font-bold text-[#3DDC84]' : r.state.startsWith('Fehler') || r.state === 'nicht zuordenbar' ? 'text-[#FF8DA1]' : 'text-[#CFCFDC]'}>{r.state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ song card
function SongCard({ song, variations, best, isAdmin, onPlay, onReload }) {
  const accent = song.accent_color || '#35D07F';
  const chips = [song.key_name, song.instrument, fmt(song.duration || 0), `${song.measure_total || song.measure_count} Takte`, song.has_pedal ? 'mit Pedal' : `${song.voice_count || 3} Stimmen`];
  return (
    <article className="group relative flex flex-col rounded-3xl border border-white/10 bg-[#0E0E16] overflow-hidden transition hover:border-white/25 hover:-translate-y-0.5" style={{ boxShadow: `0 20px 60px -30px ${accent}55` }}>
      <MiniRoll song={song} accent={accent} recordingUrl={(variations.find((v) => v.tempo_factor >= 0.99 && v.audio_url) || variations.find((v) => v.audio_url))?.audio_url} />
      <div className="flex flex-1 flex-col p-6 pt-4">
        <div className="text-sm font-semibold tracking-wide" style={{ color: accent }}>{song.catalog} · {song.composer}</div>
        <h3 className="mt-1 text-2xl font-extrabold text-white">{song.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[#A9A9BA]">{song.subtitle}. {song.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => <span key={c} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[#CFCFDC]">{c}</span>)}
        </div>
        <div className="mt-6 grid gap-2.5">
          {variations.map((v) => (
            <div key={v.id}>
              <button type="button" onClick={() => onPlay(song, v)} className="w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition hover:brightness-110"
                style={{ borderColor: v.tempo_factor >= 0.99 ? `${accent}AA` : 'rgba(255,255,255,.14)', background: v.tempo_factor >= 0.99 ? `${accent}1F` : 'rgba(255,255,255,.03)' }}>
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: v.tempo_factor >= 0.99 ? accent : '#2A2A36' }}>
                    <Play size={16} fill={v.tempo_factor >= 0.99 ? '#08130D' : '#fff'} color={v.tempo_factor >= 0.99 ? '#08130D' : '#fff'} style={{ marginLeft: 2 }} />
                  </span>
                  <span>
                    <span className="block font-bold text-white">{v.label} · {Math.round(v.tempo_factor * 100)} %</span>
                    <span className="block text-xs text-[#9C9CB0]">{v.description || ''}</span>
                  </span>
                </span>
                <span className="text-right text-sm font-semibold text-[#CFCFDC]">
                  {fmt((song.duration || 0) / v.tempo_factor)}
                  {v.audio_url && <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>Aufnahme</span>}
                </span>
              </button>
              {isAdmin && <div className="mt-1.5 pl-1"><RecordingAdmin variation={v} onChanged={onReload} /></div>}
            </div>
          ))}
        </div>
        {best && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#CFCFDC]">
            <Trophy size={15} color="#F5B83D" /> Bestleistung: <b className="text-white">{Math.round(best.accuracy)} %</b> bei {best.tempo} % · Combo {best.best_combo}
          </div>
        )}
      </div>
    </article>
  );
}

// ------------------------------------------------------------------ input test
function InputTest() {
  const [midi, setMidi] = useState({ on: false, devices: [], last: null, err: '' });
  const [mic, setMic] = useState({ on: false, level: 0, note: null, err: '' });
  const midiRef = useRef(null); const micRef = useRef(null); const rafRef = useRef(null);

  const testMidi = async () => {
    if (midi.on) { midiRef.current?.stop(); setMidi({ on: false, devices: [], last: null, err: '' }); return; }
    try {
      const m = new MidiInput();
      m.onNote = (p, v, on) => { if (on) { setMidi((s) => ({ ...s, last: p })); engine.resume(); engine.preview(p, 0.4); } };
      m.onDevices = (d) => setMidi((s) => ({ ...s, devices: d }));
      const d = await m.start(); midiRef.current = m;
      setMidi({ on: true, devices: d, last: null, err: '' });
    } catch (e) {
      const denied = e?.name === 'SecurityError' || e?.name === 'NotAllowedError' || /permission|not granted|denied/i.test(e?.message || '');
      setMidi((s) => ({ ...s, err: denied ? 'MIDI-Zugriff wurde nicht erlaubt – bitte in der Adressleiste erlauben.' : (e?.message || 'MIDI nicht verfügbar') }));
    }
  };
  const testMic = async () => {
    if (mic.on) { cancelAnimationFrame(rafRef.current); micRef.current?.stop(); setMic({ on: false, level: 0, note: null, err: '' }); return; }
    try {
      await engine.resume();
      const d = new MicDetector(); await d.start(engine.ensure()); micRef.current = d;
      setMic({ on: true, level: 0, note: null, err: '' });
      let frame = 0;
      const tick = () => {
        d.update(); frame++;
        if (frame % 4 === 0) {
          let best = null, bs = 0;
          for (let p = 36; p <= 96; p++) { if (!d.isSounding(p)) continue; const s = d.salience(p); if (s > bs) { bs = s; best = p; } }
          setMic((s) => ({ ...s, level: d.level, note: best ?? (d.level < 0.01 ? null : s.note) }));
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) { setMic((s) => ({ ...s, err: e?.name === 'NotAllowedError' ? 'Mikrofon-Zugriff wurde nicht erlaubt' : (e?.message || 'Mikrofon nicht verfügbar') })); }
  };
  useEffect(() => () => { cancelAnimationFrame(rafRef.current); micRef.current?.stop(); midiRef.current?.stop(); }, []);

  const box = 'rounded-3xl border border-white/10 bg-[#0E0E16] p-6';
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={box}>
        <div className="flex items-center gap-3"><Piano color="#9DBBFF" /><h3 className="text-xl font-bold">MIDI-Keyboard</h3></div>
        <p className="mt-2 text-sm text-[#A9A9BA]">Keyboard per USB- oder MIDI-Kabel anschließen und auf „Prüfen" tippen. Funktioniert in Chrome, Edge und Opera.</p>
        <button type="button" onClick={testMidi} className="mt-4 rounded-xl px-4 py-2.5 font-bold transition hover:brightness-110" style={{ background: midi.on ? '#2A2A36' : '#5B8DEF', color: midi.on ? '#fff' : '#060B18' }}>{midi.on ? 'Beenden' : 'MIDI prüfen'}</button>
        <div className="mt-4 min-h-[64px] text-sm text-[#CFCFDC]">
          {midi.err && <span className="text-[#FF8DA1]">{midi.err}</span>}
          {midi.on && (midi.devices.length ? <div className="flex items-center gap-2"><Check size={16} color="#3DDC84" /> {midi.devices.join(', ')}</div> : <div>Kein Gerät gefunden – Kabel einstecken, die Liste aktualisiert sich automatisch.</div>)}
          {midi.on && <div className="mt-2">Zuletzt gespielt: <span className="text-2xl font-extrabold" style={RAINBOW_TEXT}>{midi.last != null ? noteLabel(midi.last) : '–'}</span></div>}
        </div>
      </div>
      <div className={box}>
        <div className="flex items-center gap-3"><Mic color="#FFA9C6" /><h3 className="text-xl font-bold">App hört zu</h3></div>
        <p className="mt-2 text-sm text-[#A9A9BA]">Die App erkennt über das Mikrofon, welche Töne du auf deinem Instrument spielst – auch mehrstimmig. Mit Kopfhörern klappt es am besten.</p>
        <button type="button" onClick={testMic} className="mt-4 rounded-xl px-4 py-2.5 font-bold transition hover:brightness-110" style={{ background: mic.on ? '#2A2A36' : '#F2709C', color: mic.on ? '#fff' : '#1A0610' }}>{mic.on ? 'Beenden' : 'Mikrofon testen'}</button>
        <div className="mt-4 min-h-[64px] text-sm text-[#CFCFDC]">
          {mic.err && <span className="text-[#FF8DA1]">{mic.err}</span>}
          {mic.on && (
            <>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full transition-[width] duration-75" style={{ width: `${Math.min(100, mic.level * 140)}%`, background: 'linear-gradient(90deg,#35D07F,#36C8F0,#B47CFF,#F2709C)' }} /></div>
              <div className="mt-2">Erkannter Ton: <span className="text-2xl font-extrabold" style={RAINBOW_TEXT}>{mic.note != null ? noteLabel(mic.note) : '–'}</span></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ page
export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, navigateToLogin, logout } = useAuth();
  const [songs, setSongs] = useState(null);
  const [variations, setVariations] = useState([]);
  const [results, setResults] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchSongs(), fetchVariations()]).then(([s, v]) => { if (alive) { setSongs(s); setVariations(v); } });
    return () => { alive = false; };
  }, [reloadKey]);

  useEffect(() => {
    if (!isAuthenticated) { setResults([]); return; }
    base44.entities.PracticeResult.list('-created_date', 300).then((r) => setResults(Array.isArray(r) ? r.filter((x) => !user?.email || x.created_by === user.email) : [])).catch(() => setResults([]));
  }, [isAuthenticated, user?.email]);

  const bestFor = (slug) => results.filter((r) => r.song_slug === slug).sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0];
  const play = (song, v) => navigate(`/spielen/${song.slug}?v=${encodeURIComponent(v.id)}`);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const isAdmin = user?.role === 'admin';

  // Admin: create database records for newly added pieces (they exist only as files in /public/data until then)
  const seeded = useRef(false);
  useEffect(() => {
    if (!isAdmin || seeded.current || !songs?.some((s) => s._static)) return;
    seeded.current = true;
    seedMissingSongs()
      .then((created) => { if (created.length) setReloadKey((k) => k + 1); })
      .catch((e) => console.warn('Neue Stücke konnten nicht angelegt werden', e));
  }, [isAdmin, songs]);

  return (
    <div className="min-h-screen bg-[#05050A] text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#05050A]/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg,#35D07F,#5B8DEF 55%,#F2709C)' }}><Music2 size={17} color="#05050A" /></span>
            <span className="hidden sm:inline">Christophs Noten App</span>
          </button>
          <div className="flex items-center gap-1 text-sm font-semibold text-[#CFCFDC]">
            <button type="button" onClick={() => scrollTo('lieder')} className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white">Lieder</button>
            <button type="button" onClick={() => scrollTo('so-gehts')} className="hidden rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white sm:block">So geht's</button>
            <button type="button" onClick={() => scrollTo('test')} className="hidden rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white sm:block">Eingabe testen</button>
            {isAuthenticated ? (
              <button type="button" onClick={() => logout()} title="Abmelden" className="ml-2 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 hover:border-white/30"><span className="max-w-[120px] truncate">{user?.full_name || user?.email}</span><LogOut size={15} /></button>
            ) : (
              <button type="button" onClick={navigateToLogin} className="ml-2 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 hover:border-white/30"><LogIn size={15} /> Anmelden</button>
            )}
          </div>
        </div>
      </nav>

      {/* hero */}
      <header className="relative h-[min(94vh,860px)] min-h-[560px] overflow-hidden">
        <NeonHero className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(5,5,10,.72), rgba(5,5,10,.25) 70%, rgba(5,5,10,0) 100%), linear-gradient(180deg, rgba(5,5,10,.55) 0%, rgba(5,5,10,0) 70%)' }} />
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-start px-5 pt-28 text-center sm:pt-36">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-sm font-semibold text-[#DADAE6] backdrop-blur">
            <Sparkles size={15} color="#36C8F0" /> Üben mit fallenden Noten · Orgel & Klavier
          </span>
          <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl" style={{ ...RAINBOW_TEXT, filter: 'drop-shadow(0 0 28px rgba(91,141,239,.35))' }}>
            Christophs<br />Noten App
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#DADAE6] sm:text-xl">
            Wähle ein Stück, schließ dein Keyboard per MIDI-Kabel an oder lass die App über das Mikrofon zuhören – jede richtig getroffene Note leuchtet neon auf.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => scrollTo('lieder')} className="flex items-center gap-2 rounded-2xl px-7 py-4 text-lg font-extrabold text-[#07130C] shadow-[0_0_40px_rgba(61,220,132,.35)] transition hover:brightness-110" style={{ background: 'linear-gradient(90deg,#35D07F,#36C8F0)' }}>
              Lied auswählen <ChevronDown size={20} />
            </button>
            <button type="button" onClick={() => scrollTo('so-gehts')} className="rounded-2xl border border-white/20 bg-black/40 px-7 py-4 text-lg font-bold backdrop-blur transition hover:border-white/50">So funktioniert's</button>
          </div>
        </div>
      </header>

      {/* songs */}
      <section id="lieder" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#36C8F0]">{songs ? `${['', 'Ein', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs'][songs.length] || songs.length} Stücke` : 'Die Stücke'} · je zwei Variationen</div>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Welches Stück möchtest du spielen?</h2>
          <p className="mt-3 text-[#A9A9BA]">Im Originaltempo oder langsam im Übungstempo – das Tempo lässt sich im Spieler jederzeit stufenlos ändern.</p>
        </div>
        {isAdmin && songs && <BulkUpload songs={songs} variations={variations} onDone={() => setReloadKey((k) => k + 1)} />}
        {!songs ? (
          <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-[520px] animate-pulse rounded-3xl bg-white/[0.04]" />)}</div>
        ) : (
          <div className={`grid gap-6 ${songs.length % 2 === 0 && songs.length % 3 !== 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {songs.map((s) => (
              <SongCard key={s.slug} song={s} variations={variations.filter((v) => v.song_slug === s.slug)} best={bestFor(s.slug)} isAdmin={isAdmin} onPlay={play} onReload={() => setReloadKey((k) => k + 1)} />
            ))}
          </div>
        )}
      </section>

      {/* how it works */}
      <section id="so-gehts" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">So funktioniert's</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { n: '1', t: 'Lied & Tempo wählen', d: 'Toccata, Fuge oder Ouvertüre – im Original- oder Übungstempo. Hände, Pedal, Notennamen und Abschnitte stellst du im Spieler ein.', c: '#35D07F', a: () => scrollTo('lieder'), b: 'Zu den Liedern' },
            { n: '2', t: 'Keyboard verbinden', d: 'Per USB-/MIDI-Kabel spielt dein Keyboard direkt mit. Ohne Kabel hört die App über das Mikrofon zu. Die Bildschirm-Tasten gehen immer.', c: '#5B8DEF', a: () => scrollTo('test'), b: 'Eingabe testen' },
            { n: '3', t: 'Spielen & leuchten', d: 'Triffst du eine Note, leuchtet sie neon auf, die Taste glüht, Funken sprühen – mit Combo-Zähler, Trefferquote und Warte-Modus zum Üben.', c: '#F2709C', a: () => songs?.[0] && variations[0] && play(songs[0], variations.find((v) => v.song_slug === songs[0].slug) || variations[0]), b: 'Direkt loslegen' },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl border border-white/10 bg-[#0E0E16] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black text-[#05050A]" style={{ background: s.c, boxShadow: `0 0 24px ${s.c}66` }}>{s.n}</div>
              <h3 className="mt-4 text-xl font-bold">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#A9A9BA]">{s.d}</p>
              <button type="button" onClick={s.a} className="mt-4 text-sm font-bold hover:underline" style={{ color: s.c }}>{s.b} →</button>
            </div>
          ))}
        </div>
      </section>

      <section id="test" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 pt-8 sm:px-6">
        <h2 className="mb-8 text-center text-3xl font-extrabold sm:text-4xl">Eingabe testen</h2>
        <InputTest />
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-[#7A7A8C]">
        Christophs Noten App · Noten nach der Partitur · Original-Aufnahmen{!isAuthenticated && <> · <button type="button" onClick={navigateToLogin} className="underline hover:text-white">Verwaltung</button></>}
      </footer>
    </div>
  );
}

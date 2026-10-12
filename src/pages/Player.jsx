import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Smartphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { engine } from '@/lib/audioEngine';
import { Transport } from '@/lib/transport';
import { MidiInput, MicDetector } from '@/lib/inputs';
import { StageRenderer, CANVAS_H, STAGE_W } from '@/lib/renderer';
import { loadSong, fetchSongs, songSections, measureLabel } from '@/lib/songs';
import { chordPitches, composerShort, fmt, isBlack, lowerBound, neonHue } from '@/lib/music';
import { Header, InfoRow, BottomBar, Hud } from '@/components/player/StageParts';
import {
  SectionMenu, MeasurePanel, SongMenu, InfoPanel, StatsPanel, SettingsPanel, StartCard, Countdown, ResultCard, Toast, WaitHint,
} from '@/components/player/Panels';

const WIN = { early: 0.22, late: 0.25, waitEarly: 0.6, micEarly: 0.12, micLate: 0.5 };
const LEAD = 3;                       // seconds (real time) before the first note
const COMBO_MARKS = new Set([10, 25, 50, 100, 150, 200, 300, 400, 500, 750, 1000]);
const RAINBOW = ['#35D07F', '#36C8F0', '#5B8DEF', '#B47CFF', '#F2709C'];
const freshStats = () => ({ hits: 0, misses: 0, perfect: 0, wrong: 0, combo: 0, best: 0 });
const pxPerMusicSec = (tempo, zoom) => ((261 - (1 - tempo) * 152.5) / tempo) * zoom;
const HAND_CYCLE = { both: 'rh', rh: 'lh', lh: 'none', none: 'both' };
const HAND_TOAST = { both: 'Du spielst beide Hände', rh: 'Du spielst die rechte Hand – links spielt die App', lh: 'Du spielst die linke Hand – rechts spielt die App', none: 'Zuhören: die App spielt alles vor' };

function useStage() {
  const [s, setS] = useState({ scale: 1, left: 0, top: 0, portrait: false });
  useEffect(() => {
    const f = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const scale = Math.min(vw / 1920, vh / 1080);
      setS({ scale, left: (vw - 1920 * scale) / 2, top: (vh - 1080 * scale) / 2, portrait: vh > vw * 1.1 });
    };
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return s;
}

export default function Player() {
  const { slug } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const stage = useStage();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [songs, setSongs] = useState([]);
  const [variation, setVariation] = useState(null);
  const [tempo, setTempo] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [handMode, setHandMode] = useState('both');
  const [pedMine, setPedMine] = useState(false);
  const [visible, setVisible] = useState({ rh: true, lh: true, ped: true });
  const [showNames, setShowNames] = useState(true);
  const [voiceColors, setVoiceColors] = useState(false);
  const [waitMode, setWaitMode] = useState(false);
  const [octaveOk, setOctaveOk] = useState(false);
  const [demoOwn, setDemoOwn] = useState(false);
  const [midiOn, setMidiOn] = useState(false);
  const [midiDevices, setMidiDevices] = useState([]);
  const [midiSound, setMidiSound] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [micSens, setMicSens] = useState(0.5);
  const [levels, setLevelsState] = useState({ ...engine.levels });
  const [useRecording, setUseRecording] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [remaining, setRemaining] = useState(false);
  const [loop, setLoop] = useState({ on: false, a: 1, b: 4 });
  const [panel, setPanel] = useState(null);
  const [result, setResult] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [hidePortrait, setHidePortrait] = useState(false);
  const [ui, setUi] = useState({ t: 0, stats: freshStats(), level: 0, frozen: false, waiting: '' });

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const trRef = useRef(null);
  if (!trRef.current) trRef.current = new Transport(engine);
  const midiRef = useRef(null);
  const micRef = useRef(null);
  const toastTimer = useRef(null);
  const L = useRef({ stats: freshStats(), missIdx: 0, waitIdx: 0, held: new Set(), pointers: new Map(), countTarget: null, ended: false, loopPass: 0, waitingNotes: null });
  const H = useRef({});

  const has = (k) => k !== 'ped' || !!data?.song?.has_pedal;
  const parts = { rh: handMode === 'both' || handMode === 'rh', lh: handMode === 'both' || handMode === 'lh', ped: pedMine && has('ped') };
  // original recording: the uploaded file whose tempo is closest to the current tempo
  const recordings = (data?.variations || []).filter((v) => v.audio_url);
  let src = null;
  for (const v of recordings) {
    const dd = Math.abs(v.tempo_factor - tempo) - (v.id === variation?.id ? 0.001 : 0);
    if (!src || dd < src.dd) src = { v, dd };
  }
  src = src ? src.v : null;
  const recordingOn = useRecording && !!src;
  Object.assign(L.current, { recordingOn, parts, visible, waitMode, octaveOk, demoOwn, micOn, midiSound, tempo, loop, showNames, voiceColors, zoom, data, variation, handMode, midiOn, isAuthenticated });

  // ------------------------------------------------------------------ helpers (ref based, safe in callbacks)
  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  };
  const isMine = (n) => { const S = L.current; return !!(S.parts[n.hand] && S.visible[n.hand]); };
  const M = (m) => { const ms = L.current.data.song.measures; return ms[Math.max(0, Math.min(ms.length - 1, m - 1))]; };

  const resetFrom = (m) => {
    const S = L.current; const notes = S.data.notes;
    const i0 = lowerBound(notes, m - 1e-4, (n) => n.s);
    for (let i = i0; i < notes.length; i++) {
      const n = notes[i];
      if (n.state === 1) { S.stats.hits--; if (n.perfect) S.stats.perfect--; } else if (n.state === 2) S.stats.misses--;
      n.state = 0; n.perfect = false;
    }
    S.stats.combo = 0;
    S.missIdx = i0; S.waitIdx = i0; S.ended = false; S.waitingNotes = null;
    rendererRef.current && rendererRef.current.clearEffects();
  };

  const seekTo = (m) => {
    const tr = trRef.current;
    resetFrom(m);
    tr.setHold(null);
    tr.seek(m);
  };

  const hit = (n, dtReal) => {
    const S = L.current;
    n.state = 1; n.hitAt = performance.now(); n.dt = dtReal; n.perfect = Math.abs(dtReal) < 0.075;
    S.stats.hits++; if (n.perfect) S.stats.perfect++;
    S.stats.combo++; S.stats.best = Math.max(S.stats.best, S.stats.combo);
    const R = rendererRef.current;
    if (R) R.burst(n, n.perfect ? 'perfect' : 'good');
    if (COMBO_MARKS.has(S.stats.combo)) {
      R && R.banner(`${S.stats.combo}er Combo!`, n.hue);
      if (S.stats.combo >= 25) confetti({ particleCount: 70, spread: 75, startVelocity: 38, origin: { y: 0.72 }, colors: RAINBOW, disableForReducedMotion: true });
    }
  };

  const onInputNote = (p) => {
    const tr = trRef.current; const S = L.current; const d = S.data;
    if (!d || !tr.playing) return;
    const t = tr.time(); const notes = d.notes;
    const early = (S.waitMode ? WIN.waitEarly : WIN.early) * S.tempo;
    const late = WIN.late * S.tempo;
    let best = null, bd = Infinity;
    for (let i = lowerBound(notes, t - late, (n) => n.s); i < notes.length && notes[i].s <= t + early; i++) {
      const n = notes[i];
      if (n.state !== 0 || !isMine(n)) continue;
      if (!(n.p === p || (S.octaveOk && (n.p - p) % 12 === 0))) continue;
      const dd = Math.abs(n.s - t);
      if (dd < bd) { bd = dd; best = n; }
    }
    if (best) { hit(best, (t - best.s) / S.tempo); return; }
    // neutral: the key belongs to a note that is sounding (accompaniment or already hit)
    for (let i = lowerBound(notes, t - d.maxLen, (n) => n.s); i < notes.length && notes[i].s <= t + early; i++) {
      const n = notes[i];
      if (n.p === p && n.e >= t - 0.15 && (n.state === 1 || !isMine(n))) return;
    }
    if (t < (S.countTarget ?? -Infinity) - 0.3) return;   // ignore warming up during count-in
    S.stats.wrong++; S.stats.combo = 0;
    rendererRef.current && rendererRef.current.flash(p);
  };

  const detectMic = (t) => {
    const S = L.current; const mic = micRef.current; const notes = S.data.notes;
    const early = (S.waitMode ? WIN.waitEarly : WIN.micEarly) * S.tempo;
    const late = WIN.micLate * S.tempo;
    const i0 = lowerBound(notes, t - late, (n) => n.s);
    const expected = new Set();
    for (let i = i0; i < notes.length && notes[i].s <= t + early; i++) if (isMine(notes[i])) expected.add(notes[i].p);
    for (let i = i0; i < notes.length && notes[i].s <= t + early; i++) {
      const n = notes[i];
      if (n.state !== 0 || !isMine(n)) continue;
      if (mic.confirmed(n.p, expected) || (S.octaveOk && (mic.confirmed(n.p - 12, expected) || mic.confirmed(n.p + 12, expected)))) {
        hit(n, (t - n.s) / S.tempo - 0.12);
      }
    }
  };

  const judgeMisses = (t) => {
    const S = L.current; const notes = S.data.notes;
    const late = (S.micOn ? WIN.micLate : WIN.late) * S.tempo;
    while (S.missIdx < notes.length && notes[S.missIdx].s + late < t) {
      const n = notes[S.missIdx++];
      if (n.state === 0 && isMine(n)) { n.state = 2; S.stats.misses++; S.stats.combo = 0; }
    }
  };

  const updateHold = (t) => {
    const tr = trRef.current; const S = L.current; const notes = S.data.notes;
    if (!S.waitMode) { if (tr.hold != null) tr.setHold(null); S.waitingNotes = null; return; }
    let i = S.waitIdx;
    while (i < notes.length && (notes[i].state !== 0 || !isMine(notes[i]) || notes[i].s < t - 0.005)) i++;
    S.waitIdx = i;
    const n = notes[i];
    const hold = n ? n.s : null;
    if (tr.hold !== hold) tr.setHold(hold);
    S.waitingNotes = tr.frozen && n ? notes.slice(i, i + 16).filter((x) => x.state === 0 && isMine(x) && Math.abs(x.s - n.s) < 0.035) : null;
  };

  const finish = () => {
    const S = L.current; const st = { ...S.stats };
    setResult({ stats: st, saved: false });
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 }, colors: RAINBOW, disableForReducedMotion: true });
    const judged = st.hits + st.misses;
    if (S.isAuthenticated && judged > 0) {
      const d = S.data;
      base44.entities.PracticeResult.create({
        song_slug: d.song.slug, variation_label: S.variation?.label || '', tempo: Math.round(S.tempo * 100),
        hands: [S.parts.rh && 'rh', S.parts.lh && 'lh', S.parts.ped && 'ped'].filter(Boolean).join('+') || 'zuhören',
        input_mode: S.micOn ? 'mic' : S.midiOn ? 'midi' : 'keys', hits: st.hits, total: judged,
        accuracy: Math.round((1000 * st.hits) / judged) / 10, best_combo: st.best, from_measure: 1, to_measure: d.song.measure_count,
      }).then(() => setResult((r) => (r ? { ...r, saved: true } : r))).catch((e) => console.warn('Ergebnis nicht gespeichert', e));
    }
  };

  const checkLoopAndEnd = (t) => {
    const S = L.current; const tr = trRef.current; const d = S.data;
    if (S.loop.on) {
      const ls = M(S.loop.a);
      const le = d.song.measures[Math.min(S.loop.b, d.song.measures.length - 1)];
      if (t >= le) {
        const back = ls - 1.2 * S.tempo;
        resetFrom(back); tr.setHold(null); tr.seek(back);
        S.loopPass++;
        rendererRef.current && rendererRef.current.banner(`Runde ${S.loopPass + 1}`, 150);
      }
      return;
    }
    if (!S.ended && t > d.end + 0.6) {
      S.ended = true;
      tr.pause(); setPlaying(false);
      finish();
    }
  };

  const startFrom = async (target, { listen = false } = {}) => {
    const S = L.current; const tr = trRef.current;
    await engine.resume();
    engine.setLevels(levels);
    if (listen) setHandMode('none');
    trRef.current.unlockAudio();
    const back = target - LEAD * S.tempo;
    resetFrom(back);
    tr.setHold(null);
    tr.seek(back);
    tr.play();
    S.countTarget = target;
    S.loopPass = 0;
    setPlaying(true); setStarted(true); setPanel(null); setResult(null);
  };

  const togglePlay = async () => {
    const S = L.current; const tr = trRef.current;
    if (!S.data) return;
    if (!started) return startFrom(S.data.first);
    if (tr.playing) { tr.pause(); setPlaying(false); return; }
    tr.unlockAudio();
    await engine.resume();
    if (S.ended || tr.time() > S.data.end) return startFrom(S.data.first);
    tr.play(); setPlaying(true);
  };

  const changeTempo = (x) => {
    const v = Math.round(Math.min(1, Math.max(0.25, x)) * 100) / 100;
    trRef.current.setTempo(v);
    setTempo(v);
  };

  const chooseVariation = (v) => {
    if (!v) return;
    setVariation(v);
    changeTempo(v.tempo_factor);
    toast(`${v.label} · ${Math.round(v.tempo_factor * 100)} %`);
  };

  const setLevels = (patch) => {
    setLevelsState((l) => { const n = { ...l, ...patch }; engine.setLevels(n); return n; });
  };

  const onMidiNote = (p, vel, on) => {
    const S = L.current;
    if (on) {
      S.held.add(p);
      if (S.midiSound) { engine.resume(); engine.noteOn(p); }
      onInputNote(p);
    } else {
      S.held.delete(p);
      engine.noteOff(p);
    }
  };

  const toggleMidi = async () => {
    if (midiOn) { midiRef.current && midiRef.current.stop(); midiRef.current = null; setMidiOn(false); setMidiDevices([]); toast('MIDI aus'); return; }
    try {
      const m = new MidiInput();
      m.onNote = (p, v, on) => H.current.onMidiNote(p, v, on);
      m.onDevices = (list) => { setMidiDevices(list); if (list.length) toast(`MIDI verbunden: ${list[0]}`); };
      const list = await m.start();
      midiRef.current = m; setMidiDevices(list); setMidiOn(true);
      toast(list.length ? `MIDI verbunden: ${list.join(', ')}` : 'MIDI aktiv – noch kein Gerät gefunden. Kabel einstecken.');
    } catch (e) {
      const denied = e?.name === 'SecurityError' || e?.name === 'NotAllowedError' || /permission|not granted|denied/i.test(e?.message || '');
      toast(denied ? 'MIDI-Zugriff wurde nicht erlaubt – bitte in der Adressleiste erlauben' : (e?.message || 'MIDI ist nicht verfügbar'));
    }
  };

  const toggleMic = async () => {
    if (micOn) { micRef.current && micRef.current.stop(); micRef.current = null; setMicOn(false); toast('Zuhören aus'); return; }
    try {
      await engine.resume();
      const m = new MicDetector();
      m.sensitivity = micSens;
      await m.start(engine.ensure());
      micRef.current = m; setMicOn(true);
      toast(L.current.recordingOn ? 'Die App hört zu – bitte Kopfhörer benutzen, sonst hört das Mikrofon die Aufnahme mit' : 'Die App hört jetzt zu – Kopfhörer verhindern, dass die Begleitung mitgehört wird');
    } catch (e) {
      toast(e?.name === 'NotAllowedError' ? 'Mikrofon-Zugriff wurde nicht erlaubt' : (e?.message || 'Mikrofon nicht verfügbar'));
    }
  };

  const currentInfo = (t) => {
    const d = L.current.data; const song = d.song; const ms = song.measures;
    const count = song.measure_count;
    const cnt = lowerBound(ms, t + 1e-6);   // number of measure starts <= t
    const measure = t >= ms[0] - 1e-6 ? Math.max(1, Math.min(count, cnt)) : null;
    let sec = -1;
    d.sections.forEach((s, i) => { if (t >= s.s - 1e-6) sec = i; });
    return { measure, sec };
  };

  const jumpSection = (i) => {
    const d = L.current.data; const s = d.sections[i]; if (!s) return;
    setPanel(null);
    if (!started) { startFrom(s.s); return; }
    seekTo(s.s - 1.2 * L.current.tempo);
    toast(`Abschnitt: ${s.label}`);
  };

  const goMeasure = (m) => {
    setPanel(null);
    const target = M(m);
    if (!started) { startFrom(target); return; }
    seekTo(target - 1.2 * L.current.tempo);
    toast(`Takt ${measureLabel(L.current.data.song, m)}`);
  };

  const applyLoop = (l) => {
    setLoop(l); setPanel(null);
    L.current.loopPass = 0;
    if (l.on) {
      const target = M(l.a);
      if (!started || !trRef.current.playing) startFrom(target);
      else seekTo(target - 1.2 * L.current.tempo);
      toast(`Schleife: Takt ${measureLabel(L.current.data.song, l.a)} – ${measureLabel(L.current.data.song, l.b)}`);
    } else toast('Schleife aus');
  };

  const toggleLoopChip = () => {
    if (loop.on) { applyLoop({ ...loop, on: false }); return; }
    const { measure } = currentInfo(trRef.current.time());
    const a = measure || 1;
    applyLoop({ on: true, a, b: Math.min(data.song.measure_count, a + 3) });
  };

  const resetStats = () => {
    const S = L.current;
    S.stats = freshStats();
    S.data.notes.forEach((n) => { n.state = 0; n.perfect = false; });
    S.missIdx = lowerBound(S.data.notes, trRef.current.time(), (n) => n.s);
    S.waitIdx = S.missIdx;
    setPanel(null); toast('Statistik zurückgesetzt');
  };

  H.current = { togglePlay, onMidiNote, changeTempo, toggleMic, toggleLoopChip, startFrom, onInputNote };
  try {
    if (import.meta.env.DEV || window.localStorage.getItem('cnaDebug')) window.__cna = { L, tr: trRef.current, H, isMine, mic: micRef, engine };
  } catch { /* storage blocked */ }

  // ------------------------------------------------------------------ loading
  useEffect(() => {
    let alive = true;
    const tr = trRef.current;
    tr.pause(); setPlaying(false); setStarted(false); setResult(null); setPanel(null); setData(null); setError(null);
    L.current.stats = freshStats();
    loadSong(slug).then((d) => {
      if (!alive) return;
      if (!d.notes.length) throw new Error('Keine Noten gefunden');
      let minP = 127, maxP = 0, maxLen = 0, end = 0;
      d.notes.forEach((n) => { minP = Math.min(minP, n.p); maxP = Math.max(maxP, n.p); maxLen = Math.max(maxLen, n.e - n.s); end = Math.max(end, n.e); });
      const lo = Math.min(36, Math.floor(minP / 12) * 12);
      const hiP = Math.max(84, maxP);
      const hi = isBlack(hiP) ? hiP + 1 : hiP;   // bis zur nächsten weißen Taste
      d.notes.forEach((n) => { n.hue = neonHue(n.p, lo, hi); });
      Object.assign(d, { lo, hi, maxLen, end, first: d.notes[0].s, sections: songSections(d.song) });
      const vp = search.get('v');
      const v = d.variations.find((x) => x.id === vp) || d.variations.find((x) => vp && Math.round(x.tempo_factor * 100) === Number(vp)) || d.variations[0];
      setVariation(v);
      setTempo(v ? v.tempo_factor : 1);
      tr.tempo = v ? v.tempo_factor : 1;
      setPedMine(false);
      setVoiceColors(false);
      setLoop({ on: false, a: 1, b: Math.min(4, d.song.measure_count) });
      setData(d);
    }).catch((e) => alive && setError(e.message || 'Fehler beim Laden'));
    fetchSongs().then((s) => alive && setSongs(s)).catch(() => {});
    return () => { alive = false; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // transport + renderer setup per song
  useEffect(() => {
    if (!data) return undefined;
    const tr = trRef.current;
    tr.setNotes(data.notes);
    engine.setInstrument(data.song.instrument);
    tr.shouldPlay = (n) => {
      const S = L.current;
      if (!S.visible[n.hand]) return false;
      if (!isMine(n)) return true;
      return S.demoOwn && !S.micOn;
    };
    tr.partOf = (n) => (isMine(n) ? 'own' : 'acc');
    tr.onAudioError = (e) => {
      if (e && e.name === 'AbortError') return;
      toast('Die Aufnahme konnte nicht abgespielt werden – der Synthesizer spielt solange.');
      tr.setUseAudio(false);
      setUseRecording(false);
    };
    tr.seek(data.first - 1.2 * tr.tempo);
    const R = new StageRenderer(canvasRef.current);
    R.setRange(data.lo, data.hi);
    rendererRef.current = R;
    return () => { tr.pause(); };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // canvas resolution
  useEffect(() => {
    if (rendererRef.current) rendererRef.current.resize(stage.scale * (window.devicePixelRatio || 1));
  }, [stage.scale, data]);

  // main animation loop
  useEffect(() => {
    if (!data) return undefined;
    const tr = trRef.current;
    let raf;
    const frame = () => {
      const S = L.current; const R = rendererRef.current;
      tr.pump();
      let t = tr.time();
      if (tr.playing) {
        if (micRef.current && micRef.current.active) { micRef.current.update(); detectMic(t); }
        judgeMisses(t);
        updateHold(t);
        checkLoopAndEnd(t);
        t = tr.time();
      } else if (micRef.current && micRef.current.active) micRef.current.update();
      if (R) {
        R.draw({
          notes: data.notes, t, pxm: pxPerMusicSec(S.tempo, S.zoom), maxLen: data.maxLen,
          visible: (n) => S.visible[n.hand], isMine, anyMine: S.parts.rh || S.parts.lh || S.parts.ped,
          showNames: S.showNames, voiceColors: S.voiceColors, held: S.held,
          loop: S.loop.on ? { s: M(S.loop.a), e: data.song.measures[Math.min(S.loop.b, data.song.measures.length - 1)] } : null,
          waitingNotes: tr.frozen ? S.waitingNotes : null,
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const pumpIv = setInterval(() => tr.pump(), 40);
    const uiIv = setInterval(() => {
      const S = L.current;
      setUi({
        t: tr.time(), stats: { ...S.stats }, level: micRef.current ? micRef.current.level : 0,
        frozen: tr.frozen && tr.playing, waiting: S.waitingNotes ? S.waitingNotes.map((n) => n.nm).join(' + ') : '',
      });
    }, 100);
    return () => { cancelAnimationFrame(raf); clearInterval(pumpIv); clearInterval(uiIv); };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // settings side effects
  useEffect(() => { if (micRef.current) micRef.current.sensitivity = micSens; }, [micSens]);
  useEffect(() => {
    const tr = trRef.current;
    tr.attachAudio(src?.audio_url || null, src?.tempo_factor || 1);
    tr.setUseAudio(useRecording && !!src);
  }, [src?.id, src?.audio_url, data]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { trRef.current.setUseAudio(useRecording && !!src); }, [useRecording]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!data) return;
    const t = trRef.current.time();
    L.current.waitIdx = lowerBound(data.notes, t - 0.01, (n) => n.s);
    engine.stopAll({ futureOnly: true });
    trRef.current.idx = lowerBound(data.notes, t + 0.0001, (n) => n.s);
  }, [handMode, pedMine, visible, waitMode, demoOwn, micOn]); // eslint-disable-line react-hooks/exhaustive-deps

  // cleanup on unmount
  useEffect(() => () => {
    trRef.current.pause();
    midiRef.current && midiRef.current.stop();
    micRef.current && micRef.current.stop();
    engine.stopAll();
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const S = L.current; if (!S.data) return;
      const { measure } = currentInfo(trRef.current.time());
      switch (e.code) {
        case 'Space': e.preventDefault(); H.current.togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); seekTo(M(Math.max(1, (measure || 1) - 1))); break;
        case 'ArrowRight': e.preventDefault(); seekTo(M(Math.min(S.data.song.measure_count, (measure || 0) + 1))); break;
        case 'ArrowUp': e.preventDefault(); H.current.changeTempo(S.tempo + 0.05); break;
        case 'ArrowDown': e.preventDefault(); H.current.changeTempo(S.tempo - 0.05); break;
        case 'KeyN': setShowNames((v) => !v); break;
        case 'KeyH': setHandMode((m) => { const n = HAND_CYCLE[m]; toast(HAND_TOAST[n]); return n; }); break;
        case 'KeyP': if (S.data.song.has_pedal) setPedMine((v) => { toast(!v ? 'Pedal spielst jetzt du' : 'Pedal spielt jetzt die App'); return !v; }); break;
        case 'KeyW': setWaitMode((v) => { toast(!v ? 'Warte-Modus an' : 'Warte-Modus aus'); return !v; }); break;
        case 'KeyL': H.current.toggleLoopChip(); break;
        case 'KeyM': H.current.toggleMic(); break;
        case 'Home': e.preventDefault(); H.current.startFrom(S.data.first); break;
        case 'Escape': setPanel(null); break;
        default:
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------ canvas pointer input
  const toLocal = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * STAGE_W, y: ((e.clientY - r.top) / r.height) * CANVAS_H };
  };
  const onCanvasDown = (e) => {
    const R = rendererRef.current; if (!R) return;
    const { x, y } = toLocal(e);
    const p = R.keyAt(x, y);
    const S = L.current;
    if (p != null) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      engine.resume(); engine.noteOn(p);
      S.pointers.set(e.pointerId, p); S.held.add(p);
      onInputNote(p);
      return;
    }
    const n = R.noteAt(x, y, { notes: data.notes, t: trRef.current.time(), pxm: pxPerMusicSec(S.tempo, S.zoom), maxLen: data.maxLen, visible: (q) => S.visible[q.hand] });
    if (n) { engine.resume(); engine.preview(n.p, Math.min(1.2, Math.max(0.3, (n.e - n.s) / S.tempo)), n.hand); toast(`${n.nm} · ${{ rh: 'rechte Hand', lh: 'linke Hand', ped: 'Pedal' }[n.hand]}`); return; }
    togglePlay();
  };
  const onCanvasMove = (e) => {
    const S = L.current; const old = S.pointers.get(e.pointerId);
    if (old == null) return;
    const { x, y } = toLocal(e);
    const p = rendererRef.current.keyAt(x, y);
    if (p != null && p !== old) {
      engine.noteOff(old); S.held.delete(old);
      engine.noteOn(p); S.held.add(p); S.pointers.set(e.pointerId, p);
      onInputNote(p);
    }
  };
  const onCanvasUp = (e) => {
    const S = L.current; const p = S.pointers.get(e.pointerId);
    if (p == null) return;
    engine.noteOff(p); S.held.delete(p); S.pointers.delete(e.pointerId);
  };

  // ------------------------------------------------------------------ render
  if (error) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0B0B10', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Das Lied konnte nicht geladen werden</div>
        <div style={{ color: '#9C9CB0' }}>{error}</div>
        <button type="button" onClick={() => navigate('/')} style={{ background: '#3DDC84', color: '#08130D', fontWeight: 800, padding: '12px 22px', borderRadius: 12 }}>Zur Startseite</button>
      </div>
    );
  }
  if (!data) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0B0B10', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, fontFamily: 'Inter, sans-serif' }}>
        <div className="cna-loader" />
        <div style={{ color: '#CFCFDC', fontSize: 18 }}>Lade Noten …</div>
      </div>
    );
  }

  const song = data.song;
  const t = ui.t;
  const { measure, sec } = currentInfo(t);
  const secObj = sec >= 0 ? data.sections[sec] : null;
  const fugaIdx = data.sections.findIndex((s) => /fuge/i.test(s.label));
  let part = 'FUGE';
  if (t < song.measures[0]) part = 'START';
  else if (/toccata/i.test(song.title)) part = fugaIdx >= 0 && sec >= fugaIdx ? 'FUGE' : 'TOCCATA';
  else if (/fantasie/i.test(song.title)) part = 'FANTASIE';
  else if (/ouvert/i.test(song.title)) part = /allegro/i.test(secObj?.label || '') ? 'ALLEGRO' : 'GRAVE';
  const sStart = secObj ? secObj.s : 0;
  const sEnd = secObj ? secObj.e : song.measures[0];
  const sectionFrac = Math.min(1, Math.max(0, (t - sStart) / Math.max(0.01, sEnd - sStart)));
  const loopS = loop.on ? M(loop.a) : null;
  const loopE = loop.on ? song.measures[Math.min(loop.b, song.measures.length - 1)] : null;
  const info = {
    part, section: secObj ? secObj.label : 'Start', measure, sectionFrac,
    loop: loop.on && secObj && loopE > sStart && loopS < sEnd
      ? [Math.max(0, (loopS - sStart) / (sEnd - sStart)), Math.min(1, (loopE - sStart) / (sEnd - sStart))] : null,
  };
  const chords = song.chords || [];
  const ci = chords.findIndex((c) => c.s <= t && t < c.e);
  const cur = ci >= 0 ? chords[ci] : null;
  let next = null;
  for (let i = Math.max(0, ci + 1); i < chords.length; i++) {
    if (chords[i].s > t && chords[i].name && chords[i].name !== cur?.name) { next = chords[i]; break; }
  }
  const nextSecs = next ? (next.s - t) / tempo : 0;
  const chord = {
    name: cur?.name || '', pulse: cur ? (t - cur.s) / tempo < 0.35 : false,
    next: next?.name || '', inText: nextSecs >= 1 ? `in ${Math.round(nextSecs)} s` : 'jetzt',
  };
  const dur = song.duration || data.end;
  const posText = fmt(Math.max(0, t) / tempo);
  const totalText = fmt(dur / tempo);
  const frac = Math.min(1, Math.max(0, t / dur));
  const sectionRange = secObj ? [secObj.measure, Math.max(secObj.measure, (data.sections[sec + 1]?.measure || song.measure_count + 1) - 1)] : [1, Math.min(4, song.measure_count)];
  const countdown = playing && L.current.countTarget != null && t < L.current.countTarget + 0.25 && t > L.current.countTarget - LEAD * tempo - 0.1
    ? (L.current.countTarget - t > 0.15 * tempo ? `Los geht's in ${Math.max(1, Math.ceil((L.current.countTarget - t) / tempo - 0.15))} …` : 'Los!') : null;
  const subtitle = `${composerShort(song.composer)} · ${song.subtitle} · Übungsmodus nach der Partitur`;
  const otherVariation = data.variations.find((v) => v.id !== variation?.id);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'absolute', left: stage.left, top: stage.top, width: 1920, height: 1080, transform: `scale(${stage.scale})`, transformOrigin: 'top left', background: '#0B0B10', overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none' }}>
        <Header song={song} tempo={tempo} subtitle={subtitle}
          onTempoClick={() => (otherVariation ? chooseVariation(otherVariation) : changeTempo(tempo >= 0.99 ? 0.6 : 1))}
          onTitleClick={() => setPanel('songs')} onSubtitleClick={() => setPanel('info')}
          timeText={posText} totalText={totalText} playing={playing} onPlayToggle={togglePlay}
          visible={visible} onToggleVisible={(k) => setVisible((v) => { const n = { ...v, [k]: !v[k] }; toast(`${{ rh: 'Rechte Hand', lh: 'Linke Hand', ped: 'Pedal' }[k]} ${n[k] ? 'eingeblendet' : 'ausgeblendet & stumm'}`); return n; })} />
        <InfoRow song={song} showNames={showNames} onToggleNames={() => { setShowNames(!showNames); toast(!showNames ? 'Notennamen an' : 'Notennamen aus'); }}
          handMode={handMode} onCycleHands={() => { const n = HAND_CYCLE[handMode]; setHandMode(n); toast(HAND_TOAST[n]); }}
          pedMine={pedMine} onTogglePed={() => { setPedMine(!pedMine); toast(!pedMine ? 'Pedal spielst jetzt du' : 'Pedal spielt jetzt die App'); }}
          voiceColors={voiceColors} onToggleVoices={() => { setVoiceColors(!voiceColors); toast(!voiceColors ? 'Stimmenfarben: Sopran grün · Alt gelb · Bass blau' : 'Farben nach Händen'); }}
          tempo={tempo} onTempo={changeTempo}
          onTempoLabel={() => { changeTempo(variation?.tempo_factor || 1); toast(`Tempo der Variation: ${Math.round((variation?.tempo_factor || 1) * 100)} %`); }}
          onTempoValue={() => changeTempo(tempo >= 0.99 ? 0.6 : 1)}
          info={info} onSectionClick={() => setPanel('sections')} onMeasureClick={() => setPanel('measure')}
          onSectionBar={(e) => { const r = e.currentTarget.getBoundingClientRect(); const f = (e.clientX - r.left) / r.width; seekTo(sStart + f * (sEnd - sStart)); }}
          chord={chord}
          onChordClick={() => { if (cur?.name) { engine.resume(); engine.chord(chordPitches(cur.name)); } else toast('Gerade kein Akkord'); }}
          onNextChordClick={() => { if (next) seekTo(next.s - 0.8 * tempo); }} />

        <canvas ref={canvasRef} onPointerDown={onCanvasDown} onPointerMove={onCanvasMove} onPointerUp={onCanvasUp} onPointerCancel={onCanvasUp}
          style={{ position: 'absolute', left: 0, top: 206, width: 1920, height: 780, touchAction: 'none', cursor: 'pointer' }} />

        <Hud midiOn={midiOn} midiDevices={midiDevices} onMidi={toggleMidi} micOn={micOn} micLevel={ui.level} onMic={toggleMic}
          waitMode={waitMode} onWait={() => { setWaitMode(!waitMode); toast(!waitMode ? 'Warte-Modus an – die Noten warten auf dich' : 'Warte-Modus aus'); }}
          loopOn={loop.on} onLoop={toggleLoopChip} onSettings={() => setPanel('settings')} stats={ui.stats} onStats={() => setPanel('stats')}
          soundAvailable={!!src} soundOn={recordingOn}
          onSound={() => {
            if (!src) { toast('Noch keine Aufnahme hochgeladen – auf der Startseite angemeldet „Aufnahmen hochladen"'); return; }
            setUseRecording(!useRecording);
            toast(!useRecording ? `Original-Aufnahme (${Math.round(src.tempo_factor * 100)} %)` : 'Synthesizer');
          }} />

        <BottomBar frac={frac} timeText={posText} totalText={remaining ? `-${fmt(Math.max(0, dur - t) / tempo)}` : totalText}
          sections={data.sections} duration={dur} currentSection={sec}
          onSeekFrac={(f) => seekTo(f * dur)} onSection={jumpSection}
          onTimeLeft={() => { if (secObj) { seekTo(secObj.s - 1.0 * tempo); toast(`Zurück zum Anfang: ${secObj.label}`); } else seekTo(data.first - LEAD * tempo); }}
          onTimeRight={() => setRemaining(!remaining)}
          loopFrac={loop.on ? [loopS / dur, loopE / dur] : null} />

        {countdown && <Countdown text={countdown} />}
        {ui.frozen && waitMode && ui.waiting && <WaitHint names={ui.waiting} />}

        {!started && !panel && (
          <StartCard song={song} variations={data.variations} variation={variation} onVariation={chooseVariation}
            midiOn={midiOn} midiDevices={midiDevices} onMidi={toggleMidi} micOn={micOn} onMic={toggleMic}
            onStart={() => startFrom(data.first)} onListen={() => startFrom(data.first, { listen: true })}
            handMode={handMode} onCycleHands={() => setHandMode(HAND_CYCLE[handMode])}
            soundText={recordingOn ? `Klang: Original-Aufnahme (${Math.round(src.tempo_factor * 100)} %)` : src ? 'Klang: Synthesizer (Aufnahme in den Einstellungen wieder einschalten)' : 'Klang: Synthesizer – noch keine Aufnahme hochgeladen'} />
        )}

        {panel === 'sections' && <SectionMenu sections={data.sections} current={sec} onPick={jumpSection} onClose={() => setPanel(null)} />}
        {panel === 'measure' && <MeasurePanel song={song} current={measure} loop={loop} sectionRange={sectionRange} onGo={goMeasure} onLoop={applyLoop} onClose={() => setPanel(null)} />}
        {panel === 'songs' && <SongMenu songs={songs} currentSlug={slug} onPick={(s) => { setPanel(null); if (s !== slug) navigate(`/spielen/${s}`); }} onHome={() => navigate('/')} onClose={() => setPanel(null)} />}
        {panel === 'info' && <InfoPanel song={song} onClose={() => setPanel(null)} />}
        {panel === 'stats' && <StatsPanel stats={ui.stats} onReset={resetStats} onClose={() => setPanel(null)} />}
        {panel === 'settings' && (
          <SettingsPanel onClose={() => setPanel(null)}
            midiOn={midiOn} midiDevices={midiDevices} onMidi={toggleMidi} midiSound={midiSound} setMidiSound={setMidiSound}
            micOn={micOn} onMic={toggleMic} micSens={micSens} setMicSens={setMicSens}
            waitMode={waitMode} setWaitMode={setWaitMode} octaveOk={octaveOk} setOctaveOk={setOctaveOk} demoOwn={demoOwn} setDemoOwn={setDemoOwn}
            hasRecording={!!src} useRecording={useRecording} setUseRecording={setUseRecording}
            levels={levels} setLevels={setLevels} showNames={showNames} setShowNames={setShowNames}
            voiceCount={song.voice_count || 0} voiceColors={voiceColors} setVoiceColors={setVoiceColors} zoom={zoom} setZoom={setZoom} />
        )}
        {result && (
          <ResultCard stats={result.stats} tempo={tempo} saved={result.saved} canSave={isAuthenticated}
            onLogin={navigateToLogin} onAgain={() => startFrom(data.first)}
            onLoopPractice={() => { setResult(null); setPanel('measure'); }} onHome={() => navigate('/')} onClose={() => setResult(null)} />
        )}
        <Toast msg={toastMsg} />
      </div>

      {stage.portrait && !hidePortrait && (
        <div onClick={() => setHidePortrait(true)} style={{ position: 'fixed', left: 16, right: 16, bottom: 16, background: 'rgba(21,21,30,.96)', border: '1px solid #3A3A4A', borderRadius: 16, padding: '14px 16px', color: '#fff', display: 'flex', gap: 12, alignItems: 'center', fontSize: 15, zIndex: 100 }}>
          <Smartphone size={22} style={{ transform: 'rotate(90deg)', flex: 'none' }} />
          Für die beste Ansicht das Gerät quer halten. <span style={{ marginLeft: 'auto', color: '#9C9CB0' }}>OK</span>
        </div>
      )}
    </div>
  );
}

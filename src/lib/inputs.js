// Note input: Web-MIDI keyboards (USB / MIDI cable) and microphone listening.
import { midiFreq } from './music';

export class MidiInput {
  constructor() {
    this.access = null;
    this.onNote = null;      // (pitch, velocity, isOn) => void
    this.onDevices = null;   // (names[]) => void
  }

  static supported() { return typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess; }

  async start() {
    if (!MidiInput.supported()) {
      throw new Error('Dieser Browser unterstützt kein Web-MIDI. Bitte Chrome, Edge oder Opera verwenden.');
    }
    this.access = await navigator.requestMIDIAccess({ sysex: false });
    this.bind();
    this.access.onstatechange = () => { this.bind(); this.onDevices && this.onDevices(this.devices()); };
    return this.devices();
  }

  bind() {
    if (!this.access) return;
    for (const input of this.access.inputs.values()) {
      input.onmidimessage = (e) => this.handle(e);
    }
  }

  handle(e) {
    const [st, d1, d2] = e.data;
    const cmd = st & 0xf0;
    if (cmd === 0x90 && d2 > 0) this.onNote && this.onNote(d1, d2, true);
    else if (cmd === 0x80 || (cmd === 0x90 && d2 === 0)) this.onNote && this.onNote(d1, 0, false);
  }

  devices() {
    if (!this.access) return [];
    return [...this.access.inputs.values()].filter((i) => i.state !== 'disconnected').map((i) => i.name || 'MIDI-Gerät');
  }

  stop() {
    if (!this.access) return;
    for (const input of this.access.inputs.values()) input.onmidimessage = null;
    this.access.onstatechange = null;
    this.access = null;
  }
}

// Listens through the microphone and tells whether an expected pitch is sounding.
// Works polyphonically by checking the harmonic energy of each expected note against
// its neighbouring semitones and the noise floor.
const SHADOWS = [[2, 12, 0.8], [3, 19, 0.7], [4, 24, 0.6]];

export class MicDetector {
  constructor() {
    this.stream = null;
    this.analyser = null;
    this.sensitivity = 0.5;
    this.level = 0;
    this.floor = 1e-6;
    this.a4 = 440;
  }

  static supported() { return typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); }

  async start(ctx) {
    if (!MicDetector.supported()) throw new Error('Mikrofon wird von diesem Browser nicht unterstützt.');
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    this.ctx = ctx;
    this.src = ctx.createMediaStreamSource(this.stream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = ctx.sampleRate > 50000 ? 32768 : 16384;
    this.analyser.smoothingTimeConstant = 0;
    this.analyser.minDecibels = -110;
    this.analyser.maxDecibels = -10;
    this.src.connect(this.analyser);
    this.db = new Float32Array(this.analyser.frequencyBinCount);
    this.lin = new Float32Array(this.analyser.frequencyBinCount);
    this.td = new Float32Array(2048);
    this.binHz = ctx.sampleRate / this.analyser.fftSize;
    this.cache = new Map();
  }

  stop() {
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    try { this.src && this.src.disconnect(); } catch { /* ignore */ }
    this.stream = null; this.analyser = null;
  }

  get active() { return !!this.analyser; }

  update() {
    if (!this.analyser) return;
    this.analyser.getFloatFrequencyData(this.db);
    const lin = this.lin, db = this.db;
    const b0 = Math.floor(55 / this.binHz), b1 = Math.min(lin.length - 1, Math.floor(5000 / this.binHz));
    let gmax = 0;
    for (let i = 0; i < lin.length; i++) {
      const v = Math.pow(10, db[i] / 20);
      lin[i] = v;
      if (i >= b0 && i <= b1 && v > gmax) gmax = v;
    }
    this.gmax = gmax + 1e-12;
    // robust noise floor = median of the spectrum (peaks of played notes do not raise it)
    const step = Math.max(1, Math.floor((b1 - b0) / 400));
    const sample = [];
    for (let i = b0; i <= b1; i += step) sample.push(lin[i]);
    sample.sort((a, b) => a - b);
    this.floor = sample[Math.floor(sample.length * 0.5)] + 1e-12;
    this.analyser.getFloatTimeDomainData(this.td);
    let s = 0;
    for (let i = 0; i < this.td.length; i++) s += this.td[i] * this.td[i];
    const rms = Math.sqrt(s / this.td.length);
    this.level = this.level * 0.7 + Math.min(1, rms * 6) * 0.3;
    this.cache.clear();
    this.frame = (this.frame || 0) + 1;
  }

  // like isSounding, but the pitch must be detected in two consecutive analysis frames
  confirmed(p, expected = null) {
    if (!this.streak) { this.streak = new Map(); }
    const ok = this.isSounding(p, expected);
    const prev = this.streak.get(p);
    if (!ok) { this.streak.delete(p); return false; }
    const n = prev && prev.f === this.frame - 1 ? prev.n + 1 : (prev && prev.f === this.frame ? prev.n : 1);
    this.streak.set(p, { f: this.frame, n });
    return n >= 2;
  }

  peak(f) {
    const lin = this.lin;
    const b = f / this.binHz;
    const w = Math.max(1, Math.round(b * 0.01));
    let m = 0;
    for (let i = Math.floor(b) - w; i <= Math.ceil(b) + w; i++) if (i > 0 && i < lin.length && lin[i] > m) m = lin[i];
    return m;
  }

  // harmonic amplitudes h[0..5] of pitch p
  harmonics(p) {
    const key = 'h' + p;
    if (this.cache.has(key)) return this.cache.get(key);
    const f0 = midiFreq(p, this.a4);
    const h = [];
    for (let k = 1; k <= 6; k++) h.push(f0 * k < 5200 ? this.peak(f0 * k) : 0);
    this.cache.set(key, h);
    return h;
  }

  salience(p) {
    const h = this.harmonics(p);
    const W = [1, 0.95, 0.75, 0.55, 0.4, 0.3];
    let s = 0, ws = 0;
    for (let k = 0; k < 6; k++) { if (h[k] || k === 0) { s += W[k] * h[k]; ws += W[k]; } }
    return ws ? s / ws : 0;
  }

  threshold() {
    const sens = this.sensitivity;
    return Math.max(this.floor * (10 - 6 * sens), this.gmax * (0.05 - 0.035 * sens));
  }

  // expected: Set of pitches the player is supposed to play right now (allows octave doublings)
  isSounding(p, expected = null) {
    if (!this.analyser || this.level < 0.006) return false;
    const thr = this.threshold();
    const h = this.harmonics(p);
    const low = p < 48;
    const fundOk = h[0] > thr;
    if (!(fundOk || (low && h[0] > thr * 0.35 && h[1] > thr && h[2] > thr))) return false;
    // need a harmonic pattern, not a single stray peak (high notes may be almost pure)
    let present = 0;
    for (let k = 0; k < 4; k++) if (h[k] > thr * 0.7) present++;
    if (present < (p >= 79 ? 1 : 2)) return false;
    // overtone shadow: this "fundamental" is only the 2nd/3rd/4th harmonic of a lower sounding note
    for (const [k, d, ratio] of SHADOWS) {
      const q = p - d;
      if (expected && expected.has(q)) continue;
      const lo = this.harmonics(q);
      if (lo[0] > thr && h[0] < ratio * lo[0] && h[0] <= lo[k - 1] * 1.05) return false;
    }
    const s = this.salience(p);
    const nb = Math.max(this.salience(p - 1), this.salience(p + 1));
    return s > nb * 1.3;
  }
}

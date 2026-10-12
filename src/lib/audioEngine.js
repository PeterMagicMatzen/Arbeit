// Web-Audio synthesiser: church organ (with 16' pedal) or keyboard tone, plus hall reverb.
import { midiFreq } from './music';

function harmonicWave(ctx, amps) {
  const real = new Float32Array(amps.length + 1);
  const imag = new Float32Array(amps.length + 1);
  amps.forEach((a, i) => { imag[i + 1] = a; });
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}

function makeImpulse(ctx, seconds, decay) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (i < rate * 0.012 ? i / (rate * 0.012) : 1);
    }
  }
  return buf;
}

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.kind = 'organ';
    this.voices = new Set();
    this.held = new Map();
    this.levels = { acc: 0.8, own: 0.85, reverb: 0.5 };
  }

  ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC({ latencyHint: 'interactive' });
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.25;
    this.out.connect(comp).connect(ctx.destination);
    this.bus = ctx.createGain();
    this.dry = ctx.createGain();
    this.wet = ctx.createGain();
    this.conv = ctx.createConvolver();
    this.bus.connect(this.dry).connect(this.out);
    this.bus.connect(this.conv).connect(this.wet).connect(this.out);
    this.waves = {
      organ: harmonicWave(ctx, [1, 0.62, 0.16, 0.42, 0.07, 0.14, 0.03, 0.2, 0.02, 0.05, 0.01, 0.07, 0, 0, 0, 0.04]),
      pedal: harmonicWave(ctx, [1, 0.85, 0.22, 0.38, 0.06, 0.1, 0.02, 0.08]),
      keys: harmonicWave(ctx, [1, 0.55, 0.42, 0.26, 0.2, 0.12, 0.09, 0.06, 0.05, 0.035, 0.025, 0.02]),
    };
    this.setInstrument(this.kind);
    return ctx;
  }

  async resume() {
    this.ensure();
    if (this.ctx.state !== 'running') await this.ctx.resume();
  }

  get now() { return this.ctx ? this.ctx.currentTime : 0; }

  setInstrument(instrument) {
    this.kind = /orgel/i.test(instrument || '') || instrument === 'organ' ? 'organ' : 'keys';
    if (!this.ctx) return;
    this.conv.buffer = this.kind === 'organ' ? makeImpulse(this.ctx, 3.4, 2.6) : makeImpulse(this.ctx, 1.6, 3.2);
    this.applyLevels();
  }

  setLevels(l) { this.levels = { ...this.levels, ...l }; this.applyLevels(); }

  applyLevels() {
    if (!this.ctx) return;
    const r = this.levels.reverb;
    const base = this.kind === 'organ' ? 0.55 : 0.32;
    this.wet.gain.value = base * r * 1.6;
    this.dry.gain.value = 1 - 0.35 * r;
  }

  // schedule one note. when = AudioContext time, dur = seconds
  note(p, when, dur, { part = 'acc', hand = 'rh', vel = 1 } = {}) {
    const ctx = this.ensure();
    const t0 = Math.max(when, ctx.currentTime + 0.002);
    const lvl = (part === 'own' ? this.levels.own : this.levels.acc) * vel;
    if (lvl <= 0.001) return null;
    const f = midiFreq(p);
    const g = ctx.createGain();
    g.gain.value = 0;
    const oscs = [];
    const organ = this.kind === 'organ';
    const tilt = Math.pow(2, -(p - 60) / 48); // higher notes a bit softer
    let v;
    if (organ) {
      v = 0.075 * lvl * tilt;
      const o = ctx.createOscillator();
      o.setPeriodicWave(hand === 'ped' ? this.waves.pedal : this.waves.organ);
      o.frequency.value = f;
      o.detune.value = (Math.random() - 0.5) * 4;
      o.connect(g); oscs.push(o);
      if (hand === 'ped') {
        const sub = ctx.createOscillator();
        const sg = ctx.createGain(); sg.gain.value = 0.7;
        sub.setPeriodicWave(this.waves.pedal); sub.frequency.value = f / 2;
        sub.connect(sg).connect(g); oscs.push(sub);
        v *= 1.15;
      }
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(v, t0 + 0.014);
      const t1 = t0 + Math.max(0.05, dur);
      g.gain.setValueAtTime(v, t1);
      g.gain.setTargetAtTime(0, t1, 0.03);
      g.connect(this.bus);
      oscs.forEach((o) => { o.start(t0); o.stop(t1 + 0.3); });
      const voice = { g, oscs, start: t0, end: t1 + 0.3 };
      this.track(voice);
      return voice;
    }
    v = 0.11 * lvl * tilt;
    const o = ctx.createOscillator();
    o.setPeriodicWave(this.waves.keys);
    o.frequency.value = f;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 0.4;
    lp.frequency.setValueAtTime(Math.min(9000, f * 14), t0);
    lp.frequency.setTargetAtTime(Math.min(4000, f * 5), t0, 0.25);
    o.connect(lp).connect(g); oscs.push(o);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(v, t0 + 0.004);
    g.gain.setTargetAtTime(v * 0.28, t0 + 0.004, 0.32);
    const t1 = t0 + Math.max(0.06, dur);
    g.gain.setTargetAtTime(0, t1, 0.07);
    g.connect(this.bus);
    o.start(t0); o.stop(t1 + 0.5);
    const voice = { g, oscs, start: t0, end: t1 + 0.5 };
    this.track(voice);
    return voice;
  }

  track(voice) {
    this.voices.add(voice);
    voice.oscs[0].onended = () => { this.voices.delete(voice); try { voice.g.disconnect(); } catch { /* ignore */ } };
  }

  // stop everything (fade) – optionally only voices that have not started yet
  stopAll({ futureOnly = false } = {}) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const v of [...this.voices]) {
      if (futureOnly && v.start <= now + 0.005) continue;
      try {
        v.g.gain.cancelScheduledValues(now);
        v.g.gain.setTargetAtTime(0, now, 0.012);
        v.oscs.forEach((o) => o.stop(now + 0.08));
      } catch { /* already stopped */ }
      this.voices.delete(v);
    }
  }

  // live notes from on-screen keys / MIDI
  noteOn(p, hand = 'rh') {
    this.noteOff(p);
    const v = this.note(p, this.now, 30, { part: 'own', hand });
    if (v) this.held.set(p, v);
  }

  noteOff(p) {
    const v = this.held.get(p);
    if (!v || !this.ctx) return;
    this.held.delete(p);
    const now = this.ctx.currentTime;
    try {
      v.g.gain.cancelScheduledValues(now);
      v.g.gain.setTargetAtTime(0, now, this.kind === 'organ' ? 0.03 : 0.08);
      v.oscs.forEach((o) => o.stop(now + 0.5));
    } catch { /* ignore */ }
  }

  preview(p, seconds = 0.6, hand = 'rh') {
    this.note(p, this.now + 0.01, seconds, { part: 'own', hand });
  }

  chord(pitches, seconds = 1.4) {
    if (!pitches) return;
    pitches.forEach((p, i) => this.note(p, this.now + 0.01 + i * 0.035, seconds, { part: 'own', hand: i === 0 ? 'lh' : 'rh', vel: 0.8 }));
  }
}

export const engine = new AudioEngine();

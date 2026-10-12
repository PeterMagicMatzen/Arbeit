// Music clock + note scheduler. All times are "music seconds" = seconds of the original
// recording at 100 %. Real time runs (music time / tempo).
// When an original recording is attached, the recording IS the clock: the falling notes
// follow the audio (also while it buffers), the synthesizer stays silent.
import { lowerBound } from './music';

export class Transport {
  constructor(engine) {
    this.engine = engine;
    this.notes = [];
    this.tempo = 1;
    this.playing = false;
    this.frozen = false;
    this.hold = null;           // wait mode: clock may not pass this music time
    this.m0 = 0;                // music time at anchor
    this.c0 = 0;                // AudioContext time at anchor
    this.idx = 0;               // next note to schedule
    this.lookahead = 0.2;       // real seconds
    this.shouldPlay = () => true;
    this.partOf = () => 'acc';
    // recording playback
    this.audio = null;
    this.audioUrl = null;
    this.audioFactor = 1;
    this.useAudio = false;
    this.audioRunning = false;
    this.audioPending = false;
    this._aT = 0; this._aP = 0;
    this.onEnd = null;
    this.onAudioError = null;
  }

  setNotes(notes) { this.notes = notes; this.idx = lowerBound(notes, this.m0, (n) => n.s); }

  ctxNow() { return this.engine.ctx ? this.engine.ctx.currentTime : performance.now() / 1000; }

  get recordingActive() { return !!(this.useAudio && this.audio); }

  time() {
    if (!this.playing || this.frozen) return this.m0;
    const now = this.ctxNow();
    let t;
    if (this.useAudio && this.audioRunning && this.audio) {
      const a = this.audio;
      if (!a.paused && a.readyState >= 3) {
        const p = performance.now() / 1000;
        if (a.currentTime !== this._aT) { this._aT = a.currentTime; this._aP = p; }
        t = (this._aT + Math.min(0.25, (p - this._aP) * a.playbackRate)) * this.audioFactor;
      } else {
        t = this.m0;              // recording is buffering: the notes wait for it
      }
      this.m0 = t; this.c0 = now;
    } else {
      t = this.m0 + (now - this.c0) * this.tempo;
    }
    if (this.hold != null && t >= this.hold) {
      this.freezeAt(this.hold);
      return this.hold;
    }
    return t;
  }

  // ---- recording ----
  attachAudio(url, factor) {
    const f = factor || 1;
    if (url === this.audioUrl && f === this.audioFactor && this.audio) return;
    const t = this.time();
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      try { this.audio.load(); } catch { /* ignore */ }
    }
    this.audio = null; this.audioUrl = url || null; this.audioFactor = f;
    this.audioRunning = false; this.audioPending = false;
    this.m0 = t; this.c0 = this.ctxNow();
    if (!url) { this.useAudio = false; this.idx = lowerBound(this.notes, t + 1e-4, (n) => n.s); return; }
    const a = new Audio();
    a.preload = 'auto';
    a.src = url;
    a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true;
    a.addEventListener('error', () => {
      if (this.audio !== a) return;
      this.onAudioError && this.onAudioError(a.error);
    });
    this.audio = a;
    if (this.playing && this.useAudio) this._startAudio();
  }

  setUseAudio(on) {
    const t = this.time();
    if (this.audio) this.audio.pause();
    this.audioRunning = false; this.audioPending = false;
    this.engine.stopAll();
    this.useAudio = !!(on && this.audio);
    this.m0 = t; this.c0 = this.ctxNow();
    this.idx = lowerBound(this.notes, t + 1e-4, (n) => n.s);
    if (this.playing && this.useAudio) this._startAudio();
  }

  _startAudio() {
    const a = this.audio;
    if (!a || this.audioPending || this.audioRunning) return;
    this.audioPending = true;
    const go = () => {
      if (this.audio !== a || !this.playing || this.frozen || !this.useAudio) { this.audioPending = false; return; }
      const t = this.time();
      if (t < 0) { this.audioPending = false; return; }           // still in the count-in
      a.playbackRate = this.tempo / this.audioFactor;
      try { a.currentTime = t / this.audioFactor; } catch { /* ignore */ }
      const ok = () => {
        this.audioPending = false;
        if (this.audio !== a || !this.playing || this.frozen || !this.useAudio) { a.pause(); return; }
        this._aT = a.currentTime; this._aP = performance.now() / 1000;
        this.m0 = a.currentTime * this.audioFactor; this.c0 = this.ctxNow();
        this.audioRunning = true;
      };
      const pr = a.play();
      if (pr && pr.then) {
        pr.then(ok).catch((e) => { this.audioPending = false; if (this.audio === a && this.onAudioError) this.onAudioError(e); });
      } else ok();
    };
    if (a.readyState >= 1) go(); else a.addEventListener('loadedmetadata', go, { once: true });
  }

  // call inside a click/tap so mobile browsers allow the recording to start later
  unlockAudio() {
    const a = this.audio;
    if (!a || !a.paused || this.audioRunning || this.audioPending) return;
    try {
      a.muted = true;
      const pr = a.play();
      const done = () => { if (!this.audioRunning && !this.audioPending) a.pause(); a.muted = false; };
      if (pr && pr.then) pr.then(done).catch(() => { a.muted = false; }); else done();
    } catch { a.muted = false; }
  }

  // ---- transport ----
  play() {
    if (this.playing) return;
    this.engine.ensure();
    this.playing = true;
    this.frozen = false;
    this.c0 = this.ctxNow() + 0.06;
    this.idx = lowerBound(this.notes, this.m0 - 0.0001, (n) => n.s);
    this.audioRunning = false; this.audioPending = false;
    if (this.useAudio && this.audio) this._startAudio();
  }

  pause() {
    if (!this.playing) return;
    this.m0 = this.time();
    this.playing = false;
    this.frozen = false;
    if (this.audio) this.audio.pause();
    this.audioRunning = false; this.audioPending = false;
    this.engine.stopAll();
  }

  seek(m) {
    const was = this.playing;
    if (was) { this.playing = false; if (this.audio) this.audio.pause(); this.audioRunning = false; this.audioPending = false; }
    this.engine.stopAll();
    this.m0 = m;
    this.frozen = false;
    this.idx = lowerBound(this.notes, m - 0.0001, (n) => n.s);
    if (was) this.play();
  }

  setTempo(x) {
    const t = this.time();
    this.tempo = x;
    this.m0 = t;
    this.c0 = this.ctxNow();
    if (this.playing) {
      this.engine.stopAll({ futureOnly: true });
      this.idx = lowerBound(this.notes, t + 0.0001, (n) => n.s);
      if (this.audio) this.audio.playbackRate = x / this.audioFactor;
    }
  }

  freezeAt(m) {
    if (this.frozen) return;
    this.m0 = m;
    this.c0 = this.ctxNow();
    this.frozen = true;
    if (this.audio) this.audio.pause();
    this.audioRunning = false; this.audioPending = false;
  }

  setHold(h) {
    this.hold = h;
    if (this.frozen && (h == null || h > this.m0 + 1e-4)) {
      // release the freeze and continue from where we stopped
      this.frozen = false;
      this.c0 = this.ctxNow();
      if (this.useAudio && this.audio) this._startAudio();
    }
  }

  // called often (animation frame + timer)
  pump() {
    if (!this.playing) return;
    const t = this.time();
    if (this.useAudio && this.audio) {
      if (!this.audioRunning && !this.audioPending && !this.frozen && t >= 0) this._startAudio();
      if (this.audioRunning && this.audio.ended && this.onEnd) this.onEnd();
      return;
    }
    if (this.frozen) return;
    const horizon = t + this.lookahead * this.tempo;
    const limit = this.hold != null ? Math.min(horizon, this.hold + 0.0005) : horizon;
    const ns = this.notes;
    while (this.idx < ns.length && ns[this.idx].s < limit) {
      const n = ns[this.idx++];
      if (n.s < t - 0.06) continue;
      if (!this.shouldPlay(n)) continue;
      const when = this.c0 + (n.s - this.m0) / this.tempo;
      const dur = Math.max(0.04, (n.e - n.s) / this.tempo - 0.018);
      this.engine.note(n.p, when, dur, { part: this.partOf(n), hand: n.hand });
    }
  }
}

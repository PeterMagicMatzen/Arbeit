// Canvas renderer for the falling-notes area + keyboard (stage coordinates 1920 x 780).
import { COL, VOICE_COL, isBlack, lowerBound, neonHue, octaveLabel } from './music';

export const STAGE_W = 1920;
export const FALL_H = 600;           // falling area height (hit line at y = 600)
export const KEYS_H = 180;           // keyboard height
export const CANVAS_H = FALL_H + KEYS_H;
const FELT = 6;
const FONT = 'Inter, system-ui, -apple-system, Segoe UI, sans-serif';

function rr(ctx, x, y, w, h, r) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

export class StageRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ratio = 1;
    this.particles = [];
    this.rings = [];
    this.texts = [];
    this.flashes = new Map();   // pitch -> {until, color}
    this.lastT = performance.now();
    this.setRange(36, 84);
  }

  setRange(lo, hi) {
    this.lo = lo; this.hi = hi;
    const whites = [];
    for (let p = lo; p <= hi; p++) if (!isBlack(p)) whites.push(p);
    this.whites = whites;
    const WW = STAGE_W / whites.length;
    this.WW = WW; this.BW = WW * 0.58;
    this.KX = {};
    whites.forEach((p, i) => { this.KX[p] = [i * WW, WW]; });
    for (let p = lo; p <= hi; p++) {
      if (isBlack(p)) {
        const left = this.KX[p - 1][0] + WW;
        this.KX[p] = [left - this.BW / 2, this.BW];
      }
    }
    this.BH = (KEYS_H - FELT) * 0.62;
  }

  resize(ratio) {
    const r = Math.max(1, Math.min(2, ratio));
    const w = Math.round(STAGE_W * r), h = Math.round(CANVAS_H * r);
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.ratio = r;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  // ---------- hit testing ----------
  keyAt(x, y) {
    if (y < FALL_H || y > CANVAS_H) return null;
    const ky = y - FALL_H - FELT;
    if (ky <= this.BH) {
      for (let p = this.lo; p <= this.hi; p++) {
        if (!isBlack(p)) continue;
        const [bx, bw] = this.KX[p];
        if (x >= bx && x <= bx + bw) return p;
      }
    }
    for (const p of this.whites) {
      const [wx, ww] = this.KX[p];
      if (x >= wx && x < wx + ww) return p;
    }
    return null;
  }

  noteAt(x, y, st) {
    if (y >= FALL_H) return null;
    const { notes, t, pxm } = st;
    const look = FALL_H / pxm;
    let best = null;
    const i0 = lowerBound(notes, t - st.maxLen, (n) => n.s);
    for (let i = i0; i < notes.length && notes[i].s <= t + look; i++) {
      const n = notes[i];
      if (n.e < t || !st.visible(n)) continue;
      const [kx, kw] = this.KX[n.p] || [0, 0];
      const yb = FALL_H - (n.s - t) * pxm, yt = FALL_H - (n.e - t) * pxm;
      if (x >= kx && x <= kx + kw && y >= yt - 4 && y <= yb + 4) {
        if (!best || isBlack(n.p)) best = n;
      }
    }
    return best;
  }

  // ---------- effects ----------
  burst(n, rating) {
    const [kx, kw] = this.KX[n.p] || [0, 40];
    const cx = kx + kw / 2;
    const hue = n.hue;
    const count = rating === 'perfect' ? 22 : 14;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: cx + (Math.random() - 0.5) * kw, y: FALL_H - 4,
        vx: (Math.random() - 0.5) * 170, vy: -90 - Math.random() * 260,
        life: 0, max: 0.55 + Math.random() * 0.7, size: 1.4 + Math.random() * 2.6,
        hue: hue + (Math.random() - 0.5) * 50, star: Math.random() < 0.45,
      });
    }
    this.rings.push({ x: cx, y: FALL_H, w: kw, life: 0, max: 0.4, hue });
    const now = performance.now();
    if (!this.lastText || now - this.lastText > 170) {
      this.lastText = now;
      this.texts = this.texts.filter((t) => t.big || t.life < 0.35);
      this.texts.push({ x: cx, y: FALL_H - 46, text: rating === 'perfect' ? 'Perfekt!' : 'Gut!', life: 0, max: 0.8, hue, size: 22 });
    }
  }

  banner(text, hue = 150) {
    this.texts.push({ x: STAGE_W / 2, y: 150, text, life: 0, max: 1.4, hue, size: 52, big: true });
  }

  flash(p, color = '#FF4D6A', ms = 260) { this.flashes.set(p, { until: performance.now() + ms, color }); }

  clearEffects() { this.particles = []; this.rings = []; this.texts = []; this.flashes.clear(); }

  // ---------- main draw ----------
  draw(st) {
    const ctx = this.ctx;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastT) / 1000);
    this.lastT = now;
    ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    ctx.clearRect(0, 0, STAGE_W, CANVAS_H);
    ctx.fillStyle = '#0B0B10';
    ctx.fillRect(0, 0, STAGE_W, FALL_H);

    // guide lines (octave lines on C, faint ones on F) – like the video
    for (const p of this.whites) {
      const x0 = this.KX[p][0];
      if (p % 12 === 0) { ctx.fillStyle = '#2E2E3A'; ctx.fillRect(x0 - 1, 0, 2, FALL_H); }
      else if (p % 12 === 5) { ctx.fillStyle = '#1C1C25'; ctx.fillRect(x0 - 0.5, 0, 1, FALL_H); }
    }
    // loop range shading
    if (st.loop) {
      const ya = FALL_H - (st.loop.e - st.t) * st.pxm, yb = FALL_H - (st.loop.s - st.t) * st.pxm;
      if (yb > 0 && ya < FALL_H) {
        ctx.fillStyle = 'rgba(61,220,132,0.035)';
        ctx.fillRect(0, Math.max(0, ya), STAGE_W, Math.min(FALL_H, yb) - Math.max(0, ya));
        ctx.fillStyle = 'rgba(61,220,132,0.5)';
        if (ya > 0) ctx.fillRect(0, ya, STAGE_W, 2);
        if (yb < FALL_H) ctx.fillRect(0, yb - 2, STAGE_W, 2);
      }
    }

    const { notes, t, pxm } = st;
    const look = FALL_H / pxm;
    const i0 = lowerBound(notes, t - st.maxLen, (n) => n.s);
    const sounding = [];
    const hitNotes = [];
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, STAGE_W, FALL_H); ctx.clip();
    for (let i = i0; i < notes.length; i++) {
      const n = notes[i];
      if (n.s > t + look) break;
      if (n.e < t || !st.visible(n)) continue;
      const mine = st.isMine(n);
      if (n.s <= t) sounding.push(n);
      if (mine && n.state === 1) { hitNotes.push(n); continue; }
      this.drawNote(ctx, n, st, mine);
    }
    // neon pass for hit notes
    for (const n of hitNotes) this.drawNeonNote(ctx, n, st);
    ctx.restore();

    // hit line + glows
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(0, FALL_H - 2, STAGE_W, 2);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const n of sounding) {
      const [kx, kw] = this.KX[n.p] || [0, 0];
      const mine = st.isMine(n);
      if (mine && n.state === 1) {
        const g = ctx.createRadialGradient(kx + kw / 2, FALL_H, 2, kx + kw / 2, FALL_H, kw * 1.9);
        g.addColorStop(0, hsl(n.hue, 100, 70, 0.75));
        g.addColorStop(1, hsl(n.hue, 100, 50, 0));
        ctx.fillStyle = g;
        ctx.fillRect(kx - kw * 2, FALL_H - kw * 2, kw * 5, kw * 2.2);
      } else {
        const c = this.colourOf(n, st);
        const g = ctx.createLinearGradient(0, FALL_H - 16, 0, FALL_H + 4);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, c.base + (mine ? 'AA' : '66'));
        ctx.fillStyle = g;
        ctx.fillRect(kx + 2, FALL_H - 16, kw - 4, 20);
      }
    }
    ctx.restore();

    this.drawKeys(ctx, st, sounding, now);
    this.drawEffects(ctx, dt);
    if (st.waitingNotes && st.waitingNotes.length) this.drawWaiting(ctx, st.waitingNotes, now);
  }

  colourOf(n, st) {
    if (st.voiceColors && n.voice && VOICE_COL[n.voice]) return VOICE_COL[n.voice];
    return COL[n.hand] || COL.rh;
  }

  drawNote(ctx, n, st, mine) {
    const [kx0, kw0] = this.KX[n.p] || [0, 0];
    const blk = isBlack(n.p);
    const x = blk ? kx0 + 1.5 : kx0 + 4;
    const w = blk ? kw0 - 3 : kw0 - 8;
    const yb = FALL_H - (n.s - st.t) * st.pxm;
    const yt = FALL_H - (n.e - st.t) * st.pxm;
    const ybb = Math.min(yb, FALL_H + 8);
    const h = ybb - yt;
    if (h <= 0) return;
    const c = this.colourOf(n, st);
    const soundingNow = n.s <= st.t;
    const dim = st.anyMine && !mine ? 0.45 : 1;
    ctx.globalAlpha = dim;
    if (mine && n.state === 2) {
      ctx.fillStyle = 'rgba(80,80,98,0.75)';
      rr(ctx, x, yt, w, h, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,77,106,0.85)'; ctx.lineWidth = 2; ctx.stroke();
    } else {
      const g = ctx.createLinearGradient(0, yt, 0, ybb);
      g.addColorStop(0, blk ? c.dark : c.base);
      g.addColorStop(1, soundingNow ? c.light : (blk ? c.base : c.light));
      ctx.fillStyle = g;
      rr(ctx, x, yt, w, h, 7); ctx.fill();
      ctx.strokeStyle = soundingNow ? 'rgba(255,255,255,0.55)' : c.light + '8C';
      ctx.lineWidth = 1.5;
      rr(ctx, x + 0.5, yt + 0.5, w - 1, h - 1, 7); ctx.stroke();
    }
    if (st.showNames && h >= 14) this.drawLabel(ctx, n, x, w, yt, yb, ybb, blk, mine && n.state === 2 ? '#B9B9C6' : '#15151C');
    ctx.globalAlpha = 1;
  }

  drawLabel(ctx, n, x, w, yt, yb, ybb, blk, color) {
    const lab = n.nm;
    const size = blk || lab.length > 1 ? 17 : 22;
    ctx.font = `700 ${size}px ${FONT}`;
    const tw = ctx.measureText(lab).width;
    const pw = Math.min(w - 6, Math.max(28, tw + 14));
    const ph = blk ? 24 : 28;
    let py = Math.min(yb, FALL_H) - ph - 4;
    if (py < yt + 2 && ybb - yt < ph + 6) py = yt + (ybb - yt - ph) / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    rr(ctx, x + (w - pw) / 2, py, pw, ph, 6); ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(lab, x + w / 2, py + ph - (blk ? 6 : 7));
  }

  drawNeonNote(ctx, n, st) {
    const [kx0, kw0] = this.KX[n.p] || [0, 0];
    const blk = isBlack(n.p);
    const x = blk ? kx0 + 1.5 : kx0 + 4;
    const w = blk ? kw0 - 3 : kw0 - 8;
    const yb = FALL_H - (n.s - st.t) * st.pxm;
    const yt = FALL_H - (n.e - st.t) * st.pxm;
    const ybb = Math.min(yb, FALL_H + 8);
    const h = ybb - yt;
    if (h <= 0) return;
    const hue = n.hue;
    const age = (performance.now() - n.hitAt) / 1000;
    const pulse = Math.max(0, 1 - age / 0.45);
    ctx.save();
    ctx.shadowColor = hsl(hue, 100, 60, 1);
    ctx.shadowBlur = (18 + 22 * pulse) * this.ratio;
    const g = ctx.createLinearGradient(0, yt, 0, ybb);
    g.addColorStop(0, hsl(hue, 100, 50));
    g.addColorStop(1, hsl(hue, 100, 72 + 10 * pulse));
    ctx.fillStyle = g;
    rr(ctx, x, yt, w, h, 9); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'lighter';
    const core = ctx.createLinearGradient(x, 0, x + w, 0);
    core.addColorStop(0, 'rgba(255,255,255,0)');
    core.addColorStop(0.5, `rgba(255,255,255,${0.35 + 0.4 * pulse})`);
    core.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = core;
    rr(ctx, x + 2, yt + 2, w - 4, h - 4, 7); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = hsl(hue, 100, 88, 0.9); ctx.lineWidth = 1.5;
    rr(ctx, x + 0.5, yt + 0.5, w - 1, h - 1, 9); ctx.stroke();
    if (st.showNames && h >= 14) this.drawLabel(ctx, n, x, w, yt, yb, ybb, blk, hsl(hue, 90, 22));
  }

  drawKeys(ctx, st, sounding, now) {
    const y0 = FALL_H;
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, y0, STAGE_W, KEYS_H);
    const felt = ctx.createLinearGradient(0, y0, 0, y0 + FELT);
    felt.addColorStop(0, '#8A1425'); felt.addColorStop(1, '#4A0A14');
    ctx.fillStyle = felt; ctx.fillRect(0, y0, STAGE_W, FELT);
    const ky = y0 + FELT, kh = KEYS_H - FELT;

    // which keys are lit and how
    const lit = new Map();
    for (const n of sounding) {
      const mine = st.isMine(n);
      const prev = lit.get(n.p);
      const entry = mine && n.state === 1 ? { kind: 'neon', hue: n.hue, n } : { kind: mine ? 'guide' : 'acc', c: this.colourOf(n, st), n, mine };
      if (!prev || entry.kind === 'neon' || (prev.kind === 'acc' && entry.kind === 'guide')) lit.set(n.p, entry);
    }
    for (const [p, f] of this.flashes) { if (f.until < now) this.flashes.delete(p); }

    const keyFill = (p, black, top, bottom) => {
      const L = lit.get(p); const fl = this.flashes.get(p); const held = st.held && st.held.has(p);
      const g = ctx.createLinearGradient(0, top, 0, bottom);
      if (fl && (!L || L.kind !== 'neon')) { g.addColorStop(0, black ? '#C2334F' : '#FF9AAE'); g.addColorStop(1, fl.color); return { g, L, held, red: true }; }
      if (L && L.kind === 'neon') {
        g.addColorStop(0, hsl(L.hue, 100, black ? 62 : 82)); g.addColorStop(1, hsl(L.hue, 100, black ? 45 : 60));
      } else if (L) {
        const c = L.c;
        if (black) { g.addColorStop(0, c.base); g.addColorStop(1, c.dark); }
        else { g.addColorStop(0, c.light); g.addColorStop(1, c.base); }
      } else if (held) {
        if (black) { g.addColorStop(0, '#4A5070'); g.addColorStop(1, '#262A3C'); }
        else { g.addColorStop(0, '#E9ECFF'); g.addColorStop(1, '#C9CFF0'); }
      } else if (black) {
        g.addColorStop(0, '#3A3A40'); g.addColorStop(0.85, '#1A1A1E'); g.addColorStop(1, '#0A0A0C');
      } else {
        g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.8, '#F1F1F1'); g.addColorStop(1, '#D9D9DE');
      }
      return { g, L, held };
    };

    ctx.textAlign = 'center';
    for (const p of this.whites) {
      const [x, w] = this.KX[p];
      const { g, L } = keyFill(p, false, ky, ky + kh);
      if (L && L.kind === 'neon') { ctx.save(); ctx.shadowColor = hsl(L.hue, 100, 60); ctx.shadowBlur = 26 * this.ratio; }
      ctx.fillStyle = g; rr(ctx, x + 1, ky - 6, w - 2, kh + 5, 5); ctx.fill();
      if (L && L.kind === 'neon') ctx.restore();
      if (L && st.showNames) {
        ctx.font = `700 ${L.n.nm.length < 3 ? 21 : 17}px ${FONT}`;
        ctx.fillStyle = L.kind === 'neon' ? hsl(L.hue, 90, 18) : '#101015';
        ctx.fillText(L.n.nm, x + w / 2, ky + kh - 16);
      } else if (!L && p % 12 === 0) {
        ctx.font = `600 16px ${FONT}`; ctx.fillStyle = '#9A9AA5';
        ctx.fillText(octaveLabel(p), x + w / 2, ky + kh - 14);
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.33)'; ctx.fillRect(0, ky, STAGE_W, 3);
    for (let p = this.lo; p <= this.hi; p++) {
      if (!isBlack(p)) continue;
      const [x, w] = this.KX[p];
      const { g, L } = keyFill(p, true, ky, ky + this.BH);
      if (L && L.kind === 'neon') { ctx.save(); ctx.shadowColor = hsl(L.hue, 100, 60); ctx.shadowBlur = 22 * this.ratio; }
      ctx.fillStyle = g; rr(ctx, x, ky - 4, w, this.BH + 4, 4); ctx.fill();
      if (L && L.kind === 'neon') ctx.restore();
      if (!L) {
        ctx.fillStyle = 'rgba(255,255,255,0.19)'; rr(ctx, x + 3, ky + this.BH - 14, w - 6, 9, 3); ctx.fill();
      } else if (st.showNames) {
        ctx.font = `700 15px ${FONT}`; ctx.fillStyle = '#FFFFFF';
        ctx.fillText(L.n.nm, x + w / 2, ky + this.BH - 14);
      }
    }
  }

  drawWaiting(ctx, list, now) {
    const a = 0.55 + 0.45 * Math.sin(now / 160);
    for (const n of list) {
      const [x, w] = this.KX[n.p] || [0, 0];
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.lineWidth = 3;
      rr(ctx, x + 3, FALL_H - 34, w - 6, 30, 8); ctx.stroke();
    }
  }

  drawEffects(ctx, dt) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // rings
    this.rings = this.rings.filter((r) => (r.life += dt) < r.max);
    for (const r of this.rings) {
      const f = r.life / r.max;
      ctx.strokeStyle = hsl(r.hue, 100, 70, 1 - f);
      ctx.lineWidth = 3 * (1 - f) + 1;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.w * (0.5 + 1.3 * f), r.w * (0.18 + 0.45 * f), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // sparkles
    this.particles = this.particles.filter((p) => (p.life += dt) < p.max);
    for (const p of this.particles) {
      p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      const f = 1 - p.life / p.max;
      ctx.fillStyle = hsl(p.hue, 100, 72, f);
      if (p.star) {
        const s = p.size * 2.4;
        ctx.fillRect(p.x - s, p.y - 0.6, s * 2, 1.2);
        ctx.fillRect(p.x - 0.6, p.y - s, 1.2, s * 2);
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.6 + 0.4 * f), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // floating texts
    this.texts = this.texts.filter((t) => (t.life += dt) < t.max);
    ctx.textAlign = 'center';
    for (const t of this.texts) {
      const f = t.life / t.max;
      const y = t.y - (t.big ? 30 : 40) * f;
      ctx.globalAlpha = f < 0.15 ? f / 0.15 : 1 - Math.max(0, (f - 0.6) / 0.4);
      ctx.font = `800 ${t.size}px ${FONT}`;
      ctx.save();
      ctx.shadowColor = hsl(t.hue, 100, 55); ctx.shadowBlur = 16 * this.ratio;
      ctx.fillStyle = hsl(t.hue, 100, 82);
      ctx.fillText(t.text, t.x, y);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

export function assignHue(n, lo, hi) { n.hue = neonHue(n.p, lo, hi); }

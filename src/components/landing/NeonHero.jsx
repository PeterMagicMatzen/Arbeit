import React, { useEffect, useRef } from 'react';

// Animated neon "falling notes onto a keyboard" scene (inspired by the reference picture)
const BLACK = new Set([1, 3, 6, 8, 10]);
const LO = 36, HI = 96;

export default function NeonHero({ className = '', onKey }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, raf, last = performance.now();
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const whites = []; for (let p = LO; p <= HI; p++) if (!BLACK.has(p % 12)) whites.push(p);
    let KX = {}, kbTop = 0, WW = 0, BWd = 0;
    const layout = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const kbW = Math.min(W * 0.96, 1500);
      const x0 = (W - kbW) / 2;
      WW = kbW / whites.length; BWd = WW * 0.6;
      kbTop = H - Math.min(150, Math.max(90, W * 0.09));
      KX = {};
      whites.forEach((p, i) => { KX[p] = [x0 + i * WW, WW]; });
      for (let p = LO; p <= HI; p++) if (BLACK.has(p % 12)) KX[p] = [KX[p - 1][0] + WW - BWd / 2, BWd];
    };
    layout();
    const ro = new ResizeObserver(layout); ro.observe(cv);

    const notes = []; const sparks = []; const lit = new Map();
    let gen = 0, step = 0;
    const pattern = [0, 4, 7, 12, 16, 19, 24, 19, 16, 12, 7, 4];
    const roots = [48, 53, 55, 50, 57, 52];
    const speed = () => Math.max(150, H * 0.34);
    const hueOf = (p) => 150 + ((p - LO) / (HI - LO)) * 185;
    const spawn = () => {
      const root = roots[Math.floor(step / 24) % roots.length];
      const p = root + pattern[step % pattern.length] + (step % 48 >= 24 ? 12 : 0);
      if (p >= LO && p <= HI) {
        const len = 16 + Math.random() * 8;
        notes.push({ p, y: -len, len, hue: hueOf(p) });
        // second and third voice: a sixth below and an octave above for a fuller, rainbow-wide picture
        if (step % 2 === 0) { const q = p - 9; if (q >= LO) notes.push({ p: q, y: -len - 6, len, hue: hueOf(q) }); }
        if (step % 3 === 0) { const q = p + 12; if (q <= HI) notes.push({ p: q, y: -len - 12, len, hue: hueOf(q) }); }
        if (step % 8 === 0) { const q = root - 12; if (q >= LO) notes.push({ p: q, y: -len * 3, len: len * 3, hue: hueOf(q) }); }
      }
      step++;
    };
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      gen += dt; if (gen > 0.13) { gen = 0; spawn(); }
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#030306'); bg.addColorStop(1, '#07070C');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // faint guide lines
      ctx.fillStyle = 'rgba(255,255,255,0.035)';
      for (const p of whites) if (p % 12 === 0) ctx.fillRect(KX[p][0], 0, 1, kbTop);
      // notes
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.y += speed() * dt;
        const [x, w] = KX[n.p];
        const bottom = n.y + n.len;
        if (bottom >= kbTop && !n.hit) {
          n.hit = true; lit.set(n.p, { until: now + 260, hue: n.hue });
          for (let k = 0; k < 9; k++) sparks.push({ x: x + w / 2, y: kbTop - 2, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 200, life: 0, max: 0.5 + Math.random() * 0.7, hue: n.hue + (Math.random() - 0.5) * 40 });
          onKey && onKey(n.p);
        }
        if (n.y > kbTop) { notes.splice(i, 1); continue; }
        const h = Math.min(n.len, kbTop - n.y);
        ctx.shadowColor = `hsla(${n.hue},100%,60%,1)`; ctx.shadowBlur = 16;
        ctx.fillStyle = `hsla(${n.hue},100%,${BLACK.has(n.p % 12) ? 52 : 60}%,0.95)`;
        rr(x + w * 0.16, n.y, w * 0.68, h, Math.min(6, w * 0.3)); ctx.fill();
      }
      ctx.shadowBlur = 0;
      // glow at keyboard line
      for (const [p, l] of lit) {
        if (l.until < now) { lit.delete(p); continue; }
        const [x, w] = KX[p];
        const g = ctx.createRadialGradient(x + w / 2, kbTop, 1, x + w / 2, kbTop, w * 2.2);
        g.addColorStop(0, `hsla(${l.hue},100%,70%,0.8)`); g.addColorStop(1, `hsla(${l.hue},100%,50%,0)`);
        ctx.fillStyle = g; ctx.fillRect(x - w * 2, kbTop - w * 2.2, w * 5, w * 2.6);
      }
      // sparkles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life += dt; if (s.life > s.max) { sparks.splice(i, 1); continue; }
        s.vy += 240 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
        const f = 1 - s.life / s.max;
        ctx.fillStyle = `hsla(${s.hue},100%,75%,${f})`;
        ctx.fillRect(s.x - 2.5, s.y - 0.5, 5, 1); ctx.fillRect(s.x - 0.5, s.y - 2.5, 1, 5);
      }
      ctx.restore();
      // keyboard
      const kh = H - kbTop;
      for (const p of whites) {
        const [x, w] = KX[p]; const l = lit.get(p);
        const g = ctx.createLinearGradient(0, kbTop, 0, H);
        if (l) { g.addColorStop(0, `hsl(${l.hue},100%,82%)`); g.addColorStop(1, `hsl(${l.hue},100%,62%)`); }
        else { g.addColorStop(0, '#f4f4f6'); g.addColorStop(1, '#cfcfd6'); }
        ctx.fillStyle = g; rr(x + 0.8, kbTop, w - 1.6, kh, 3); ctx.fill();
      }
      for (let p = LO; p <= HI; p++) {
        if (!BLACK.has(p % 12)) continue;
        const [x, w] = KX[p]; const l = lit.get(p);
        const g = ctx.createLinearGradient(0, kbTop, 0, kbTop + kh * 0.62);
        if (l) { g.addColorStop(0, `hsl(${l.hue},100%,62%)`); g.addColorStop(1, `hsl(${l.hue},100%,40%)`); }
        else { g.addColorStop(0, '#2c2c33'); g.addColorStop(1, '#0b0b0e'); }
        ctx.fillStyle = g; rr(x, kbTop, w, kh * 0.62, 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, kbTop - 1, W, 1);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [onKey]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

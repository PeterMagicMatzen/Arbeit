import React, { useRef } from 'react';
import { Pause, Play, Settings2, Mic, MicOff, Piano, Hourglass, Repeat, Music, AudioWaveform } from 'lucide-react';
import { COL, GREEN } from '@/lib/music';
import { isRepeatPass, measureLabel, scoreMeasureCount } from '@/lib/songs';

const W = 1920;
const abs = (left, top, extra = {}) => ({ position: 'absolute', left, top, ...extra });
const btnReset = { pointerEvents: 'auto', background: 'none', border: 0, padding: 0, margin: 0, color: 'inherit', font: 'inherit', cursor: 'pointer', textAlign: 'inherit' };

export function Clickable({ style, onClick, title, children, className = '' }) {
  return (
    <button type="button" title={title} onClick={onClick} className={`cna-click ${className}`} style={{ ...btnReset, ...style }}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- header (0 – 96)
export function Header({ song, tempo, onTempoClick, onTitleClick, onSubtitleClick, timeText, totalText, playing, onPlayToggle, visible, onToggleVisible, subtitle }) {
  const pills = ['rh', 'lh'].concat(song.has_pedal ? ['ped'] : []);
  return (
    <div style={abs(0, 0, { width: W, height: 96, overflow: 'hidden', background: 'linear-gradient(90deg,#2B1150 0%,#5B2B93 36%,#7A3BB5 62%,#3D1A6E 100%)' })}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 260px 30px, rgba(176,92,255,.33), transparent 120px), radial-gradient(circle at 700px 80px, rgba(208,123,255,.25), transparent 160px), radial-gradient(circle at 1150px 20px, rgba(224,140,255,.31), transparent 130px), radial-gradient(circle at 1500px 70px, rgba(160,76,238,.25), transparent 170px), radial-gradient(circle at 1800px 20px, rgba(192,112,255,.31), transparent 110px)' }} />
      <Clickable onClick={onTempoClick} title="Variation wechseln (Originaltempo ↔ Übungstempo)" style={abs(40, 24, { width: 120, color: '#fff' })}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#E9DDFB', letterSpacing: 0.3 }}>TEMPO</div>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: '34px' }}>{Math.round(tempo * 100)} %</div>
      </Clickable>
      <Clickable onClick={onTitleClick} title="Anderes Lied wählen" style={abs(170, 14, { color: '#fff', fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap' })}>
        {song.title}, {song.catalog} <span style={{ fontSize: 18, opacity: 0.75, marginLeft: 6 }}>▾</span>
      </Clickable>
      <Clickable onClick={onSubtitleClick} title="Infos & Bedienung" style={abs(170, 58, { color: '#E2D4F7', fontSize: 17, fontWeight: 500, whiteSpace: 'nowrap' })}>
        {subtitle}
      </Clickable>
      <Clickable onClick={onPlayToggle} title={playing ? 'Pause (Leertaste)' : 'Abspielen (Leertaste)'} style={abs(W / 2 + 120 - 140, 24, { width: 280, height: 48, color: '#fff', fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, borderRadius: 24 })}>
        <span style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {playing ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{timeText}</span>
        <span style={{ opacity: 0.95 }}>|</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{totalText}</span>
      </Clickable>
      <div style={abs(0, 30, { right: 40, left: 'auto', display: 'flex', gap: 12 })}>
        {pills.map((k) => {
          const on = visible[k];
          return (
            <Clickable key={k} onClick={() => onToggleVisible(k)} title={on ? `${COL[k].short} ausblenden & stummschalten` : `${COL[k].short} einblenden`}
              style={{ height: 38, borderRadius: 19, padding: '0 20px 0 14px', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(42,20,80,.67)', border: `2px solid ${on ? COL[k].base : 'rgba(255,255,255,.25)'}`, color: '#fff', fontSize: 17, fontWeight: 700, opacity: on ? 1 : 0.55 }}>
              <span style={{ width: 16, height: 16, borderRadius: 8, background: on ? COL[k].base : 'transparent', border: `2px solid ${COL[k].base}` }} />
              <span style={{ textDecoration: on ? 'none' : 'line-through' }}>{COL[k].name}</span>
            </Clickable>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- info row (96 – 206)
function RoundButton({ cx, label, active, onClick, title, children, glow }) {
  return (
    <Clickable onClick={onClick} title={title} style={abs(cx - 75, 106, { width: 150, height: 98, display: 'flex', flexDirection: 'column', alignItems: 'center' })}>
      <span style={{ width: 60, height: 60, borderRadius: 30, border: `3px solid ${active ? '#fff' : '#5A5A6A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active && glow ? `0 0 16px ${glow}` : 'none', transition: 'all .2s' }}>
        {children}
      </span>
      <span style={{ marginTop: 10, fontSize: 15, fontWeight: 600, color: active ? '#DADAE6' : '#7A7A8C', whiteSpace: 'nowrap' }}>{label}</span>
    </Clickable>
  );
}

const HAND_MODE_LABEL = { both: 'ZWEIHÄNDIG', rh: 'RECHTE HAND', lh: 'LINKE HAND', none: 'ZUHÖREN' };

export function InfoRow({ song, showNames, onToggleNames, handMode, onCycleHands, pedMine, onTogglePed, voiceColors, onToggleVoices, tempo, onTempo, onTempoLabel, onTempoValue, info, onSectionClick, onMeasureClick, onSectionBar, chord, onChordClick, onNextChordClick }) {
  const sliderRef = useRef(null);
  const sx0 = 520, sx1 = 760;
  const kx = sx0 + (sx1 - sx0) * (tempo - 0.25) / 0.75;
  const dragTempo = (e) => {
    const el = sliderRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    onTempo(Math.round((0.25 + f * 0.75) * 20) / 20);
  };
  const onDown = (e) => {
    e.preventDefault(); dragTempo(e);
    const mv = (ev) => dragTempo(ev);
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };
  const lhOn = handMode === 'both' || handMode === 'lh';
  const rhOn = handMode === 'both' || handMode === 'rh';
  const voicesLabel = `${song.voice_count || 3} STIMMEN`;
  const sab = (song.voice_count || 3) >= 4 ? 'S·A·T·B' : 'S·A·B';
  return (
    <div style={abs(0, 96, { width: W, height: 110, background: '#101016', borderBottom: '1px solid #26262F' })}>
      <div style={{ position: 'absolute', left: 0, top: -96, width: W, height: 206, pointerEvents: 'none' }}>
        <RoundButton cx={70} label="NOTENNAMEN" active={showNames} onClick={onToggleNames} title="Notennamen ein-/ausblenden (N)">
          <span style={{ color: showNames ? '#fff' : '#7A7A8C', fontSize: 15, fontWeight: 700 }}>C·D·E</span>
        </RoundButton>
        <RoundButton cx={220} label={HAND_MODE_LABEL[handMode]} active={handMode !== 'none'} onClick={onCycleHands} title="Wer spielt? Zweihändig → rechte Hand → linke Hand → nur zuhören (H)">
          <span style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 14, height: 24, borderRadius: 6, background: COL.lh.base, opacity: lhOn ? 1 : 0.25 }} />
            <span style={{ width: 14, height: 24, borderRadius: 6, background: COL.rh.base, opacity: rhOn ? 1 : 0.25 }} />
          </span>
        </RoundButton>
        {song.third_button === 'voices' ? (
          <RoundButton cx={370} label={voicesLabel} active={voiceColors} onClick={onToggleVoices} title="Stimmen farbig unterscheiden (Sopran / Alt / Bass)" glow="rgba(245,184,61,.45)">
            <span style={{ color: voiceColors ? '#fff' : '#7A7A8C', fontSize: sab.length > 5 ? 12 : 15, fontWeight: 700 }}>{sab}</span>
          </RoundButton>
        ) : (
          <RoundButton cx={370} label={pedMine ? 'PEDAL: DU' : 'PEDAL'} active={pedMine} onClick={onTogglePed} title="Pedal selbst spielen (an) oder von der App spielen lassen (aus) (P)" glow="rgba(91,141,239,.6)">
            <span style={{ color: pedMine ? '#9DBBFF' : '#5F7BB8', fontSize: 17, fontWeight: 700 }}>Ped.</span>
          </RoundButton>
        )}
        {/* tempo slider */}
        <Clickable onClick={onTempoLabel} title="Tempo der gewählten Variation wiederherstellen" style={abs(590, 112, { width: 100, textAlign: 'center', fontSize: 16, fontWeight: 600, color: '#DADAE6' })}>TEMPO</Clickable>
        <div ref={sliderRef} onPointerDown={onDown} title="Tempo ziehen (25 – 100 %)" style={abs(sx0 - 10, 135, { width: sx1 - sx0 + 20, height: 30, cursor: 'pointer', touchAction: 'none', pointerEvents: 'auto' })}>
          <div style={abs(10, 14, { width: sx1 - sx0, height: 2, background: '#55556A' })} />
          <div style={abs(10, 13, { width: kx - sx0, height: 4, background: GREEN })} />
          <div style={abs(kx - sx0 + 1, 6, { width: 18, height: 18, borderRadius: 9, background: '#fff', boxShadow: '0 0 0 4px rgba(61,220,132,.18)' })} />
        </div>
        <Clickable onClick={onTempoValue} title="Zwischen 100 % und 60 % umschalten" style={abs(590, 164, { width: 100, textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#fff' })}>{Math.round(tempo * 100)} %</Clickable>
        <div style={abs(830, 112, { width: 2, height: 78, background: '#2C2C38' })} />
        <div style={abs(1390, 112, { width: 2, height: 78, background: '#2C2C38' })} />
        {/* section / measure */}
        <Clickable onClick={onSectionClick} title="Abschnitt wählen" style={abs(880, 114, { width: 300, color: '#9C9CB0', fontSize: 15, fontWeight: 600, letterSpacing: 0.5 })}>
          {info.part}&nbsp; · &nbsp;ABSCHNITT <span style={{ fontSize: 11 }}>▾</span>
        </Clickable>
        <Clickable onClick={onSectionClick} title="Abschnitt wählen" style={abs(880, 132, { width: 330, color: '#fff', fontSize: 34, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden' })}>{info.section}</Clickable>
        <Clickable onClick={onMeasureClick} title="Zu Takt springen / Takte in Schleife üben" style={abs(1190, 112, { width: 150, textAlign: 'right' })}>
          <div style={{ color: '#9C9CB0', fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap' }}>{isRepeatPass(song, info.measure) ? 'Wdh. · ' : ''}von {scoreMeasureCount(song)}</div>
          <div style={{ color: GREEN, fontSize: 30, fontWeight: 800, lineHeight: '40px', whiteSpace: 'nowrap' }}>{info.measure ? `Takt ${measureLabel(song, info.measure)}` : '–'}</div>
        </Clickable>
        <div onClick={onSectionBar} title="Im Abschnitt springen" style={abs(880, 176, { width: 460, height: 16, cursor: 'pointer', pointerEvents: 'auto' })}>
          <div style={abs(0, 6, { width: 460, height: 4, background: '#2C2C38' })} />
          <div style={abs(0, 6, { width: 460 * info.sectionFrac, height: 4, background: GREEN })} />
          {info.loop && <div style={abs(460 * info.loop[0], 2, { width: Math.max(4, 460 * (info.loop[1] - info.loop[0])), height: 12, border: `1px solid ${GREEN}`, borderRadius: 3 })} />}
        </div>
        {/* chord */}
        <Clickable onClick={onChordClick} title="Akkord anhören" style={abs(1430, 116, { color: '#fff', fontSize: 22, fontWeight: 500, lineHeight: '28px', whiteSpace: 'nowrap' })}>
          Momentan<br />gespielter Akkord:
        </Clickable>
        <Clickable onClick={onChordClick} title="Akkord anhören" style={abs(1716 - 48, 151 - 48, { width: 96, height: 96, borderRadius: 48 })}>
          <span style={{ position: 'absolute', left: 4, top: 4, width: 88, height: 88, borderRadius: 44, border: `4px solid ${GREEN}`, background: '#101016', boxShadow: chord.pulse ? '0 0 22px rgba(61,220,132,.55)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: chord.name ? '#fff' : '#777788', fontWeight: 700, fontSize: !chord.name ? 32 : chord.name.length <= 2 ? 34 : chord.name.length === 3 ? 28 : 24, transition: 'box-shadow .25s' }}>
            {chord.name || '–'}
          </span>
          <span style={{ position: 'absolute', left: 1, top: 1, width: 30, height: 30, borderRadius: 15, border: `3px solid ${GREEN}`, background: '#101016', color: GREEN, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♪</span>
        </Clickable>
        <Clickable onClick={onNextChordClick} title="Zum nächsten Akkord springen" style={abs(1790, 124, { width: 100 })}>
          <div style={{ color: '#8A8AA0', fontSize: 16, fontWeight: 500 }}>danach</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: '#B8B8C8', fontSize: 26, fontWeight: 700 }}>{chord.next || ''}</span>
            <span style={{ color: '#6E6E82', fontSize: 15, fontWeight: 500 }}>{chord.next ? chord.inText : ''}</span>
          </div>
        </Clickable>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- bottom bar (986 – 1080)
export function BottomBar({ frac, timeText, totalText, sections, duration, currentSection, onSeekFrac, onSection, onTimeLeft, onTimeRight, loopFrac }) {
  const barRef = useRef(null);
  const PX0 = 120, PX1 = W - 120;
  const seekFrom = (e) => {
    const r = barRef.current.getBoundingClientRect();
    onSeekFrac(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
  };
  const down = (e) => {
    e.preventDefault(); seekFrom(e);
    const mv = (ev) => seekFrom(ev);
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };
  const x = PX0 + (PX1 - PX0) * frac;
  return (
    <div style={abs(0, 986, { width: W, height: 94, background: '#0E0E14' })}>
      <Clickable onClick={onTimeLeft} title="Zurück zum Anfang des Abschnitts" style={abs(40, 18, { color: '#fff', fontSize: 19, fontWeight: 600, fontVariantNumeric: 'tabular-nums' })}>{timeText}</Clickable>
      <Clickable onClick={onTimeRight} title="Gesamtzeit / Restzeit umschalten" style={abs(W - 160, 18, { width: 120, textAlign: 'right', color: '#fff', fontSize: 19, fontWeight: 600, fontVariantNumeric: 'tabular-nums' })}>{totalText}</Clickable>
      <div ref={barRef} onPointerDown={down} title="Spulen" style={abs(PX0, 8, { width: PX1 - PX0, height: 34, cursor: 'pointer', touchAction: 'none' })}>
        <div style={abs(0, 22.5, { width: PX1 - PX0, height: 3, background: '#4A4A58' })} />
        {loopFrac && <div style={abs((PX1 - PX0) * loopFrac[0], 18, { width: Math.max(3, (PX1 - PX0) * (loopFrac[1] - loopFrac[0])), height: 12, background: 'rgba(61,220,132,.22)', border: `1px solid ${GREEN}`, borderRadius: 3 })} />}
        <div style={abs(0, 22, { width: x - PX0, height: 4, background: GREEN })} />
        <div style={abs(x - PX0 - 9, 15, { width: 18, height: 18, borderRadius: 9, background: '#fff' })} />
        <div style={abs(x - PX0 - 1, 6, { width: 2, height: 12, background: '#fff' })} />
        <div style={abs(x - PX0 - 6, -3, { width: 12, height: 12, borderRadius: 6, background: '#fff' })} />
      </div>
      {sections.map((s, i) => {
        const xa = PX0 + (PX1 - PX0) * (s.s / duration);
        const xb = PX0 + (PX1 - PX0) * (Math.min(s.e, duration) / duration);
        const cur = i === currentSection;
        const wdt = xb - xa;
        const size = Math.max(12, Math.min(20, (wdt - 14) / (s.label.length * 0.56)));
        return (
          <React.Fragment key={i}>
            <div style={abs(xa - 1, 54, { width: 2, height: 28, background: '#4A4A58' })} />
            <Clickable onClick={() => onSection(i)} title={`Zu „${s.label}" springen (Takt ${s.scoreMeasure ?? s.measure})`} style={abs(xa + 2, 50, { width: wdt - 4, height: 36, textAlign: 'center', color: cur ? GREEN : '#E6E6EE', fontWeight: cur ? 700 : 500, fontSize: size, whiteSpace: 'nowrap', overflow: 'hidden' })}>
              {s.label}
            </Clickable>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- HUD inside the falling area
const chip = (active, color = GREEN) => ({
  height: 34, borderRadius: 17, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8,
  background: active ? 'rgba(16,16,22,.88)' : 'rgba(16,16,22,.62)', border: `1.5px solid ${active ? color : '#34343F'}`,
  color: active ? '#fff' : '#A8A8B8', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', backdropFilter: 'blur(4px)',
});

export function Hud({ midiOn, midiDevices, onMidi, micOn, micLevel, onMic, waitMode, onWait, loopOn, onLoop, onSettings, stats, onStats, soundAvailable, soundOn, onSound }) {
  const acc = stats.hits + stats.misses ? Math.round((100 * stats.hits) / (stats.hits + stats.misses)) : null;
  return (
    <>
      <div style={abs(14, 216, { display: 'flex', gap: 8, zIndex: 5 })}>
        <Clickable onClick={onMidi} title="MIDI-Keyboard (USB/MIDI-Kabel) verwenden" style={chip(midiOn, '#5B8DEF')}>
          <Piano size={17} />
          {midiOn ? (midiDevices.length ? `MIDI: ${midiDevices[0]}${midiDevices.length > 1 ? ` +${midiDevices.length - 1}` : ''}` : 'MIDI: kein Gerät') : 'MIDI'}
        </Clickable>
        <Clickable onClick={onMic} title="Die App hört über das Mikrofon zu" style={chip(micOn, '#F2709C')}>
          {micOn ? <Mic size={17} /> : <MicOff size={17} />}
          {micOn ? 'Zuhören an' : 'Zuhören'}
          {micOn && (
            <span style={{ width: 46, height: 6, borderRadius: 3, background: '#2A2A34', overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${Math.min(100, micLevel * 140)}%`, background: 'linear-gradient(90deg,#35D07F,#36C8F0,#B47CFF,#F2709C)' }} />
            </span>
          )}
        </Clickable>
        <Clickable onClick={onWait} title="Warte-Modus: die Noten warten, bis du richtig spielst (W)" style={chip(waitMode, '#F5B83D')}>
          <Hourglass size={16} /> Warten
        </Clickable>
        <Clickable onClick={onLoop} title="Schleife ein/aus (L)" style={chip(loopOn)}>
          <Repeat size={16} /> Schleife
        </Clickable>
        <Clickable onClick={onSound} title={soundAvailable ? 'Original-Aufnahme / Synthesizer umschalten' : 'Noch keine Aufnahme hochgeladen'} style={chip(soundOn, '#B47CFF')}>
          {soundOn ? <AudioWaveform size={17} /> : <Music size={16} />} {soundOn ? 'Aufnahme' : 'Synthesizer'}
        </Clickable>
        <Clickable onClick={onSettings} title="Einstellungen" style={chip(false)}>
          <Settings2 size={17} />
        </Clickable>
      </div>
      <Clickable onClick={onStats} title="Statistik" style={abs(0, 216, { right: 14, left: 'auto', zIndex: 5, ...chip(stats.hits > 0, '#36C8F0'), fontVariantNumeric: 'tabular-nums' })}>
        <span>Treffer <b style={{ color: '#fff' }}>{stats.hits}</b>{stats.hits + stats.misses ? <span style={{ color: '#7A7A8C' }}> / {stats.hits + stats.misses}</span> : null}</span>
        {acc != null && <span style={{ color: acc >= 85 ? GREEN : acc >= 60 ? '#F5B83D' : '#FF6B85' }}>{acc} %</span>}
        <span>Combo <b style={{ background: 'linear-gradient(90deg,#35D07F,#36C8F0,#B47CFF,#F2709C)', WebkitBackgroundClip: 'text', color: 'transparent' }}>{stats.combo}</b></span>
      </Clickable>
    </>
  );
}

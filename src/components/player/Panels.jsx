import React, { useState } from 'react';
import { X, Piano, Mic, MousePointerClick, Play, Headphones, Star, RotateCcw, Home, Repeat, LogIn, Check } from 'lucide-react';
import { COL, GREEN, VOICE_COL } from '@/lib/music';
import { Clickable } from './StageParts';

const card = {
  background: 'rgba(21,21,30,.97)', border: '1.5px solid #3A3A4A', borderRadius: 20,
  boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03) inset', color: '#fff',
};

export function Backdrop({ onClose, dim = false }) {
  return <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 40, background: dim ? 'rgba(5,5,8,.55)' : 'transparent' }} />;
}

function PanelHead({ title, onClose }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{title}</div>
      <Clickable onClick={onClose} title="Schließen" style={{ width: 36, height: 36, borderRadius: 18, background: '#24242F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></Clickable>
    </div>
  );
}

const rowBtn = (active) => ({
  width: '100%', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: active ? 'rgba(61,220,132,.14)' : '#1C1C26', border: `1.5px solid ${active ? GREEN : '#2C2C38'}`, fontSize: 18, fontWeight: 600, marginBottom: 8,
});

export function SectionMenu({ sections, current, onPick, onClose }) {
  return (
    <>
      <Backdrop onClose={onClose} />
      <div style={{ ...card, position: 'absolute', left: 870, top: 200, width: 470, padding: 20, zIndex: 41 }}>
        <PanelHead title="Abschnitt wählen" onClose={onClose} />
        {sections.map((s, i) => (
          <Clickable key={i} onClick={() => onPick(i)} style={rowBtn(i === current)}>
            <span>{s.label}</span>
            <span style={{ color: '#9C9CB0', fontSize: 15 }}>ab Takt {s.measure}</span>
          </Clickable>
        ))}
      </div>
    </>
  );
}

function NumField({ value, onChange, min, max }) {
  return (
    <input type="number" min={min} max={max} value={value}
      onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
      onKeyDown={(e) => e.stopPropagation()}
      style={{ width: 90, height: 44, borderRadius: 10, background: '#0F0F16', border: '1.5px solid #3A3A4A', color: '#fff', fontSize: 20, fontWeight: 700, textAlign: 'center' }} />
  );
}

export function MeasurePanel({ song, current, loop, sectionRange, onGo, onLoop, onClose }) {
  const [m, setM] = useState(current || 1);
  const [a, setA] = useState(loop.a);
  const [b, setB] = useState(loop.b);
  const max = song.measure_count;
  return (
    <>
      <Backdrop onClose={onClose} />
      <div style={{ ...card, position: 'absolute', left: 980, top: 200, width: 440, padding: 22, zIndex: 41 }}>
        <PanelHead title="Takte" onClose={onClose} />
        <div style={{ color: '#9C9CB0', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>ZU TAKT SPRINGEN</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 22 }}>
          <NumField value={m} onChange={setM} min={1} max={max} />
          <span style={{ color: '#9C9CB0' }}>von {max}</span>
          <Clickable onClick={() => onGo(m)} style={{ marginLeft: 'auto', height: 44, padding: '0 20px', borderRadius: 12, background: GREEN, color: '#08130D', fontWeight: 800, fontSize: 17 }}>Springen</Clickable>
        </div>
        <div style={{ color: '#9C9CB0', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>SCHLEIFE ÜBEN</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <span>Takt</span><NumField value={a} onChange={setA} min={1} max={max} />
          <span>bis</span><NumField value={b} onChange={setB} min={1} max={max} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Clickable onClick={() => onLoop({ on: true, a: Math.min(a, b), b: Math.max(a, b) })} style={{ flex: 1, height: 44, borderRadius: 12, background: GREEN, color: '#08130D', fontWeight: 800, fontSize: 16, textAlign: 'center' }}>
            <Repeat size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />Schleife starten
          </Clickable>
          <Clickable onClick={() => { setA(sectionRange[0]); setB(sectionRange[1]); }} style={{ height: 44, padding: '0 14px', borderRadius: 12, background: '#24242F', fontWeight: 700, fontSize: 15 }}>Ganzer Abschnitt</Clickable>
          {loop.on && <Clickable onClick={() => onLoop({ ...loop, on: false })} style={{ height: 44, padding: '0 14px', borderRadius: 12, background: '#3A1E27', color: '#FF8DA1', fontWeight: 700, fontSize: 15 }}>Aus</Clickable>}
        </div>
      </div>
    </>
  );
}

export function SongMenu({ songs, currentSlug, onPick, onHome, onClose }) {
  return (
    <>
      <Backdrop onClose={onClose} />
      <div style={{ ...card, position: 'absolute', left: 160, top: 92, width: 560, padding: 20, zIndex: 41 }}>
        <PanelHead title="Lied wählen" onClose={onClose} />
        {songs.map((s) => (
          <Clickable key={s.slug} onClick={() => onPick(s.slug)} style={rowBtn(s.slug === currentSlug)}>
            <span>{s.title}, {s.catalog}</span>
            <span style={{ color: '#9C9CB0', fontSize: 15 }}>{s.composer?.split(' ').slice(-1)[0]}</span>
          </Clickable>
        ))}
        <Clickable onClick={onHome} style={{ ...rowBtn(false), justifyContent: 'center', gap: 8, marginBottom: 0 }}><Home size={18} /> Zur Startseite</Clickable>
      </div>
    </>
  );
}

const KEYS_HELP = [
  ['Leertaste', 'Abspielen / Pause'], ['← / →', 'Einen Takt zurück / vor'], ['↑ / ↓', 'Tempo ± 5 %'],
  ['N', 'Notennamen'], ['H', 'Hände wechseln'], ['P', 'Pedal'], ['W', 'Warte-Modus'], ['L', 'Schleife'], ['M', 'Mikrofon'], ['Pos1', 'Von vorne'],
];

export function InfoPanel({ song, onClose }) {
  return (
    <>
      <Backdrop onClose={onClose} dim />
      <div style={{ ...card, position: 'absolute', left: 460, top: 160, width: 1000, padding: 30, zIndex: 41 }}>
        <PanelHead title={`${song.title}, ${song.catalog}`} onClose={onClose} />
        <div style={{ color: '#CFCFDC', fontSize: 18, lineHeight: 1.5, marginBottom: 18 }}>
          {song.composer} · {song.subtitle} · {song.key_name} · {song.instrument} · {song.measure_count} Takte<br />{song.description}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ fontSize: 17, lineHeight: 1.55, color: '#DADAE6' }}>
            <b style={{ color: '#fff' }}>So funktioniert's</b><br />
            Die Noten fallen auf die Tasten – spiel sie, wenn sie die Linie erreichen. Verbinde dein Keyboard per <b>MIDI-Kabel/USB</b> oder lass die App über das <b>Mikrofon zuhören</b>. Jede getroffene Note leuchtet neon auf, die Taste glüht in Regenbogenfarben.
            <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
              {['rh', 'lh'].concat(song.has_pedal ? ['ped'] : []).map((k) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 18, height: 18, borderRadius: 5, background: COL[k].base }} />{COL[k].short}</span>
              ))}
              {song.voice_count > 0 && Object.entries(VOICE_COL).slice(0, song.voice_count >= 4 ? 4 : 3).map(([k, v]) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8 }}><span style={{ width: 18, height: 18, borderRadius: 9, background: v.base }} />{v.name}</span>
              ))}
            </div>
          </div>
          <div>
            <b style={{ fontSize: 17 }}>Tastenkürzel</b>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', marginTop: 8, fontSize: 16 }}>
              {KEYS_HELP.map(([k, v]) => (
                <React.Fragment key={k}><span style={{ background: '#24242F', borderRadius: 6, padding: '1px 8px', fontWeight: 700, textAlign: 'center' }}>{k}</span><span style={{ color: '#CFCFDC' }}>{v}</span></React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function StatsPanel({ stats, onReset, onClose }) {
  const judged = stats.hits + stats.misses;
  const rows = [
    ['Getroffen', stats.hits, GREEN], ['davon perfekt', stats.perfect, '#36C8F0'], ['Verpasst', stats.misses, '#FF6B85'],
    ['Falsche Töne', stats.wrong, '#F5B83D'], ['Längste Combo', stats.best, '#B47CFF'],
    ['Trefferquote', judged ? `${Math.round((100 * stats.hits) / judged)} %` : '–', '#fff'],
  ];
  return (
    <>
      <Backdrop onClose={onClose} />
      <div style={{ ...card, position: 'absolute', left: 1480, top: 262, width: 420, padding: 22, zIndex: 41 }}>
        <PanelHead title="Statistik" onClose={onClose} />
        {rows.map(([k, v, c]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 2px', borderBottom: '1px solid #26262F', fontSize: 18 }}>
            <span style={{ color: '#CFCFDC' }}>{k}</span><b style={{ color: c }}>{v}</b>
          </div>
        ))}
        <Clickable onClick={onReset} style={{ marginTop: 16, width: '100%', height: 44, borderRadius: 12, background: '#24242F', fontWeight: 700, textAlign: 'center' }}>
          <RotateCcw size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />Zurücksetzen
        </Clickable>
      </div>
    </>
  );
}

function Toggle({ label, hint, on, onChange, disabled }) {
  return (
    <Clickable onClick={() => !disabled && onChange(!on)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <span><span style={{ fontSize: 17, fontWeight: 600 }}>{label}</span>{hint && <span style={{ display: 'block', color: '#8A8AA0', fontSize: 13, marginTop: 2 }}>{hint}</span>}</span>
      <span style={{ width: 50, height: 28, borderRadius: 14, background: on ? GREEN : '#33333F', position: 'relative', flex: 'none', transition: 'background .2s' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 22, height: 22, borderRadius: 11, background: '#fff', transition: 'left .2s' }} />
      </span>
    </Clickable>
  );
}

function Range({ label, value, onChange, min = 0, max = 1, step = 0.05, fmtv }) {
  return (
    <label style={{ display: 'block', padding: '8px 0' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600 }}><span>{label}</span><span style={{ color: '#9C9CB0' }}>{fmtv ? fmtv(value) : `${Math.round(value * 100)} %`}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} onKeyDown={(e) => e.stopPropagation()} style={{ width: '100%', accentColor: GREEN, marginTop: 6 }} />
    </label>
  );
}

const sectionTitle = { color: '#9C9CB0', fontSize: 13, fontWeight: 700, letterSpacing: 1, marginTop: 14, marginBottom: 2 };

export function SettingsPanel(p) {
  return (
    <>
      <Backdrop onClose={p.onClose} />
      <div style={{ ...card, position: 'absolute', left: 1420, top: 258, width: 486, height: 540, padding: '20px 24px', zIndex: 41, overflowY: 'auto' }}>
        <PanelHead title="Einstellungen" onClose={p.onClose} />
        <div style={sectionTitle}>EINGABE</div>
        <Toggle label="MIDI-Keyboard" hint={p.midiOn ? (p.midiDevices.length ? `Verbunden: ${p.midiDevices.join(', ')}` : 'Kein Gerät gefunden – Kabel einstecken') : 'USB- oder MIDI-Kabel (Chrome/Edge)'} on={p.midiOn} onChange={p.onMidi} />
        <Toggle label="MIDI-Töne in der App hören" hint="Für stumme MIDI-Controller einschalten" on={p.midiSound} onChange={p.setMidiSound} />
        <Toggle label="Zuhören (Mikrofon)" hint="Erkennt deine Töne über das Mikrofon – Kopfhörer empfohlen" on={p.micOn} onChange={p.onMic} />
        <Range label="Mikrofon-Empfindlichkeit" value={p.micSens} onChange={p.setMicSens} />
        <div style={sectionTitle}>SPIELEN</div>
        <Toggle label="Warte-Modus" hint="Die Noten warten, bis du den richtigen Ton spielst" on={p.waitMode} onChange={p.setWaitMode} />
        <Toggle label="Oktave egal" hint="Ton zählt auch in einer anderen Oktave" on={p.octaveOk} onChange={p.setOctaveOk} />
        <Toggle label="Meine Stimmen vorspielen" hint={p.micOn ? 'Bei aktivem Mikrofon aus' : 'Die App spielt deine Noten leise mit'} on={p.demoOwn && !p.micOn} onChange={p.setDemoOwn} disabled={p.micOn} />
        <div style={sectionTitle}>KLANG</div>
        <Toggle label="Original-Aufnahme abspielen" hint={p.hasRecording ? 'Deine hochgeladene Aufnahme – passend zum Tempo gewählt' : 'Noch keine Aufnahme hochgeladen (Startseite → Aufnahmen hochladen)'} on={p.useRecording && p.hasRecording} onChange={p.setUseRecording} disabled={!p.hasRecording} />
        <Range label="Lautstärke Begleitung" value={p.levels.acc} onChange={(v) => p.setLevels({ acc: v })} />
        <Range label="Lautstärke eigene Töne" value={p.levels.own} onChange={(v) => p.setLevels({ own: v })} />
        <Range label="Hall (Kirchenraum)" value={p.levels.reverb} onChange={(v) => p.setLevels({ reverb: v })} />
        <div style={sectionTitle}>ANSICHT</div>
        <Toggle label="Notennamen" on={p.showNames} onChange={p.setShowNames} />
        {p.voiceCount > 0 && <Toggle label="Stimmen farbig" hint="Sopran grün · Alt gelb · Tenor violett · Bass blau" on={p.voiceColors} onChange={p.setVoiceColors} />}
        <Range label="Fallgeschwindigkeit" value={p.zoom} onChange={p.setZoom} min={0.6} max={1.8} step={0.1} fmtv={(v) => `${v.toFixed(1)}×`} />
      </div>
    </>
  );
}

const bigBtn = (bg, fg = '#08130D') => ({ height: 58, padding: '0 28px', borderRadius: 16, background: bg, color: fg, fontWeight: 800, fontSize: 20, display: 'inline-flex', alignItems: 'center', gap: 10 });
const inputCard = (on, color) => ({ flex: 1, padding: '14px 12px', borderRadius: 16, border: `2px solid ${on ? color : '#33333F'}`, background: on ? 'rgba(255,255,255,.06)' : '#1A1A24', textAlign: 'center', fontSize: 16, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 });

export function StartCard({ song, variations, variation, onVariation, midiOn, midiDevices, onMidi, micOn, onMic, onStart, onListen, handMode, onCycleHands, soundText }) {
  const handText = { both: 'beide Hände', rh: 'rechte Hand', lh: 'linke Hand', none: 'nur zuhören' }[handMode];
  return (
    <div style={{ ...card, position: 'absolute', left: 960 - 470, top: 262, width: 940, padding: '28px 34px', zIndex: 30, textAlign: 'center' }}>
      <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.1 }}>Übungsmodus</div>
      <div style={{ color: '#CFCFDC', fontSize: 21, marginTop: 10 }}>Die Noten fallen auf die Tasten – spiel sie, wenn sie die Linie erreichen.</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18 }}>
        {variations.map((v) => (
          <Clickable key={v.id} onClick={() => onVariation(v)} style={{ padding: '10px 18px', borderRadius: 14, border: `2px solid ${variation?.id === v.id ? GREEN : '#33333F'}`, background: variation?.id === v.id ? 'rgba(61,220,132,.12)' : '#1A1A24', fontSize: 17, fontWeight: 700 }}>
            {v.label} · {Math.round(v.tempo_factor * 100)} %
          </Clickable>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Clickable onClick={onMidi} style={inputCard(midiOn, '#5B8DEF')}>
          <Piano size={26} color="#9DBBFF" />MIDI-Kabel / USB
          <span style={{ fontSize: 13, color: '#9C9CB0', fontWeight: 500 }}>{midiOn ? (midiDevices.length ? `✓ ${midiDevices[0]}` : 'Kein Gerät – Kabel einstecken') : 'Antippen zum Verbinden'}</span>
        </Clickable>
        <Clickable onClick={onMic} style={inputCard(micOn, '#F2709C')}>
          <Mic size={26} color="#FFA9C6" />App hört zu
          <span style={{ fontSize: 13, color: '#9C9CB0', fontWeight: 500 }}>{micOn ? '✓ Mikrofon aktiv' : 'Mikrofon erlauben'}</span>
        </Clickable>
        <div style={inputCard(true, '#35D07F')}>
          <MousePointerClick size={26} color="#8AF5BE" />Bildschirm-Tasten
          <span style={{ fontSize: 13, color: '#9C9CB0', fontWeight: 500 }}>immer aktiv – Tasten antippen</span>
        </div>
      </div>
      <div style={{ color: '#9C9CB0', fontSize: 16, marginTop: 14 }}>
        Du spielst: <Clickable onClick={onCycleHands} style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>{handText}</Clickable>
        {song.has_pedal && ' · Pedal spielt die App (Knopf „Ped." zum Selbstspielen)'}
      </div>
      {soundText && <div style={{ color: '#B9A7E8', fontSize: 15, marginTop: 6 }}>{soundText}</div>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 20 }}>
        <Clickable onClick={onStart} style={bigBtn(GREEN)}><Play size={22} fill="#08130D" /> Los geht's</Clickable>
        <Clickable onClick={onListen} style={bigBtn('#24242F', '#fff')}><Headphones size={22} /> Nur anhören</Clickable>
      </div>
    </div>
  );
}

export function Countdown({ text }) {
  return (
    <div style={{ position: 'absolute', left: 0, width: 1920, top: 420, textAlign: 'center', zIndex: 20, pointerEvents: 'none' }}>
      <span style={{ fontSize: 44, fontWeight: 800, color: GREEN, textShadow: '0 0 24px rgba(61,220,132,.6)' }}>{text}</span>
    </div>
  );
}

export function ResultCard({ stats, tempo, saved, canSave, onLogin, onAgain, onLoopPractice, onHome, onClose }) {
  const judged = stats.hits + stats.misses;
  const acc = judged ? Math.round((100 * stats.hits) / judged) : 0;
  const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
  return (
    <>
      <Backdrop onClose={onClose} dim />
      <div style={{ ...card, position: 'absolute', left: 960 - 430, top: 250, width: 860, padding: 32, zIndex: 41, textAlign: 'center' }}>
        <div style={{ fontSize: 60, fontWeight: 800, background: 'linear-gradient(90deg,#35D07F,#36C8F0,#5B8DEF,#B47CFF,#F2709C)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Geschafft!</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '6px 0 14px' }}>
          {[0, 1, 2].map((i) => <Star key={i} size={44} color={i < stars ? '#F5B83D' : '#3A3A4A'} fill={i < stars ? '#F5B83D' : 'none'} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[['Trefferquote', judged ? `${acc} %` : '–'], ['Getroffen', `${stats.hits}/${judged}`], ['Beste Combo', stats.best], ['Tempo', `${Math.round(tempo * 100)} %`]].map(([k, v]) => (
            <div key={k} style={{ background: '#1C1C26', borderRadius: 14, padding: '14px 8px' }}>
              <div style={{ color: '#9C9CB0', fontSize: 14, fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ color: '#9C9CB0', fontSize: 15, marginTop: 14, minHeight: 22 }}>
          {saved ? <span style={{ color: GREEN }}><Check size={16} style={{ display: 'inline', verticalAlign: -3 }} /> Ergebnis gespeichert</span>
            : canSave ? 'Ergebnis wird gespeichert …'
              : <Clickable onClick={onLogin} style={{ color: '#fff', textDecoration: 'underline' }}><LogIn size={15} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />Anmelden, um Ergebnisse zu speichern</Clickable>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18 }}>
          <Clickable onClick={onAgain} style={bigBtn(GREEN)}><RotateCcw size={20} /> Nochmal</Clickable>
          <Clickable onClick={onLoopPractice} style={bigBtn('#24242F', '#fff')}><Repeat size={20} /> Takte üben</Clickable>
          <Clickable onClick={onHome} style={bigBtn('#24242F', '#fff')}><Home size={20} /> Anderes Lied</Clickable>
        </div>
      </div>
    </>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', top: 266, left: 0, width: 1920, display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}>
      <div style={{ ...card, padding: '12px 22px', fontSize: 18, fontWeight: 600, borderColor: '#4A4A5C' }}>{msg}</div>
    </div>
  );
}

export function WaitHint({ names }) {
  return (
    <div style={{ position: 'absolute', left: 0, width: 1920, top: 700, textAlign: 'center', zIndex: 15, pointerEvents: 'none' }}>
      <span style={{ background: 'rgba(16,16,22,.85)', border: '1.5px solid #F5B83D', borderRadius: 18, padding: '8px 18px', fontSize: 19, fontWeight: 700, color: '#FFDC8F' }}>
        Warte auf: {names}
      </span>
    </div>
  );
}

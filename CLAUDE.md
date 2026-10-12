# Christophs Noten App

Folge auch den allgemeinen Base44-Hinweisen in `AGENTS.md` und `README.md`.

## Dieses Repository
- Enthält den Quellcode der Base44-App „Christophs Noten App“ (Stand: Base44-Checkpoint `acd4029`, 12.10.2026).
- **Nicht automatisch mit Base44 synchronisiert:** die Live-App wird aus Base44 veröffentlicht. Zum Synchronisieren entweder
  GitHub im Base44-Editor verbinden (https://docs.base44.com/developers/app-code/local-development/github) oder
  Änderungen im Base44-Sandbox (siehe unten) machen und hier nachziehen.
- Lokal starten: `npm install`, `npm install -g base44@latest`, `base44 login`, `base44 link` (App-ID `6acb98f8aef6afdf63fcbf44`), `base44 dev`.
  Nur Frontend gegen das Live-Backend: `base44 dev --remote` (schreibt in die echten Daten!).
- Checks: `npm run build`, `npm run lint`.

Sprache mit dem Nutzer: **Deutsch**.

## Was es ist
Eine Base44-Web-App zum Üben von Orgel-/Klavierstücken mit fallenden Noten (Layout wie in den zuvor erstellten Übungsvideos).
Die App prüft per **MIDI (Web-MIDI)** oder **Mikrofon** (polyphone Tonerkennung), ob Töne getroffen werden, und belohnt Treffer mit
Neon-Regenbogen-Highlight, Funken und farbig leuchtender Taste.

- Live: https://christoph-plays-notes.base44.app
- Base44 App-ID: `6acb98f8aef6afdf63fcbf44` (App-Slug `christoph-plays-notes`, öffentlich ohne Login)
- Der Nutzer ist in der App als `admin` eingetragen.

## Direkt im Base44-Sandbox arbeiten (Live-Code)
```bash
claude mcp add --transport http base44 https://app.base44.com/mcp --scope user
claude            # dann im Claude Code: /mcp → base44 → Authenticate (Zugriff auf „sandbox“ erlauben)
```
Alternative ohne MCP: `npx base44 login`, dann `npx base44 sandbox ls|read|edit|run|checkpoint --app-id 6acb98f8aef6afdf63fcbf44 …`
Vollständige Anleitung für diese App: https://app.base44.com/api/sandbox/6acb98f8aef6afdf63fcbf44/local-agent/readme.md

Arbeitsweise: Code liegt **im Base44-Sandbox** (Pfad `/app`), nicht lokal. Schreiben = automatisch committen.
Nach einer Arbeitseinheit: `create_checkpoint`, dann veröffentlichen (Base44-Editor „Publish“ oder API `POST /api/apps/{app_id}/deploy`).
`run_command` startet in `/` → immer `cd /app && …`. Build-Check: `cd /app && npm run build` und `npx eslint src --quiet`.

## Datenbank (Entities, `base44/entities/*.jsonc`, Dateiname = Entity-Name in PascalCase)
- **Song** (4 Datensätze: `toccata` = Buxtehude Toccata in F BuxWV 157, `bwv870` = Bach Fuge C-Dur, `bwv542` = Bach Fuge g-Moll,
  `bwv1066` = Bach Ouverture C-Dur aus der Orchestersuite Nr. 1, Orgelbearbeitung J.-B. Dupont)
  Felder u. a.: slug, title, catalog, composer, subtitle, key_name, instrument, order, duration, measure_count, has_pedal, voice_count,
  third_button (`pedal`|`voices`), accent_color, description, default_names[12], measures[] (Startzeit jedes Takts in s bei 100 %, letzter = Ende),
  sections[{label, measure}], chords[{s, e, name}], **notes_chunks[]** (Notenliste, Teilstücke einfach aneinanderhängen), note_count,
  optional **measure_labels[]** (Partitur-Taktnummer je gespieltem Takt, nur bei ausgeschriebenen Wiederholungen – bwv1066:
  130 gespielte Takte = 1–16, 1–15, 17–114, 116; Anzeige/Springen/Schleife nutzen die Partitur-Nummern, siehe `lib/songs.js`).
  Schreiben nur für Admins (RLS).
- **SongVariation** (8 Datensätze: je Song „Originaltempo“ tempo_factor 1.0 und „Übungstempo“ 0.6) mit optionaler `audio_url`.
- **PracticeResult** (Ergebnisse angemeldeter Nutzer; RLS: nur eigene lesbar).

Notenformat (in notes_chunks): Einträge `Δstart_cs,dauer_cs,midi,code[,name]`, getrennt durch `;`.
Δstart = Abstand zum vorherigen Notenstart in Hundertstelsekunden (Zeit der Originalaufnahme bei 100 %).
`code = hand + 3*stimme` (hand 0 = rechts, 1 = links, 2 = Pedal; stimme 0 = keine, 1 S, 2 A, 3 T, 4 B/Pedal).
`name` nur, wenn abweichend von default_names[midi % 12]. Kopien der Rohdaten: `public/data/<slug>.meta.json` und `.notes.txt` (Fallback).

Bekannte Base44-Grenzen: ein String-Feld darf nicht zu groß sein (daher notes_chunks ≤ ~6000 Zeichen);
Arrays von Arrays werden als Strings validiert (daher chords als Objekte).

## Code-Aufbau (`/app/src`)
- `pages/Landing.jsx` – Startseite (Neon-Animation, 3 Liedkarten mit je 2 Variationen, Hörprobe, Eingabe-Test MIDI/Mikro,
  Admin: „Aufnahmen hochladen“ für alle 6 MP3s auf einmal, Zuordnung per Dateiname).
- `pages/Player.jsx` – Spieler: 1920×1080-Bühne, skaliert; Logik für Treffer/Fehler/Combo, Warte-Modus, Schleife, Tastenkürzel, Ergebnisse.
- `components/player/StageParts.jsx` – Kopfzeile, Knopfreihe, Zeitleiste, HUD (alle Felder aus dem Video sind klickbar mit Aktion).
- `components/player/Panels.jsx` – Fenster: Einstellungen, Abschnitte, Takt/Schleife, Liedwahl, Info, Statistik, Startkarte, Ergebniskarte.
- `components/landing/NeonHero.jsx` – Animation der Startseite.
- `lib/renderer.js` – Canvas: fallende Noten, Tastatur C2–C6, Neon-Treffer, Funken.
- `lib/transport.js` – Musik-Uhr + Planung der Noten; **mit Aufnahme ist die Aufnahme die Uhr** (Noten folgen dem Audio, auch beim Puffern).
- `lib/audioEngine.js` – Web-Audio-Synthesizer (Orgel mit 16'-Pedal / Klavierton, Hall) – nur Ersatz, wenn keine Aufnahme existiert.
- `lib/inputs.js` – `MidiInput` (Web MIDI) und `MicDetector` (FFT, Obertonmuster, Schutz vor Oktav-/Quint-Obertönen, 2 Frames Bestätigung).
- `lib/songs.js`, `lib/music.js` – Laden/Parsen, Farben, Akkorde, Hilfsfunktionen.
- Routen: `/` Landing, `/spielen/:slug?v=<variationId>` Player, plus Login-Seiten.

Wichtiges Verhalten:
- Original-Aufnahmen werden **immer** abgespielt, sobald `audio_url` gesetzt ist; je nach Tempo wird die passende Datei gewählt
  (nächstliegender tempo_factor), Tonhöhe bleibt beim Tempoändern erhalten. Synthesizer nur als Ersatz/Umschalter.
- Tempo/Zeit-Anzeige wie im Video: angezeigte Zeit = Musikzeit / Tempo.

## Debug/Test
- `localStorage.cnaDebug = '1'` aktiviert `window.__cna` (L, tr, H, isMine, mic, engine) für Tests.
- Bewährt: Playwright im Base44-Sandbox (`pip install playwright && python3 -m playwright install --with-deps chromium`;
  nach einem Deploy wird der Sandbox neu aufgesetzt, dann neu installieren), `npx vite preview --port 4173`.
  Lokal schlagen API-Aufrufe fehl → App nutzt `public/data`-Fallback; Variationen mit audio_url lassen sich per `page.route` simulieren.
  Für Audio-Tests braucht der Testserver Range-Requests (sonst springt das Spulen).

## Stand / offene Punkte
- **Die 8 Original-Aufnahmen sind noch nicht hochgeladen** (alle audio_url leer; Stand 12.10.2026). Der Nutzer hat die passenden MP3s
  (zugeschnitten auf die Noten; BWV 542 um ~1 Halbton tiefer gestimmt, damit es zur Notation passt):
  `Toccata_BuxWV157_Originaltempo_100.mp3`, `…_Uebungstempo_60.mp3`, `Fuge_C-Dur_BWV870_Originaltempo_100.mp3`, `…_60.mp3`,
  `Fuge_g-Moll_BWV542_Originaltempo_100.mp3`, `…_60.mp3`, `Ouverture_C-Dur_BWV1066_Originaltempo_100.mp3`, `…_Uebungstempo_60.mp3`
  (die beiden BWV-1066-Dateien wurden aus der Aufnahme des Nutzers erzeugt, 60 % mit Rubberband, Tonhöhe gleich).
  Hochladen: in der App anmelden → Startseite → „Aufnahmen hochladen“.
- Mit echtem MIDI-Keyboard noch nicht praktisch getestet (Mikrofon-Erkennung mit synthetischen Aufnahmen getestet: 173/174 Treffer, 0 Fehltreffer).
- Mit Mikrofon üben → Kopfhörer, sonst hört das Mikrofon die Aufnahme mit.

## Vorgeschichte (vor der App)
Aus den Aufnahmen und PDFs des Nutzers wurden Übungsvideos (Falling-Notes, 100 % und 60 %) plus synchrone MIDI-Dateien erzeugt
(Toccata BuxWV 157 aus Video + PDF, Fuge BWV 870 aus MP3 + PDF, Fuge BWV 542 aus MP3 + PDF, Ouverture BWV 1066 aus MP3 + PDF:
 Partitur per OMR (Audiveris) + manueller Korrektur, Zeiten per DTW/Spline an die Aufnahme angepasst, inkl. Überpunktierung im Grave). Die Notendaten der App stammen daraus
(Noten nach der Partitur, zeitlich an die jeweilige Aufnahme angepasst).

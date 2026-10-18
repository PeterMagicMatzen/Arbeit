# Christophs Noten App

Folge auch den allgemeinen Base44-Hinweisen in `AGENTS.md` und `README.md`.

## Dieses Repository
- Enthält den Quellcode der Base44-App „Christophs Noten App“.
- **Mit Base44 synchronisiert** (GitHub-Integration, seit 12.10.2026): Alles, was auf `main` landet, erscheint im Base44-Editor
  (und umgekehrt). Live geht es erst nach **Publish** im Base44-Editor. Änderungen deshalb per Pull Request auf `main`.
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
- **Song** (`toccata` = Buxtehude Toccata in F BuxWV 157, `bwv870` = Bach Fuge C-Dur, `bwv542` = Bach Fuge g-Moll,
  `bwv1066` = Bach Ouvertüre C-Dur aus der Orchestersuite Nr. 1, Orgelfassung,
  `flying` = „Flying“ aus Peter Pan, J. N. Howard, Orgelfassung Anna Lapwood – order 8; in Base44 gibt es außerdem
  `bwv854`, `boellmann`, `bruhns`, dort direkt angelegt)
  Felder u. a.: slug, title, catalog, composer, subtitle, key_name, instrument, order, duration, measure_count, has_pedal, voice_count,
  third_button (`pedal`|`voices`), accent_color, description, default_names[12], measures[] (Startzeit jedes Takts in s bei 100 %, letzter = Ende),
  sections[{label, measure}], chords[{s, e, name}], **notes_chunks[]** (Notenliste, Teilstücke einfach aneinanderhängen), note_count,
  optional measure_labels[] (gedruckte Taktnummer je Eintrag in measures – bei Wiederholungen doppelt) und measure_total (Takte der Partitur).
  measures/sections zählen bei Stücken mit Wiederholungen in **Spielfolge** (BWV 1066: 130 Einträge, Partitur 116 Takte).
  Schreiben nur für Admins (RLS).
- **SongVariation** (je Song „Originaltempo“ tempo_factor 1.0 und „Übungstempo“ 0.6) mit optionaler `audio_url`.
- **Neues Stück hinzufügen:** `public/data/<slug>.meta.json` + `.notes.txt` ablegen und den Slug in `SLUGS` (`src/lib/songs.js`) eintragen.
  Die App zeigt es sofort aus den Dateien; sobald ein Admin die Startseite öffnet, legt `seedMissingSongs()` Song + 2 Variationen
  in der Datenbank an (danach funktioniert das Hochladen der Aufnahmen). Dateinamen-Zuordnung beim Hochladen: `matchVariation` in `Landing.jsx`.
- **PracticeResult** (Ergebnisse angemeldeter Nutzer; RLS: nur eigene lesbar).

Notenformat (in notes_chunks): Einträge `Δstart_cs,dauer_cs,midi,code[,name]`, getrennt durch `;`.
Δstart = Abstand zum vorherigen Notenstart in Hundertstelsekunden (Zeit der Originalaufnahme bei 100 %).
`code = hand + 3*stimme` (hand 0 = rechts, 1 = links, 2 = Pedal; stimme 0 = keine, 1 S, 2 A, 3 T, 4 B/Pedal).
`name` nur, wenn abweichend von default_names[midi % 12]. Kopien der Rohdaten: `public/data/<slug>.meta.json` und `.notes.txt` (Fallback).

Bekannte Base44-Grenzen: ein String-Feld darf nicht zu groß sein (daher notes_chunks ≤ ~6000 Zeichen);
Arrays von Arrays werden als Strings validiert (daher chords als Objekte).

## Code-Aufbau (`/app/src`)
- `pages/Landing.jsx` – Startseite (Neon-Animation, Liedkarten mit je 2 Variationen, Hörprobe, Eingabe-Test MIDI/Mikro,
  Admin: „Aufnahmen hochladen“ für alle MP3s auf einmal, Zuordnung per Dateiname; legt fehlende Stücke in der DB an).
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
- Flying: Aufnahme = Filmmusik-MP3 des Nutzers (urheberrechtlich geschützt, deshalb nicht selbst hochgeladen);
  `Flying_PeterPan_Originaltempo_100.mp3` / `…_Uebungstempo_60.mp3` lädt der Nutzer über „Aufnahmen hochladen“ hoch.
  Gespielte Form laut Aufnahme: T. 1, (2–3)×2, 4–5, (6–7)×3, (8–9)×3, 10–68; Pedal in T. 4–10 mit 2′-Flöte (klingt 2 Oktaven höher, notiert ist die gegriffene Taste).
- Original-Aufnahmen: Der Nutzer hat die passenden MP3s (zugeschnitten auf die Noten; BWV 542 um ~1 Halbton tiefer gestimmt,
  damit es zur Notation passt): `Toccata_BuxWV157_Originaltempo_100.mp3`, `…_Uebungstempo_60.mp3`, `Fuge_C-Dur_BWV870_Originaltempo_100.mp3`,
  `…_60.mp3`, `Fuge_g-Moll_BWV542_Originaltempo_100.mp3`, `…_60.mp3`, `Ouvertuere_BWV1066_Originaltempo_100.mp3`, `…_Uebungstempo_60.mp3`.
  Hochladen: in der App als Admin anmelden → Startseite → „Aufnahmen hochladen“ (Zuordnung über den Dateinamen).
- Mit echtem MIDI-Keyboard noch nicht praktisch getestet (Mikrofon-Erkennung mit synthetischen Aufnahmen getestet: 173/174 Treffer, 0 Fehltreffer).
- Mit Mikrofon üben → Kopfhörer, sonst hört das Mikrofon die Aufnahme mit.

## Vorgeschichte (vor der App)
Aus den Aufnahmen und PDFs des Nutzers wurden Übungsvideos (Falling-Notes, 100 % und 60 %) plus synchrone MIDI-Dateien erzeugt
(Toccata BuxWV 157 aus Video + PDF, Fuge BWV 870 aus MP3 + PDF, Fuge BWV 542 aus MP3 + PDF,
Ouvertüre BWV 1066 aus MP3 (J.-B. Dupont) + PDF der Orgelfassung; Form der Aufnahme: Grave mit Wiederholung, Fuge ohne Wiederholung, Schluss). Die Notendaten der App stammen daraus
(Noten nach der Partitur, zeitlich an die jeweilige Aufnahme angepasst).

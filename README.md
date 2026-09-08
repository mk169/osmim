# Personal OS v2

Ein ruhiges persönliches Lebenssystem — kein Task-Manager. Identität, Studium,
Körper, Beziehungen, Kultur, Kreativität, Karriere, Glaube und Alltag kommen an
einem Ort zusammen: komplexe Datenstruktur im Hintergrund, extrem klare
Tagesansicht vorne.

Keine Streaks, keine Punkte, keine rote Überfällig-Ästhetik.

## Starten

```bash
npm install
npm run dev      # Entwicklung
npm run build    # Produktionsbuild nach dist/
npm run preview  # Build lokal ansehen
```

## Seiten

| # | Seite | Zustand |
|---|-------|---------|
| 1 | **Heute** | voll funktionsfähig — Intention, „The One Thing“, drei Tageskarten (Pflicht/Körper/Geist, max. drei Aufgaben), Attention-Check, Mini-Journal, Tagesabschluss |
| 2 | **Kompass** | Leitbild, Werte, Vorbild-Qualitäten, Anti-Vision, Fünf-Jahres-Phasen, „Nicht mein Maßstab“ — alles editierbar |
| 3 | **Saison** | voll funktionsfähig — Saisonziele mit ruhiger Fortschrittslinie, Termine, „Nicht jetzt“-Liste, Monatsreflexion |
| 4 | **Bereiche** | voll funktionsfähig — neun Lebensbereiche mit Leitbild, 90-Tage-Fokus, Zielen, Gewohnheiten, Projekten, Notizen und Rückblick; dazu bereichseigene Ansichten (Klausuren, Praktikums-Pipeline, Trainingstagebuch, Kontakte, Glaubenspraxis, Sprachen & Bibliothek, Finanzen, Krakau) |
| 5 | **Projekte** | voll funktionsfähig — zentrale Inbox mit wöchentlicher Review, Projekte mit Warum/Ergebnis/nächster physischer Handlung/Bewertung, Grenze von fünf aktiven Projekten |
| 6 | **Woche** | voll funktionsfähig — Wochenfokus, Sieben-Tage-Kalender, Kapazitätsanzeige (max. drei anspruchsvolle Prioritäten pro Tag), Wochenreview mit fünf Fragen |
| 7 | **Journal** | Vorlagen (Tages-Check-in, Wochenreview, Gebet, Ideen, emotionale Klärung), Volltextsuche, Tags, dezente Energie-/Stimmungsskala |
| 8 | **Archiv** | abgeschlossene Projekte, frühere Wochen- und Monatsrückblicke, Bibliothek, „Leben erlebt“ |

## Daten

Alles liegt im `localStorage` des Browsers unter dem Schlüssel
`personal-os-v2` — nichts verlässt das Gerät. Über **Daten & Sicherung** in der
Seitenspalte lässt sich der gesamte Zustand als lesbares JSON exportieren und
wieder importieren; beim Import ergänzt eine Migration fehlende Felder, sodass
ältere Backups weiter funktionieren.

Beim ersten Start werden Seed-Daten geladen: alle neun Bereiche, die
Saisonziele, sechs Klausuren, Projekte, Kontakte, Gewohnheiten und ein
Beispielkalender.

## Aufbau

```
src/
  types.ts            Datenmodelle (Areas, Goals, Projects, Tasks, Habits,
                      Reviews, JournalEntries, Events, Contacts …)
  data/seed.ts        Ausgangsdaten
  store/
    store.tsx         Zustand, localStorage, Import/Export, Nachtmodus
    actions.ts        reine Zustandsfunktionen (Aufgaben, Inbox, Projekte …)
  lib/
    date.ts           Datums- und Tageszeit-Helfer (deutsch)
    labels.ts         Beschriftungen und Vorlagentexte
    router.ts         kleiner Hash-Router
  components/
    ui.tsx            gemeinsame Bausteine (Karten, Inline-Edit, Modal …)
    Shell.tsx         Navigation und Rahmen
  pages/              die acht Seiten
```

## Gestaltung

Warmes Creme und Stein als Grundfläche, Anthrazit als Schrift, Waldgrün und
dezentes Bordeaux als Akzente. Serif (Fraunces) für große Überschriften,
Inter für die Oberfläche. Nachtmodus über die Seitenspalte; er wird gespeichert.
Übergänge sind bewusst langsam und klein gehalten, `prefers-reduced-motion`
wird respektiert. Desktop-first, ab 390 px vollständig benutzbar.

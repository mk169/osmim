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
| 1 | **Heute** | voll funktionsfähig — Termine des Tages, „The One Thing“, drei Tageskarten (Pflicht/Körper/Geist), Attention-Check, Mini-Journal |
| 2 | **Kompass** | Leitbild, Werte, Vorbild-Qualitäten, **Ziele am Horizont**, die 25/5-Liste, Anti-Vision, Phasen, „Nicht mein Maßstab“ — leeres Gerüst, alles selbst zu füllen |
| 3 | **Saison** | voll funktionsfähig — frei wählbarer Zeitraum (7, 14, 30, 60, 90 Tage, Halbjahr, Jahr oder eigene Daten; Standard 60 Tage), **25/5 mit echten Zielen** — fünf laufen parallel, bis zu 25 stehen auf der Liste —, Denkrahmen je Ziel, Termine, „Nicht jetzt“-Liste, Monatsreflexion |
| 4 | **Bereiche** | voll funktionsfähig — **frei anlegbar und löschbar**, jeder mit Leitbild, Fokus, Zielen, Gewohnheiten, Projekten, Prinzipien, Notizen und Rückblick; optionale Werkzeuge (Praxis, Protokoll, Menschen, Prüfungen, Bewerbungen, Bibliothek, Finanzen) statt fester Ansichten; Verlinkung zu Heute, Woche und Saison |
| 5 | **Projekte** | voll funktionsfähig — zentrale Inbox mit wöchentlicher Review, **25/5** (fünf parallel, zwanzig in der Pipeline), Workflow mit Voraussetzungen je Stufe, eigene Aufgaben je Projekt, Verlinkung zu Heute, Woche und Saison |
| 6 | **Woche** | voll funktionsfähig — Wochenfokus, Sieben-Tage-Kalender mit anklickbaren, bearbeitbaren Terminen (Von/Bis, Notiz), Kapazitätsanzeige, Wochenreview mit fünf Fragen, Einschätzung 1–10, Abschließen ins Archiv und **Verlauf über die Wochen** |
| 7 | **Journal** | Vorlagen (Tages-Check-in, Wochenreview, Gebet, Ideen, emotionale Klärung), Volltextsuche, Tags, dezente Energie-/Stimmungsskala |
| 8 | **Archiv** | abgeschlossene Projekte, frühere Wochen- und Monatsrückblicke, Bibliothek, „Leben erlebt“ |

## Aufgaben

Aufgaben sind nicht begrenzt. Drei pro Tag bleiben die Empfehlung — ab der
vierten erscheint ein leiser Hinweis mit der Frage, was warten darf, aber
eintragen lässt sich, so viel du willst.

Projektaufgaben leben im Projekt und lassen sich von dort mit einem Klick
für heute einplanen; sie erscheinen dann in der Tagesansicht.

## Ziele und Denkrahmen

Ein Ziel ist zunächst nur ein Satz. Wer mehr Struktur will, wählt beim Anklicken
einen Rahmen — die zusätzlichen Felder erscheinen erst dann:

- **SMART** — spezifisch, messbar, erreichbar, relevant, terminiert
- **OKR** — ein Objective, drei Key Results
- **WOOP** — Wunsch, Ergebnis, inneres Hindernis, Wenn-Dann-Plan

Das 25/5-Prinzip taucht auf zwei Ebenen auf, mit verschiedenem Horizont:

- **Kompass** — die Lebensliste: fünfundzwanzig Ambitionen aufschreiben, fünf
  wählen; die übrigen zwanzig werden nicht zur Warteschlange, sondern zur
  Vermeidungsliste.
- **Saison** — dieselbe Regel auf echte Ziele angewandt: fünf laufen parallel,
  bis zu fünfundzwanzig stehen auf der Liste, und alles davon soll in sechzig
  Tagen machbar sein. Was länger braucht, gehört in den Kompass.

Projekte folgen derselben Zahl: fünf aktiv, zwanzig in der Pipeline.

## Löschen

Alles, was in einer Karte oder Liste steht, lässt sich dort auch entfernen:
Ziele, Aufgaben, Projekte, Gewohnheiten, Klausuren, Bewerbungen, Kontakte,
Termine, Journaleinträge, Rückblicke, Bibliothekseinträge, Finanzposten,
Werte und Phasen. Das Kreuz erscheint beim Überfahren der Zeile (auf
Touch-Geräten dauerhaft); nur wo echte Arbeit verloren geht, kommt eine
Rückfrage.

## Daten

Alles liegt im `localStorage` des Browsers unter dem Schlüssel
`personal-os-v2` — nichts verlässt das Gerät. Über **Daten & Sicherung** in der
Seitenspalte lässt sich der gesamte Zustand als lesbares JSON exportieren und
wieder importieren; beim Import ergänzt eine Migration fehlende Felder, sodass
ältere Backups weiter funktionieren.

Beim ersten Start ist die App ein **leeres Skelett**: die neun Bereiche und
alle Seiten stehen bereit, Inhalte gibt es keine. Ziele, Projekte, Aufgaben,
Termine, Kontakte, Gewohnheiten und Notizen trägst du selbst ein.

Wer noch die Beispieldaten der ersten Fassung im Browser hatte, wird sie
beim nächsten Öffnen los: eine einmalige Bereinigung entfernt genau die
damaligen Beispieleinträge (erkennbar an ihren festen Kennungen) samt der
Beispieltexte. Alles selbst Angelegte trägt eine Zufallskennung und bleibt
unberührt. Wer trotzdem ganz von vorn beginnen will: **Daten & Sicherung →
Auf Ausgangsfassung zurücksetzen**.

## Veröffentlichen

Der Basispfad kommt aus der Umgebungsvariable `BASE_PATH` und ist
standardmäßig `/` — ein Deploy funktioniert damit ohne Konfiguration.

**Vercel** — Repository unter *Add New… → Project* importieren. Vercel
erkennt Vite von selbst; `vercel.json` legt Build, Ausgabeordner, das
Rewrite auf `index.html` und die Cache-Header für `assets/` fest. Nichts
weiter einzustellen, `BASE_PATH` bleibt leer.

**GitHub Pages** — läuft über `.github/workflows/deploy.yml`. Dort wird
`BASE_PATH=/osmim/` gesetzt, weil das Projekt unter einem Unterpfad liegt.

Beide Ziele können parallel laufen; sie stören einander nicht.

## Profile und Geräteabgleich

Ohne Anmeldung speichert die App nur lokal — die App funktioniert vollständig,
aber Mac und iPhone bleiben getrennt. Für gemeinsame Daten gibt es **Profile
mit Anmeldung** über Supabase (Anmeldung, Passwort-Zurücksetzen und Datenbank
in einem, kostenlos für persönliche Nutzung).

**Einrichten** — drei Schritte, einmalig:

1. Auf supabase.com ein kostenloses Projekt anlegen.
2. Im SQL-Editor `supabase/setup.sql` aus diesem Repository ausführen. Das legt
   die Tabelle an und schaltet die Sicherheitsregeln ein, die jedem Profil
   ausschließlich die eigene Zeile zugänglich machen.
3. In den Vercel-Projekteinstellungen zwei Umgebungsvariablen setzen und einmal
   neu deployen:

   ```
   VITE_SUPABASE_URL       = https://<projekt>.supabase.co
   VITE_SUPABASE_ANON_KEY  = <der öffentliche anon key>
   ```

Der Anon-Key ist zur Veröffentlichung gedacht; geschützt wird nicht durch ihn,
sondern durch die Sicherheitsregeln der Datenbank.

**Benutzen** — unter *Daten & Sicherung → Profil & Geräte* ein Profil anlegen
und sich auf dem zweiten Gerät mit derselben E-Mail anmelden. Danach läuft der
Abgleich von selbst: beim Anmelden wird geladen, jede Änderung gebündelt
gesichert, und beim Zurückkommen ans Fenster wird nachgesehen, ob ein anderes
Gerät etwas geschrieben hat.

Gefragt wird nur an einer Stelle — wenn beim ersten Anmelden auf einem Gerät
sowohl lokal als auch im Profil Daten liegen. Dort still zu entscheiden hieße,
einem der beiden Stände die Arbeit zu nehmen.

**Vertraulichkeit** — mit Profil liegen die Daten in deiner Supabase-Datenbank.
Die Sicherheitsregeln verhindern fremden Zugriff, und wer das Projekt besitzt,
bist du. Anders als beim Sync-Schlüssel sind sie dort aber nicht Ende zu Ende
verschlüsselt: wer Zugriff auf die Datenbank hat, kann sie lesen. Das ist der
Preis dafür, dass ein vergessenes Passwort zurückgesetzt werden kann.

**Ohne Supabase** bleibt die ältere Möglichkeit erhalten: ein Sync-Schlüssel
über einen Vercel-Blob-Speicher (`api/sync.ts`), Ende zu Ende verschlüsselt,
ohne Anmeldung — dafür ohne Wiederherstellung. Die Oberfläche zeigt automatisch
den Weg, der eingerichtet ist. Auf GitHub Pages gibt es weder das eine noch das
andere; dort bleibt es beim Datei-Backup.

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

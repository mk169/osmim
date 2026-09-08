import type { AppState, Area, DateISO } from '../types';
import { addDays, startOfWeek, today } from '../lib/date';

export const STATE_VERSION = 2;

let counter = 0;
/** Deterministische IDs für Seed-Daten, zufällige zur Laufzeit. */
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export const AREAS: Area[] = [
  {
    id: 'attention',
    letter: 'A',
    title: 'Aufmerksamkeit & Charakter',
    subtitle: 'Die Grundlage von allem anderen',
    creed:
      'Ich hole meine Aufmerksamkeit zurück und werde ein Mensch, auf den man sich verlassen kann.',
    focus:
      'Weniger Dauerstimulation, mehr Stille. Morgen und Abend gehören mir, nicht dem Feed.',
    notes:
      'Charakter: ehrlich, proaktiv, verlässlich, menschlich korrekt. Vergleich ist kein Maßstab.',
    extra: '',
    review: '',
    accent: 'ink',
  },
  {
    id: 'study',
    letter: 'B',
    title: 'Studium & Karriere',
    subtitle: 'Klausuren, Thesis, erste Richtung',
    creed:
      'Ich bringe das Studium sauber zu Ende und teste ruhig, wohin es beruflich gehen darf.',
    focus:
      'Sechs Klausuren vorbereiten, die Thesis strukturieren, die Praktikums-Pipeline in Bewegung halten.',
    notes:
      'Nach dem Abschluss zählt nicht die Note, sondern was ich tatsächlich kann und wen ich kenne.',
    extra:
      'Kreativität — Gestaltung, Redaktion, alles, wo etwas entsteht.\nSelbstständigkeit — eigene Arbeit, eigenes Tempo, eigenes Risiko.\nFinance — Struktur, Zahlen, saubere Analyse.\n\nKeine dieser Hypothesen muss heute entschieden werden.',
    review: '',
    accent: 'forest',
  },
  {
    id: 'body',
    letter: 'C',
    title: 'Körper, Energie & Ausstrahlung',
    subtitle: 'Stark, gesund, präsent',
    creed:
      'Ein Körper, der trägt: kräftig, ausdauernd, gepflegt — ohne Zwang und ohne Extreme.',
    focus:
      'Drei Trainingseinheiten pro Woche, Schlaf vor Mitternacht, einfache Ernährungsprinzipien.',
    notes:
      'Der Körper ist kein Projekt, sondern die Grundlage. Regelmäßigkeit schlägt Intensität.',
    extra:
      'Prinzipien statt Kalorienzählen: Protein zu jeder Mahlzeit, echtes Essen, wenig Zucker, viel Wasser, ein Spaziergang täglich. Vor Mitternacht schlafen.',
    review: '',
    accent: 'forest',
  },
  {
    id: 'relationships',
    letter: 'D',
    title: 'Beziehungen & Dating',
    subtitle: 'Nähe, Wärme, echte Initiative',
    creed:
      'Ich gehe auf Menschen zu, halte Freundschaften warm und begegne anderen offen statt taktisch.',
    focus: 'Eine soziale Initiative pro Woche. Familie regelmäßig, nicht zufällig.',
    notes:
      'Keine Taktiken, keine Spielchen. Interesse zeigen, einladen, zuhören, verlässlich sein.',
    extra: '',
    review: '',
    accent: 'wine',
  },
  {
    id: 'faith',
    letter: 'E',
    title: 'Glaube & innere Ruhe',
    subtitle: 'Gebet, Messe, Stille',
    creed:
      'Mein Glaube ist kein Projekt, sondern der Ort, an dem ich zur Ruhe komme.',
    focus: 'Morgengebet, sonntags Messe, Dankbarkeit am Abend, geistliche Lektüre.',
    notes:
      'Hier wird nichts gemessen. Nur sanfte Erinnerung und ehrliche Reflexion.',
    extra: '',
    review: '',
    accent: 'wine',
  },
  {
    id: 'culture',
    letter: 'F',
    title: 'Bildung, Sprachen & Kultur',
    subtitle: 'Italienisch, Lesen, Kunst',
    creed:
      'Ich bilde mich täglich ein wenig — Sprache, Bücher, Kunst — und werde dadurch ein interessanterer Mensch.',
    focus: 'Italienisch täglich zehn Minuten. Zwanzig Seiten lesen. Einmal im Monat Ausstellung oder Konzert.',
    notes:
      'Später: Französisch, Spanisch, vertieftes Englisch. Lernpfade: Rhetorik, Grammatik, Trivium, Allgemeinwissen.',
    extra: '',
    review: '',
    accent: 'brass',
  },
  {
    id: 'creativity',
    letter: 'G',
    title: 'Kreativität',
    subtitle: 'Malen, Schreiben, Musik',
    creed:
      'Ich mache regelmäßig etwas mit eigenen Händen — ohne dass ein Ergebnis herauskommen muss.',
    focus: 'Zwei kreative Sessions pro Woche, ohne Erwartung an das Resultat.',
    notes: 'Malen, Zeichnen, Schreiben, Gedichte, Ableton. Ideen wandern zuerst in die Inbox.',
    extra: '',
    review: '',
    accent: 'brass',
  },
  {
    id: 'ventures',
    letter: 'H',
    title: 'Selbstständigkeit & Projekte',
    subtitle: 'Höchstens fünf aktive Projekte',
    creed:
      'Ich baue lieber eine Sache fertig als fünf halb. Eine gute Idee darf warten.',
    focus: 'Ein Projekt konsequent voranbringen, den Rest bewusst ruhen lassen.',
    notes:
      'Bewertung: Bedeutung, Energie, Lernwert, Realisierbarkeit. Immer die nächste physische Handlung notieren.',
    extra: '',
    review: '',
    accent: 'forest',
  },
  {
    id: 'daily',
    letter: 'I',
    title: 'Alltag, Ordnung & Finanzen',
    subtitle: 'Zimmer, Papiere, Geld, Krakau',
    creed:
      'Ordnung außen macht Ruhe innen. Der Alltag soll leise funktionieren.',
    focus: 'Wiederkehrende Routinen laufen lassen, Uni-Zahlung und Dokumente erledigen, Krakau vorbereiten.',
    notes: 'Ordnung ist hier kein Selbstzweck — sie macht den Kopf frei für alles andere.',
    extra:
      'Wäsche montags. Zimmer freitags. Papiere am Monatsanfang. Uni-Zahlung zum Semesterbeginn. Dokumente für Krakau griffbereit.',
    review: '',
    accent: 'ink',
  },
];

export function createSeedState(): AppState {
  const t: DateISO = today();
  const week = startOfWeek(t);
  const now = new Date().toISOString();

  return {
    version: STATE_VERSION,
    createdAt: now,
    theme: 'light',

    compass: {
      creed:
        'Ein kultivierter katholischer Gestalter: körperlich stark, geistig klar, kreativ, sozial offen und fähig, etwas Eigenes aufzubauen.',
      values: [
        'Glaube',
        'Schönheit',
        'Mut',
        'Bildung',
        'Verlässlichkeit',
        'Freiheit',
        'Liebe',
        'Schöpfung',
      ],
      qualities: [
        { title: 'Beobachtung', text: 'Sehen, was wirklich da ist — bevor ich urteile.' },
        { title: 'Kulturelles Wissen', text: 'Zusammenhänge kennen: Geschichte, Kunst, Sprache, Glaube.' },
        { title: 'Schönheitssinn', text: 'Erkennen, was Form hat — und selbst Form geben.' },
        { title: 'Sprachgefühl', text: 'Genau sprechen und schreiben. Worte tragen Verantwortung.' },
        { title: 'Entschlusskraft', text: 'Entscheiden und dabei bleiben, statt ewig zu vergleichen.' },
        { title: 'Stille', text: 'Es aushalten, dass nichts passiert. Dort beginnt das Denken.' },
        { title: 'Demut', text: 'Ich bin nicht der Maßstab. Lernen ist keine Niederlage.' },
        { title: 'Dienst', text: 'Nützlich sein für konkrete Menschen, nicht für ein Publikum.' },
        { title: 'Kreativität', text: 'Etwas hinzufügen, das vorher nicht da war.' },
      ],
      antiVision: [
        'Passiv — das Leben geschieht, statt gestaltet zu werden.',
        'Zerstreut — nie mehr als zwanzig Minuten bei einer Sache.',
        'Fremdgesteuert — der Feed bestimmt die Stimmung des Tages.',
        'Im Vergleich gefangen — fremde Zeitpläne als eigenes Versagen lesen.',
        'Viele Ideen, keine Umsetzung — Anfangen als Ersatz für Fertigwerden.',
      ],
      phases: [
        {
          id: 'phase_1',
          label: 'Jahr 1',
          title: 'Studium abschließen',
          text: 'Klausuren und Thesis sauber zu Ende bringen. Aufmerksamkeit und Körperbasis stabilisieren.',
        },
        {
          id: 'phase_2',
          label: 'Jahr 1–2',
          title: 'Praktika und Richtung testen',
          text: 'Zwei bis drei Stationen ausprobieren. Herausfinden, welche Arbeit trägt — ohne sich früh festzulegen.',
        },
        {
          id: 'phase_3',
          label: 'Jahr 2–4',
          title: 'Erste starke Berufserfahrung',
          text: 'Irgendwo richtig gut werden. Handwerk, Verantwortung, Menschen, die etwas können.',
        },
        {
          id: 'phase_4',
          label: 'Jahr 4–5',
          title: 'Eigenes aufbauen / vertiefen',
          text: 'Etwas Eigenes gründen oder eine Sache so tief beherrschen, dass sie unverwechselbar wird.',
        },
      ],
      notMyMeasure: [
        'Social-Media-Vergleich — kuratierte Ausschnitte fremder Leben.',
        'Fremde Zeitpläne — wer mit 22 was erreicht hat, sagt nichts über meinen Weg.',
        'Status um des Status willen — Titel, die niemandem dienen.',
      ],
    },

    season: {
      title: 'Herbstsaison',
      statement:
        'Studium stabilisieren, Aufmerksamkeit zurückholen, Körperbasis aufbauen.',
      startDate: t,
      endDate: addDays(t, 90),
      milestones: [
        { id: 'ms_1', title: 'Erste Klausurphase beginnt', date: addDays(t, 34) },
        { id: 'ms_2', title: 'Thesis-Exposé beim Betreuer', date: addDays(t, 21) },
        { id: 'ms_3', title: 'Uni-Zahlung fällig', date: addDays(t, 12) },
        { id: 'ms_4', title: 'Krakau-Reise', date: addDays(t, 58) },
      ],
      notNow: [
        'Neue Sprache anfangen (Französisch wartet auf die nächste Saison)',
        'Podcast oder Newsletter starten',
        'Umzug in eine andere Stadt planen',
        'Größeres Musikprojekt mit Release-Termin',
      ],
    },

    areas: AREAS,

    goals: [
      {
        id: 'goal_exams',
        title: 'Sechs offene Klausuren bestmöglich vorbereiten',
        detail: 'Nicht perfekt, aber ehrlich vorbereitet — mit Plan statt Panik.',
        areaId: 'study',
        horizon: 'season',
        status: 'moving',
        progress: 18,
        createdAt: now,
      },
      {
        id: 'goal_thesis',
        title: 'Thesis strukturieren und konsequent voranbringen',
        detail: 'Gliederung, Betreuer, Quellenbasis. Jede Woche ein sichtbarer Schritt.',
        areaId: 'study',
        horizon: 'season',
        status: 'moving',
        progress: 12,
        createdAt: now,
      },
      {
        id: 'goal_attention',
        title: 'Doomscrolling stark reduzieren',
        detail: 'Morgen und Abend ohne Feed. Das Telefon schläft außerhalb des Zimmers.',
        areaId: 'attention',
        horizon: 'season',
        status: 'moving',
        progress: 30,
        createdAt: now,
      },
      {
        id: 'goal_training',
        title: 'Drei Trainingseinheiten pro Woche',
        detail: 'Zwei Kraft, eine Ausdauer. Regelmäßigkeit vor Intensität.',
        areaId: 'body',
        horizon: 'season',
        status: 'moving',
        progress: 40,
        createdAt: now,
      },
      {
        id: 'goal_education',
        title: 'Italienisch oder Lesen als kleine tägliche Bildungspraxis',
        detail: 'Zehn Minuten Sprache oder zwanzig Seiten. Beides zählt.',
        areaId: 'culture',
        horizon: 'season',
        status: 'moving',
        progress: 25,
        createdAt: now,
      },
      {
        id: 'goal_body_comp',
        title: 'Circa 16 % Körperfettanteil, gesund erreicht',
        detail: 'Über die Saison hinaus. Kein Crash, keine Verbote.',
        areaId: 'body',
        horizon: 'year',
        status: 'open',
        progress: 20,
        createdAt: now,
      },
      {
        id: 'goal_social',
        title: 'Eine soziale Initiative pro Woche',
        detail: 'Einladen, anrufen, vorbeikommen — nicht warten.',
        areaId: 'relationships',
        horizon: 'season',
        status: 'moving',
        progress: 35,
        createdAt: now,
      },
    ],

    projects: [
      {
        id: 'proj_thesis',
        title: 'Thesis: Struktur und Exposé',
        why: 'Der Abschluss hängt daran, und ein klarer Aufbau nimmt die Angst.',
        areaId: 'study',
        outcome: 'Gliederung steht, Exposé ist beim Betreuer, zwanzig Quellen gesichtet.',
        nextAction: 'Drei Gliederungsvarianten auf Papier skizzieren (45 Min.)',
        timeframe: 'Bis Ende der Saison',
        status: 'active',
        rating: { meaning: 5, energy: 3, learning: 4, feasibility: 4 },
        createdAt: now,
      },
      {
        id: 'proj_exams',
        title: 'Klausurphase vorbereiten',
        why: 'Sechs Prüfungen brauchen einen Plan, sonst wird es der letzte Abend.',
        areaId: 'study',
        outcome: 'Für jede Klausur ein Lernplan mit Terminen und Altklausuren.',
        nextAction: 'Alle sechs Prüfungstermine in den Kalender eintragen',
        timeframe: 'Nächste zwei Wochen',
        status: 'active',
        rating: { meaning: 5, energy: 2, learning: 3, feasibility: 5 },
        createdAt: now,
      },
      {
        id: 'proj_training',
        title: 'Trainingsbasis aufbauen',
        why: 'Ein Körper, der trägt, macht alles andere leichter.',
        areaId: 'body',
        outcome: 'Zwölf Wochen mit je drei Einheiten, sauber protokolliert.',
        nextAction: 'Trainingsplan für Woche 1–4 aufschreiben',
        timeframe: 'Zwölf Wochen',
        status: 'active',
        rating: { meaning: 4, energy: 4, learning: 3, feasibility: 5 },
        createdAt: now,
      },
      {
        id: 'proj_internship',
        title: 'Praktikums-Pipeline',
        why: 'Richtung testet man nur, indem man irgendwo mitarbeitet.',
        areaId: 'study',
        outcome: 'Zehn Häuser recherchiert, fünf Bewerbungen raus, zwei Gespräche.',
        nextAction: 'Liste mit zehn interessanten Häusern anlegen',
        timeframe: 'Diese Saison',
        status: 'exploring',
        rating: { meaning: 4, energy: 3, learning: 5, feasibility: 4 },
        createdAt: now,
      },
      {
        id: 'proj_krakau',
        title: 'Krakau vorbereiten',
        why: 'Eine Reise, die gut vorbereitet ist, wird eine Reise und keine Aufgabe.',
        areaId: 'daily',
        outcome: 'Papiere, Unterkunft, Route und eine kleine Leseliste stehen.',
        nextAction: 'Ausweis- und Versicherungsunterlagen prüfen',
        timeframe: 'Bis in acht Wochen',
        status: 'active',
        rating: { meaning: 3, energy: 5, learning: 3, feasibility: 5 },
        createdAt: now,
      },
      {
        id: 'proj_paint',
        title: 'Kleine Malserie: sechs Blätter',
        why: 'Etwas mit den Händen machen, ohne dass es nützlich sein muss.',
        areaId: 'creativity',
        outcome: 'Sechs Arbeiten auf Papier, gerahmt oder nicht — egal.',
        nextAction: 'Material sichten und den Tisch am Fenster freiräumen',
        timeframe: 'Offen',
        status: 'idea',
        rating: { meaning: 4, energy: 5, learning: 3, feasibility: 4 },
        createdAt: now,
      },
      {
        id: 'proj_venture',
        title: 'Ein kleines eigenes Einkommensexperiment',
        why: 'Ich will einmal erleben, wie es ist, für eigene Arbeit bezahlt zu werden.',
        areaId: 'ventures',
        outcome: 'Ein erstes bezahltes Stück Arbeit — Gestaltung, Text oder Nachhilfe.',
        nextAction: 'Drei Menschen fragen, wobei sie gerade Hilfe brauchen',
        timeframe: 'Offen — nach den Klausuren',
        status: 'exploring',
        rating: { meaning: 4, energy: 4, learning: 5, feasibility: 3 },
        createdAt: now,
      },
      {
        id: 'proj_ableton',
        title: 'Ableton: drei Skizzen fertig machen',
        why: 'Angefangene Skizzen belasten mehr, als sie freuen.',
        areaId: 'creativity',
        outcome: 'Drei Stücke exportiert — nicht perfekt, aber abgeschlossen.',
        nextAction: 'Projektordner sortieren und die drei besten Skizzen auswählen',
        timeframe: 'Offen',
        status: 'paused',
        rating: { meaning: 3, energy: 4, learning: 4, feasibility: 3 },
        createdAt: now,
      },
    ],

    tasks: [
      {
        id: 'task_1',
        title: 'Thesis-Gliederung: drei Varianten skizzieren',
        areaId: 'study',
        projectId: 'proj_thesis',
        lane: 'duty',
        date: t,
        isOneThing: true,
        done: false,
        createdAt: now,
      },
      {
        id: 'task_2',
        title: 'Krafttraining — Unterkörper',
        areaId: 'body',
        projectId: 'proj_training',
        lane: 'body',
        date: t,
        done: false,
        createdAt: now,
      },
      {
        id: 'task_3',
        title: 'Zehn Minuten Italienisch',
        areaId: 'culture',
        lane: 'mind',
        date: t,
        done: false,
        createdAt: now,
      },
      {
        id: 'task_4',
        title: 'Uni-Zahlung überweisen',
        areaId: 'daily',
        lane: 'duty',
        done: false,
        createdAt: now,
      },
      {
        id: 'task_5',
        title: 'Altklausuren für Statistik sammeln',
        areaId: 'study',
        projectId: 'proj_exams',
        lane: 'duty',
        done: false,
        createdAt: now,
      },
      {
        id: 'task_6',
        title: 'Jonas anrufen — er hat sich zweimal gemeldet',
        areaId: 'relationships',
        lane: 'mind',
        done: false,
        createdAt: now,
      },
    ],

    inbox: [
      {
        id: 'inbox_1',
        text: 'Vielleicht ein kleines Zine über die Kirchen der Altstadt?',
        kind: 'idea',
        state: 'open',
        createdAt: now,
      },
      {
        id: 'inbox_2',
        text: 'Sorge: Ob die Klausurphase zeitlich überhaupt aufgeht.',
        kind: 'worry',
        state: 'open',
        createdAt: now,
      },
      {
        id: 'inbox_3',
        text: 'Italienischen Gesprächspartner suchen (Tandem an der Uni?)',
        kind: 'goal',
        state: 'open',
        createdAt: now,
      },
    ],

    habits: [
      { id: 'habit_1', title: 'Morgen ohne Feed', areaId: 'attention', cadence: 'daily', log: [] },
      { id: 'habit_2', title: 'Morgengebet', areaId: 'faith', cadence: 'daily', log: [] },
      { id: 'habit_3', title: 'Zehn Minuten Italienisch', areaId: 'culture', cadence: 'daily', log: [] },
      { id: 'habit_4', title: 'Spaziergang ohne Kopfhörer', areaId: 'attention', cadence: 'daily', log: [] },
      { id: 'habit_5', title: 'Training', areaId: 'body', cadence: 'weekly', weeklyTarget: 3, log: [] },
      { id: 'habit_6', title: 'Soziale Initiative', areaId: 'relationships', cadence: 'weekly', weeklyTarget: 1, log: [] },
      { id: 'habit_7', title: 'Sonntagsmesse', areaId: 'faith', cadence: 'weekly', weeklyTarget: 1, log: [] },
      { id: 'habit_8', title: 'Kreative Session', areaId: 'creativity', cadence: 'weekly', weeklyTarget: 2, log: [] },
      { id: 'habit_9', title: 'Zimmer und Wäsche', areaId: 'daily', cadence: 'weekly', weeklyTarget: 1, log: [] },
    ],

    days: {
      [t]: {
        date: t,
        intention: '',
        mind: '',
        goodMoment: '',
        attention: {
          morningNoFeed: false,
          focusBlock: false,
          movement: false,
          noDoomscroll: false,
          eveningNoFeed: false,
        },
      },
    },

    journal: [
      {
        id: 'journal_1',
        title: 'Anfang',
        body: 'Ich richte dieses System ein, weil ich nicht mehr aus Reflexen leben will. Kein Wettbewerb, keine Punkte. Nur ein Ort, an dem alles zusammenkommt: Studium, Körper, Glaube, Menschen, Kunst. Wenn ich in einem Jahr zurückblicke, will ich sehen, dass ich anwesend war.',
        template: 'free',
        tags: ['anfang', 'klarheit'],
        energy: 3,
        mood: 4,
        createdAt: now,
      },
    ],

    events: [
      { id: 'ev_1', title: 'Vorlesung Statistik', kind: 'study', date: week, start: '10:00', end: '12:00' },
      { id: 'ev_2', title: 'Fokusblock Thesis', kind: 'study', date: week, start: '14:00', end: '16:00', demanding: true },
      { id: 'ev_3', title: 'Krafttraining', kind: 'training', date: addDays(week, 1), start: '18:00', end: '19:15' },
      { id: 'ev_4', title: 'Lernblock Klausur I', kind: 'study', date: addDays(week, 2), start: '09:00', end: '12:00', demanding: true },
      { id: 'ev_5', title: 'Atelierzeit', kind: 'creative', date: addDays(week, 2), start: '19:00', end: '21:00' },
      { id: 'ev_6', title: 'Krafttraining', kind: 'training', date: addDays(week, 3), start: '18:00', end: '19:15' },
      { id: 'ev_7', title: 'Abendessen mit Jonas', kind: 'social', date: addDays(week, 4), start: '19:30' },
      { id: 'ev_8', title: 'Lauf am Fluss', kind: 'training', date: addDays(week, 5), start: '09:00' },
      { id: 'ev_9', title: 'Ausstellung: Zeichnungen', kind: 'culture', date: addDays(week, 5), start: '15:00' },
      { id: 'ev_10', title: 'Messe', kind: 'faith', date: addDays(week, 6), start: '10:00' },
      { id: 'ev_11', title: 'Wochenreview', kind: 'admin', date: addDays(week, 6), start: '18:00' },
    ],

    contacts: [
      { id: 'c_1', name: 'Jonas', circle: 'close', lastMet: addDays(t, -19), nextStep: 'Zum Kochen einladen', note: 'Hat zweimal geschrieben — ich war dran.' },
      { id: 'c_2', name: 'Marek', circle: 'close', lastMet: addDays(t, -6), nextStep: 'Spaziergang am Sonntag' },
      { id: 'c_3', name: 'Eltern', circle: 'family', lastMet: addDays(t, -11), nextStep: 'Sonntags anrufen' },
      { id: 'c_4', name: 'Oma', circle: 'family', lastMet: addDays(t, -40), nextStep: 'Postkarte schreiben', note: 'Freut sich über Handgeschriebenes.' },
      { id: 'c_5', name: 'Lena (Uni-Bibliothek)', circle: 'new', lastMet: addDays(t, -3), nextStep: 'Auf einen Kaffee fragen' },
      { id: 'c_6', name: 'Sofia', circle: 'dating', lastMet: addDays(t, -8), nextStep: 'Ausstellung vorschlagen', note: 'Offen und ehrlich bleiben.' },
    ],

    exams: [
      { id: 'ex_1', title: 'Statistik II', date: addDays(t, 38), weight: '6 ECTS', status: 'learning', plan: 'Altklausuren ab Woche 3, wöchentlich ein Kapitel.', nextStep: 'Altklausuren sammeln' },
      { id: 'ex_2', title: 'Makroökonomie', date: addDays(t, 41), weight: '6 ECTS', status: 'planned', plan: 'Skript in sechs Blöcke teilen.', nextStep: 'Skript ausdrucken und teilen' },
      { id: 'ex_3', title: 'Wirtschaftsrecht', date: addDays(t, 45), weight: '5 ECTS', status: 'planned', plan: 'Fälle statt Auswendiglernen.', nextStep: 'Fallsammlung besorgen' },
      { id: 'ex_4', title: 'Rechnungswesen', date: addDays(t, 48), weight: '5 ECTS', status: 'planned', plan: 'Übungsaufgaben in Blöcken.', nextStep: 'Übungsblätter sortieren' },
      { id: 'ex_5', title: 'Marketing', date: addDays(t, 52), weight: '5 ECTS', status: 'planned', plan: 'Zusammenfassung schreiben statt lesen.', nextStep: 'Gliederung der Zusammenfassung' },
      { id: 'ex_6', title: 'Ethik der Wirtschaft', date: addDays(t, 55), weight: '4 ECTS', status: 'planned', plan: 'Primärtexte lesen, Notizen führen.', nextStep: 'Leseliste anlegen' },
    ],

    applications: [
      { id: 'app_1', company: 'Redaktionshaus Nord', role: 'Praktikum Gestaltung', status: 'research', nextAction: 'Portfolio-Anforderungen prüfen' },
      { id: 'app_2', company: 'Studio Vier', role: 'Werkstudent Design', status: 'preparing', deadline: addDays(t, 25), nextAction: 'Anschreiben entwerfen' },
      { id: 'app_3', company: 'Mittelständische Bank', role: 'Praktikum Corporate Finance', status: 'applied', contact: 'Frau Hoffmann', nextAction: 'In zwei Wochen freundlich nachfragen' },
    ],

    weekReviews: [],
    monthReflections: [],

    library: [
      { id: 'lib_1', title: 'Die Wiederentdeckung der Langsamkeit', kind: 'book', author: 'Sten Nadolny', note: 'Über Geduld als Fähigkeit.', createdAt: now },
      { id: 'lib_2', title: 'Bekenntnisse', kind: 'book', author: 'Augustinus', note: 'Unruhig ist unser Herz, bis es ruht in dir.', createdAt: now },
      { id: 'lib_3', title: '„Die Aufmerksamkeit ist die seltenste und reinste Form der Großzügigkeit.“', kind: 'quote', author: 'Simone Weil', createdAt: now },
      { id: 'lib_4', title: 'Morandi, Stillleben', kind: 'art', note: 'Wenige Gegenstände, endlos variiert.', createdAt: now },
      { id: 'lib_5', title: 'Krakau, Kazimierz', kind: 'place', note: 'Im Herbst, morgens, wenn die Cafés aufmachen.', createdAt: now },
    ],

    lived: [
      { id: 'lv_1', title: 'Nachtzug nach Wien', kind: 'travel', date: addDays(t, -220), note: 'Zwei Stunden am Fenster, ohne Telefon.' },
      { id: 'lv_2', title: 'Gespräch mit dem Nachbarn über seinen Garten', kind: 'encounter', date: addDays(t, -30) },
      { id: 'lv_3', title: 'Regen am offenen Fenster, ohne etwas zu tun', kind: 'moment', date: addDays(t, -9) },
    ],

    finances: {
      income: [
        { id: 'fin_1', label: 'Werkstudentenjob', amount: 640 },
        { id: 'fin_2', label: 'Unterstützung Familie', amount: 350 },
      ],
      fixed: [
        { id: 'fix_1', label: 'Miete', amount: 480 },
        { id: 'fix_2', label: 'Krankenversicherung', amount: 125 },
        { id: 'fix_3', label: 'Handy & Internet', amount: 35 },
        { id: 'fix_4', label: 'Fitnessstudio', amount: 29 },
      ],
      savingsGoal: { label: 'Rücklage & Krakau', target: 1500, saved: 420 },
      openPayments: [
        { id: 'pay_1', label: 'Semesterbeitrag', amount: 312, due: addDays(t, 12) },
        { id: 'pay_2', label: 'Zugticket Krakau', amount: 89, due: addDays(t, 30) },
      ],
    },

    focusList: [],

    weekFocus: {
      [week]: 'Die Thesis-Gliederung steht — alles andere darf diese Woche mittelmäßig sein.',
    },
  };
}

import { type LegalAreaKey } from "./legal-areas";

export type InputType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "number"
  | "file";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface WizardQuestion {
  key: string;
  question: string;
  helpText?: string;
  inputType: InputType;
  options?: QuestionOption[];
  required: boolean;
  placeholder?: string;
  condition?: {
    questionKey: string;
    value: string | string[];
  };
}

export interface SubCategoryQuestions {
  [subCategoryKey: string]: WizardQuestion[];
}

export interface LegalAreaQuestions {
  [areaKey: string]: SubCategoryQuestions;
}

// Arbeitsrecht Questions
const arbeitsrechtQuestions: SubCategoryQuestions = {
  kuendigung: [
    {
      key: "kuendigung_datum",
      question: "Wann haben Sie die Kündigung erhalten?",
      helpText: "Das genaue Datum ist wichtig für die Berechnung der 3-Wochen-Frist.",
      inputType: "date",
      required: true,
    },
    {
      key: "kuendigung_art",
      question: "Um welche Art der Kündigung handelt es sich?",
      inputType: "radio",
      options: [
        { value: "ordentlich", label: "Ordentliche Kündigung (mit Kündigungsfrist)" },
        { value: "ausserordentlich", label: "Außerordentliche/fristlose Kündigung" },
        { value: "aenderung", label: "Änderungskündigung" },
        { value: "unklar", label: "Bin mir nicht sicher" },
      ],
      required: true,
    },
    {
      key: "betriebsgroesse",
      question: "Wie viele Mitarbeiter hat Ihr Betrieb (ohne Auszubildende)?",
      helpText: "Ab 10 Mitarbeitern gilt das Kündigungsschutzgesetz.",
      inputType: "radio",
      options: [
        { value: "unter10", label: "Weniger als 10 Mitarbeiter" },
        { value: "10bis50", label: "10 bis 50 Mitarbeiter" },
        { value: "ueber50", label: "Mehr als 50 Mitarbeiter" },
        { value: "unklar", label: "Weiß ich nicht genau" },
      ],
      required: true,
    },
    {
      key: "beschaeftigung_dauer",
      question: "Wie lange sind/waren Sie im Unternehmen beschäftigt?",
      inputType: "radio",
      options: [
        { value: "unter6monate", label: "Weniger als 6 Monate" },
        { value: "6bis12monate", label: "6 bis 12 Monate" },
        { value: "1bis2jahre", label: "1 bis 2 Jahre" },
        { value: "2bis5jahre", label: "2 bis 5 Jahre" },
        { value: "ueber5jahre", label: "Mehr als 5 Jahre" },
      ],
      required: true,
    },
    {
      key: "betriebsrat",
      question: "Gibt es einen Betriebsrat in Ihrem Unternehmen?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
        { value: "unklar", label: "Weiß ich nicht" },
      ],
      required: true,
    },
    {
      key: "kuendigung_grund",
      question: "Wurde Ihnen ein Kündigungsgrund genannt?",
      inputType: "radio",
      options: [
        { value: "betriebsbedingt", label: "Ja, betriebsbedingte Gründe" },
        { value: "verhaltensbedingt", label: "Ja, verhaltensbedingte Gründe" },
        { value: "personenbedingt", label: "Ja, personenbedingte Gründe (z.B. Krankheit)" },
        { value: "kein_grund", label: "Nein, kein Grund genannt" },
      ],
      required: true,
    },
    {
      key: "besonderer_schutz",
      question: "Genießen Sie besonderen Kündigungsschutz?",
      helpText: "Bestimmte Personengruppen haben einen erweiterten Kündigungsschutz.",
      inputType: "checkbox",
      options: [
        { value: "schwanger", label: "Schwangerschaft oder Mutterschutz" },
        { value: "elternzeit", label: "Elternzeit (beantragt oder in)" },
        { value: "schwerbehindert", label: "Schwerbehindert oder gleichgestellt" },
        { value: "betriebsrat_mitglied", label: "Betriebsratsmitglied" },
        { value: "auszubildend", label: "Auszubildende/r" },
        { value: "keiner", label: "Keiner der genannten" },
      ],
      required: true,
    },
    {
      key: "zusatz_info",
      question: "Möchten Sie noch etwas zu Ihrer Situation ergänzen?",
      helpText: "Optional: Beschreiben Sie hier weitere relevante Details.",
      inputType: "textarea",
      placeholder: "z.B. Besondere Umstände, vorherige Abmahnungen, etc.",
      required: false,
    },
  ],
  abmahnung: [
    {
      key: "abmahnung_datum",
      question: "Wann haben Sie die Abmahnung erhalten?",
      inputType: "date",
      required: true,
    },
    {
      key: "abmahnung_grund",
      question: "Was ist der Grund der Abmahnung?",
      inputType: "textarea",
      placeholder: "z.B. Zu spät gekommen, Arbeitsverweigerung, etc.",
      required: true,
    },
    {
      key: "vorwurf_korrekt",
      question: "Ist der Vorwurf aus Ihrer Sicht berechtigt?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja, der Vorwurf stimmt" },
        { value: "teilweise", label: "Teilweise, aber übertrieben dargestellt" },
        { value: "nein", label: "Nein, der Vorwurf ist unberechtigt" },
      ],
      required: true,
    },
    {
      key: "vorherige_abmahnungen",
      question: "Haben Sie bereits früher Abmahnungen erhalten?",
      inputType: "radio",
      options: [
        { value: "nein", label: "Nein, das ist die erste" },
        { value: "ja_gleich", label: "Ja, wegen des gleichen Vorwurfs" },
        { value: "ja_anders", label: "Ja, aber wegen anderer Vorwürfe" },
      ],
      required: true,
    },
  ],
  lohn: [
    {
      key: "lohn_ausstehend_seit",
      question: "Seit wann steht Ihnen der Lohn zu?",
      inputType: "date",
      required: true,
    },
    {
      key: "lohn_betrag",
      question: "Wie hoch ist der ausstehende Betrag (brutto)?",
      inputType: "number",
      placeholder: "Betrag in Euro",
      required: true,
    },
    {
      key: "lohn_art",
      question: "Um welche Art von Vergütung handelt es sich?",
      inputType: "checkbox",
      options: [
        { value: "grundgehalt", label: "Reguläres Gehalt/Lohn" },
        { value: "ueberstunden", label: "Überstundenvergütung" },
        { value: "urlaub", label: "Urlaubsabgeltung" },
        { value: "bonus", label: "Bonus/Prämie" },
        { value: "provision", label: "Provision" },
        { value: "sonstiges", label: "Sonstiges" },
      ],
      required: true,
    },
    {
      key: "arbeit_erbracht",
      question: "Haben Sie die entsprechende Arbeitsleistung erbracht?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja, vollständig" },
        { value: "teilweise", label: "Teilweise" },
        { value: "krank", label: "Nein, war krankgeschrieben" },
        { value: "urlaub", label: "Nein, war im Urlaub" },
      ],
      required: true,
    },
    {
      key: "schriftlich_angemahnt",
      question: "Haben Sie den Lohn bereits schriftlich eingefordert?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
        { value: "muendlich", label: "Nur mündlich" },
      ],
      required: true,
    },
  ],
  arbeitszeugnis: [
    {
      key: "zeugnis_erhalten",
      question: "Haben Sie bereits ein Arbeitszeugnis erhalten?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein, noch keines erhalten" },
        { value: "zwischenzeugnis", label: "Nur ein Zwischenzeugnis" },
      ],
      required: true,
    },
    {
      key: "zeugnis_problem",
      question: "Was ist das Problem mit dem Zeugnis?",
      inputType: "checkbox",
      options: [
        { value: "nicht_erhalten", label: "Zeugnis nicht erhalten" },
        { value: "zu_schlecht", label: "Bewertung zu schlecht" },
        { value: "falsche_angaben", label: "Falsche Angaben/Tätigkeiten" },
        { value: "geheimcodes", label: "Verdacht auf negative Geheimcodes" },
        { value: "formfehler", label: "Formfehler (Datum, Unterschrift, etc.)" },
      ],
      required: true,
    },
    {
      key: "beschaeftigung_ende",
      question: "Wann endete Ihr Arbeitsverhältnis?",
      inputType: "date",
      required: true,
    },
  ],
  ueberstunden: [
    {
      key: "ueberstunden_anzahl",
      question: "Wie viele Überstunden sind noch unbezahlt?",
      inputType: "number",
      placeholder: "Anzahl der Stunden",
      required: true,
    },
    {
      key: "ueberstunden_zeitraum",
      question: "Aus welchem Zeitraum stammen die Überstunden?",
      inputType: "text",
      placeholder: "z.B. Januar 2024 bis März 2024",
      required: true,
    },
    {
      key: "ueberstunden_nachweis",
      question: "Können Sie die Überstunden nachweisen?",
      inputType: "radio",
      options: [
        { value: "ja_dokumentiert", label: "Ja, schriftlich dokumentiert" },
        { value: "ja_zeiterfassung", label: "Ja, über Zeiterfassungssystem" },
        { value: "teilweise", label: "Teilweise nachweisbar" },
        { value: "nein", label: "Schwierig nachzuweisen" },
      ],
      required: true,
    },
    {
      key: "ueberstunden_anordnung",
      question: "Wurden die Überstunden angeordnet oder geduldet?",
      inputType: "radio",
      options: [
        { value: "angeordnet", label: "Ausdrücklich vom Arbeitgeber angeordnet" },
        { value: "geduldet", label: "Vom Arbeitgeber geduldet/akzeptiert" },
        { value: "eigenmotivation", label: "Aus eigener Motivation" },
      ],
      required: true,
    },
    {
      key: "vertrag_regelung",
      question: "Gibt es eine Regelung zu Überstunden in Ihrem Arbeitsvertrag?",
      inputType: "radio",
      options: [
        { value: "abgegolten", label: "Überstunden sind mit dem Gehalt abgegolten" },
        { value: "verguetung", label: "Überstunden werden vergütet" },
        { value: "freizeitausgleich", label: "Überstunden werden durch Freizeit ausgeglichen" },
        { value: "keine_regelung", label: "Keine Regelung" },
        { value: "unklar", label: "Bin mir nicht sicher" },
      ],
      required: true,
    },
  ],
};

// Mietrecht Questions
const mietrechtQuestions: SubCategoryQuestions = {
  mietminderung: [
    {
      key: "mangel_art",
      question: "Welcher Mangel liegt vor?",
      inputType: "checkbox",
      options: [
        { value: "schimmel", label: "Schimmelbefall" },
        { value: "heizung", label: "Heizung defekt/unzureichend" },
        { value: "wasserschaden", label: "Wasserschaden/Feuchtigkeit" },
        { value: "laerm", label: "Lärmbelästigung (Baustelle, Nachbarn)" },
        { value: "fenster", label: "Undichte Fenster/Türen" },
        { value: "ungeziefer", label: "Ungeziefer (Kakerlaken, Mäuse, etc.)" },
        { value: "warmwasser", label: "Warmwasser fehlt/unzureichend" },
        { value: "aufzug", label: "Aufzug defekt" },
        { value: "sonstiges", label: "Sonstiges" },
      ],
      required: true,
    },
    {
      key: "mangel_seit",
      question: "Seit wann besteht der Mangel?",
      inputType: "date",
      required: true,
    },
    {
      key: "mangel_gemeldet",
      question: "Haben Sie den Mangel dem Vermieter gemeldet?",
      inputType: "radio",
      options: [
        { value: "ja_schriftlich", label: "Ja, schriftlich" },
        { value: "ja_muendlich", label: "Ja, nur mündlich" },
        { value: "nein", label: "Noch nicht" },
      ],
      required: true,
    },
    {
      key: "vermieter_reaktion",
      question: "Wie hat der Vermieter reagiert?",
      inputType: "radio",
      options: [
        { value: "keine", label: "Gar nicht" },
        { value: "abgelehnt", label: "Reparatur abgelehnt" },
        { value: "versprochen", label: "Reparatur versprochen, aber nicht umgesetzt" },
        { value: "teilweise", label: "Teilweise behoben" },
      ],
      required: true,
      condition: { questionKey: "mangel_gemeldet", value: ["ja_schriftlich", "ja_muendlich"] },
    },
    {
      key: "kaltmiete",
      question: "Wie hoch ist Ihre monatliche Kaltmiete?",
      inputType: "number",
      placeholder: "Betrag in Euro",
      required: true,
    },
  ],
  nebenkostenabrechnung: [
    {
      key: "abrechnung_erhalten",
      question: "Wann haben Sie die Nebenkostenabrechnung erhalten?",
      inputType: "date",
      required: true,
    },
    {
      key: "abrechnungszeitraum",
      question: "Für welchen Zeitraum gilt die Abrechnung?",
      inputType: "text",
      placeholder: "z.B. 01.01.2023 - 31.12.2023",
      required: true,
    },
    {
      key: "nachzahlung_hoehe",
      question: "Wie hoch ist die geforderte Nachzahlung?",
      inputType: "number",
      placeholder: "Betrag in Euro",
      required: true,
    },
    {
      key: "abrechnung_problem",
      question: "Was erscheint Ihnen problematisch?",
      inputType: "checkbox",
      options: [
        { value: "zu_spaet", label: "Abrechnung kam zu spät (nach 12 Monaten)" },
        { value: "kosten_zu_hoch", label: "Kosten erscheinen zu hoch" },
        { value: "unverstaendlich", label: "Positionen unverständlich" },
        { value: "verteilerschluessel", label: "Verteilerschlüssel unklar" },
        { value: "nicht_umlegbar", label: "Nicht umlegbare Kosten enthalten" },
        { value: "sonstiges", label: "Sonstiges" },
      ],
      required: true,
    },
  ],
  mieterhoehung: [
    {
      key: "erhoehung_datum",
      question: "Wann haben Sie die Mieterhöhung erhalten?",
      inputType: "date",
      required: true,
    },
    {
      key: "erhoehung_art",
      question: "Um welche Art der Mieterhöhung handelt es sich?",
      inputType: "radio",
      options: [
        { value: "vergleichsmiete", label: "Anpassung an ortsübliche Vergleichsmiete" },
        { value: "modernisierung", label: "Nach Modernisierung" },
        { value: "staffel", label: "Staffelmiete lt. Vertrag" },
        { value: "index", label: "Indexmiete lt. Vertrag" },
      ],
      required: true,
    },
    {
      key: "aktuelle_miete",
      question: "Wie hoch ist Ihre aktuelle Kaltmiete?",
      inputType: "number",
      placeholder: "Betrag in Euro",
      required: true,
    },
    {
      key: "neue_miete",
      question: "Wie hoch soll die neue Kaltmiete sein?",
      inputType: "number",
      placeholder: "Betrag in Euro",
      required: true,
    },
    {
      key: "letzte_erhoehung",
      question: "Wann wurde die Miete zuletzt erhöht?",
      inputType: "date",
      helpText: "Falls nie erhöht, geben Sie den Mietbeginn an.",
      required: true,
    },
  ],
  kaution: [
    {
      key: "kaution_hoehe",
      question: "Wie hoch war die gezahlte Kaution?",
      inputType: "number",
      placeholder: "Betrag in Euro",
      required: true,
    },
    {
      key: "mietende_datum",
      question: "Wann hat das Mietverhältnis geendet?",
      inputType: "date",
      required: true,
    },
    {
      key: "wohnung_zustand",
      question: "In welchem Zustand haben Sie die Wohnung übergeben?",
      inputType: "radio",
      options: [
        { value: "renoviert", label: "Frisch renoviert/gestrichen" },
        { value: "normal", label: "Normale Gebrauchsspuren" },
        { value: "schaeden", label: "Mit einzelnen Schäden" },
        { value: "unsicher", label: "Bin mir nicht sicher" },
      ],
      required: true,
    },
    {
      key: "protokoll",
      question: "Gibt es ein Übergabeprotokoll?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja, beide haben unterschrieben" },
        { value: "nur_vermieter", label: "Ja, aber nur Vermieter hat unterschrieben" },
        { value: "nein", label: "Nein" },
      ],
      required: true,
    },
    {
      key: "vermieter_grund",
      question: "Hat der Vermieter einen Grund für das Einbehalten genannt?",
      inputType: "radio",
      options: [
        { value: "schaeden", label: "Ja, Schäden in der Wohnung" },
        { value: "renovierung", label: "Ja, nicht renoviert" },
        { value: "nebenkosten", label: "Ja, offene Nebenkosten" },
        { value: "kein_grund", label: "Nein, keinen Grund genannt" },
        { value: "keine_reaktion", label: "Vermieter reagiert nicht" },
      ],
      required: true,
    },
  ],
  eigenbedarf: [
    {
      key: "kuendigung_erhalten",
      question: "Wann haben Sie die Eigenbedarfskündigung erhalten?",
      inputType: "date",
      required: true,
    },
    {
      key: "eigenbedarf_person",
      question: "Für wen wird Eigenbedarf geltend gemacht?",
      inputType: "radio",
      options: [
        { value: "vermieter", label: "Vermieter selbst" },
        { value: "familie", label: "Familienmitglied des Vermieters" },
        { value: "haushaltsangehoerig", label: "Haushaltsangehörige Person" },
        { value: "unklar", label: "Nicht eindeutig angegeben" },
      ],
      required: true,
    },
    {
      key: "wohndauer",
      question: "Wie lange wohnen Sie bereits in der Wohnung?",
      inputType: "radio",
      options: [
        { value: "unter5", label: "Weniger als 5 Jahre" },
        { value: "5bis8", label: "5 bis 8 Jahre" },
        { value: "ueber8", label: "Mehr als 8 Jahre" },
      ],
      required: true,
    },
    {
      key: "haertefall",
      question: "Liegt bei Ihnen möglicherweise ein Härtefall vor?",
      inputType: "checkbox",
      options: [
        { value: "alter", label: "Hohes Alter (über 70)" },
        { value: "krank", label: "Schwere Krankheit/Behinderung" },
        { value: "schwanger", label: "Schwangerschaft" },
        { value: "kinder", label: "Schulpflichtige Kinder" },
        { value: "lange_wohndauer", label: "Sehr lange Wohndauer (über 20 Jahre)" },
        { value: "keiner", label: "Keiner der genannten" },
      ],
      required: true,
    },
  ],
};

// Verkehrsrecht Questions
const verkehrsrechtQuestions: SubCategoryQuestions = {
  bussgeld: [
    {
      key: "bescheid_datum",
      question: "Wann haben Sie den Bußgeldbescheid erhalten?",
      helpText: "Wichtig: Sie haben 2 Wochen Zeit für einen Einspruch!",
      inputType: "date",
      required: true,
    },
    {
      key: "verstoss_art",
      question: "Um welchen Verstoß handelt es sich?",
      inputType: "radio",
      options: [
        { value: "geschwindigkeit", label: "Geschwindigkeitsüberschreitung" },
        { value: "rotlicht", label: "Rotlichtverstoß" },
        { value: "abstand", label: "Abstandsverstoß" },
        { value: "parken", label: "Parkverstoß" },
        { value: "handy", label: "Handyverstoß" },
        { value: "alkohol", label: "Alkohol/Drogen am Steuer" },
        { value: "sonstiges", label: "Sonstiges" },
      ],
      required: true,
    },
    {
      key: "bussgeld_hoehe",
      question: "Wie hoch ist das Bußgeld?",
      inputType: "number",
      placeholder: "Betrag in Euro",
      required: true,
    },
    {
      key: "punkte",
      question: "Werden Punkte in Flensburg angedroht?",
      inputType: "radio",
      options: [
        { value: "0", label: "Keine Punkte" },
        { value: "1", label: "1 Punkt" },
        { value: "2", label: "2 Punkte" },
        { value: "unklar", label: "Weiß ich nicht" },
      ],
      required: true,
    },
    {
      key: "fahrverbot",
      question: "Wird ein Fahrverbot angedroht?",
      inputType: "radio",
      options: [
        { value: "nein", label: "Nein" },
        { value: "1monat", label: "Ja, 1 Monat" },
        { value: "2monate", label: "Ja, 2 Monate" },
        { value: "3monate", label: "Ja, 3 Monate" },
      ],
      required: true,
    },
    {
      key: "einspruch_grund",
      question: "Warum möchten Sie Einspruch einlegen?",
      inputType: "checkbox",
      options: [
        { value: "nicht_gefahren", label: "Ich war nicht der Fahrer" },
        { value: "messfehler", label: "Vermute Messfehler" },
        { value: "beschilderung", label: "Unklare/fehlende Beschilderung" },
        { value: "notfall", label: "Notfall/Ausnahmesituation" },
        { value: "fahrverbot_haerte", label: "Fahrverbot wäre existenzbedrohend" },
        { value: "sonstiges", label: "Sonstiger Grund" },
      ],
      required: true,
    },
  ],
  fahrverbot: [
    {
      key: "fahrverbot_grund",
      question: "Weshalb droht das Fahrverbot?",
      inputType: "radio",
      options: [
        { value: "geschwindigkeit", label: "Geschwindigkeitsüberschreitung" },
        { value: "rotlicht", label: "Rotlichtverstoß" },
        { value: "alkohol", label: "Alkohol am Steuer" },
        { value: "punkte", label: "Zu viele Punkte" },
        { value: "sonstiges", label: "Sonstiger Verstoß" },
      ],
      required: true,
    },
    {
      key: "fahrverbot_dauer",
      question: "Wie lange soll das Fahrverbot dauern?",
      inputType: "radio",
      options: [
        { value: "1monat", label: "1 Monat" },
        { value: "2monate", label: "2 Monate" },
        { value: "3monate", label: "3 Monate" },
        { value: "laenger", label: "Länger als 3 Monate" },
      ],
      required: true,
    },
    {
      key: "beruflich_angewiesen",
      question: "Sind Sie beruflich auf den Führerschein angewiesen?",
      inputType: "radio",
      options: [
        { value: "ja_beruf", label: "Ja, zwingend für meinen Beruf" },
        { value: "ja_pendelweg", label: "Ja, für den Arbeitsweg" },
        { value: "nein", label: "Nein, nicht zwingend" },
      ],
      required: true,
    },
    {
      key: "vorbelastung",
      question: "Haben Sie Vorbelastungen (frühere Verstöße)?",
      inputType: "radio",
      options: [
        { value: "nein", label: "Nein, keine" },
        { value: "geringfuegig", label: "Nur geringfügige Verstöße" },
        { value: "ja", label: "Ja, relevante Verstöße" },
      ],
      required: true,
    },
  ],
  unfallregulierung: [
    {
      key: "unfall_datum",
      question: "Wann hat sich der Unfall ereignet?",
      inputType: "date",
      required: true,
    },
    {
      key: "unfallrolle",
      question: "Was war Ihre Rolle bei dem Unfall?",
      inputType: "radio",
      options: [
        { value: "geschaedigter", label: "Geschädigter (keine Schuld)" },
        { value: "teilschuld", label: "Teilschuld" },
        { value: "verursacher", label: "Unfallverursacher" },
        { value: "unklar", label: "Schuldfrage noch unklar" },
      ],
      required: true,
    },
    {
      key: "polizei",
      question: "War die Polizei vor Ort?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
      ],
      required: true,
    },
    {
      key: "schaden_art",
      question: "Welche Schäden sind entstanden?",
      inputType: "checkbox",
      options: [
        { value: "fahrzeug", label: "Fahrzeugschaden" },
        { value: "person", label: "Personenschaden" },
        { value: "sach", label: "Sonstiger Sachschaden" },
      ],
      required: true,
    },
    {
      key: "versicherung_kontakt",
      question: "Haben Sie die Versicherung bereits kontaktiert?",
      inputType: "radio",
      options: [
        { value: "ja_zahlt", label: "Ja, Regulierung läuft" },
        { value: "ja_ablehnt", label: "Ja, aber Zahlung wird abgelehnt/gekürzt" },
        { value: "nein", label: "Noch nicht" },
      ],
      required: true,
    },
  ],
  punkte: [
    {
      key: "aktuelle_punkte",
      question: "Wie viele Punkte haben Sie aktuell in Flensburg?",
      inputType: "radio",
      options: [
        { value: "1bis3", label: "1-3 Punkte" },
        { value: "4bis5", label: "4-5 Punkte" },
        { value: "6bis7", label: "6-7 Punkte" },
        { value: "8plus", label: "8 oder mehr Punkte" },
        { value: "unklar", label: "Weiß ich nicht genau" },
      ],
      required: true,
    },
    {
      key: "entzug_droht",
      question: "Droht Ihnen der Führerscheinentzug?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
        { value: "unklar", label: "Nicht sicher" },
      ],
      required: true,
    },
    {
      key: "anliegen",
      question: "Was möchten Sie erreichen?",
      inputType: "checkbox",
      options: [
        { value: "auskunft", label: "Punktestand erfahren" },
        { value: "abbau", label: "Punkte abbauen (Seminar)" },
        { value: "loeschung", label: "Unberechtigte Punkte löschen" },
        { value: "beratung", label: "Beratung zur Situation" },
      ],
      required: true,
    },
  ],
};

// Add more legal area questions...
const datenschutzQuestions: SubCategoryQuestions = {
  "dsgvo-verstoss": [
    {
      key: "verstoss_art",
      question: "Um welche Art von Datenschutzverstoß handelt es sich?",
      inputType: "checkbox",
      options: [
        { value: "datenweitergabe", label: "Unerlaubte Datenweitergabe" },
        { value: "werbung", label: "Unerwünschte Werbung/Spam" },
        { value: "datenleck", label: "Datenleck/Datenpanne" },
        { value: "videoüberwachung", label: "Unerlaubte Videoüberwachung" },
        { value: "tracking", label: "Unerlaubtes Tracking/Cookies" },
        { value: "sonstiges", label: "Sonstiges" },
      ],
      required: true,
    },
    {
      key: "verantwortlicher",
      question: "Wer ist für den Verstoß verantwortlich?",
      inputType: "text",
      placeholder: "Name des Unternehmens/der Organisation",
      required: true,
    },
    {
      key: "schaden",
      question: "Ist Ihnen ein Schaden entstanden?",
      inputType: "radio",
      options: [
        { value: "ja_materiell", label: "Ja, materieller Schaden" },
        { value: "ja_immateriell", label: "Ja, immaterieller Schaden (z.B. Stress)" },
        { value: "beides", label: "Beides" },
        { value: "nein", label: "Nein, kein konkreter Schaden" },
      ],
      required: true,
    },
  ],
  auskunft: [
    {
      key: "unternehmen",
      question: "Bei welchem Unternehmen möchten Sie Auskunft verlangen?",
      inputType: "text",
      placeholder: "Name des Unternehmens",
      required: true,
    },
    {
      key: "bereits_angefragt",
      question: "Haben Sie bereits eine Auskunft angefragt?",
      inputType: "radio",
      options: [
        { value: "nein", label: "Nein, noch nicht" },
        { value: "ja_keine_antwort", label: "Ja, aber keine Antwort erhalten" },
        { value: "ja_unvollstaendig", label: "Ja, aber Antwort unvollständig" },
        { value: "ja_abgelehnt", label: "Ja, wurde abgelehnt" },
      ],
      required: true,
    },
  ],
  loeschung: [
    {
      key: "daten_art",
      question: "Welche Daten sollen gelöscht werden?",
      inputType: "checkbox",
      options: [
        { value: "kundendaten", label: "Kundendaten/Account" },
        { value: "fotos", label: "Fotos/Videos" },
        { value: "bewertungen", label: "Bewertungen/Kommentare" },
        { value: "suchergebnisse", label: "Suchmaschinenergebnisse" },
        { value: "sonstiges", label: "Sonstige personenbezogene Daten" },
      ],
      required: true,
    },
    {
      key: "bereits_angefragt",
      question: "Haben Sie die Löschung bereits angefragt?",
      inputType: "radio",
      options: [
        { value: "nein", label: "Nein" },
        { value: "ja_ignoriert", label: "Ja, aber ignoriert" },
        { value: "ja_abgelehnt", label: "Ja, aber abgelehnt" },
      ],
      required: true,
    },
  ],
  "schadensersatz-dsgvo": [
    {
      key: "verstoss_beschreibung",
      question: "Was ist passiert? Beschreiben Sie den Vorfall.",
      inputType: "textarea",
      placeholder: "Beschreiben Sie, wie Ihre Daten missbraucht wurden...",
      required: true,
    },
    {
      key: "schaden_art",
      question: "Welcher Schaden ist Ihnen entstanden?",
      inputType: "checkbox",
      options: [
        { value: "finanziell", label: "Finanzieller Schaden" },
        { value: "rufschaedigung", label: "Rufschädigung" },
        { value: "identitaetsdiebstahl", label: "Identitätsdiebstahl" },
        { value: "psychisch", label: "Psychische Belastung/Stress" },
        { value: "zeitaufwand", label: "Erheblicher Zeitaufwand" },
      ],
      required: true,
    },
    {
      key: "nachweise",
      question: "Können Sie den Schaden nachweisen?",
      inputType: "radio",
      options: [
        { value: "ja", label: "Ja, habe Nachweise" },
        { value: "teilweise", label: "Teilweise" },
        { value: "nein", label: "Schwierig nachzuweisen" },
      ],
      required: true,
    },
  ],
};

// Combine all questions
export const wizardQuestions: LegalAreaQuestions = {
  arbeitsrecht: arbeitsrechtQuestions,
  mietrecht: mietrechtQuestions,
  verkehrsrecht: verkehrsrechtQuestions,
  datenschutz: datenschutzQuestions,
  // Simplified questions for other areas - can be expanded
  digitales: {
    "account-sperre": [
      {
        key: "plattform",
        question: "Welche Plattform hat Ihren Account gesperrt?",
        inputType: "radio",
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "facebook", label: "Facebook" },
          { value: "tiktok", label: "TikTok" },
          { value: "youtube", label: "YouTube" },
          { value: "x", label: "X (Twitter)" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "sonstige", label: "Andere Plattform" },
        ],
        required: true,
      },
      {
        key: "sperre_datum",
        question: "Wann wurde Ihr Account gesperrt?",
        inputType: "date",
        required: true,
      },
      {
        key: "sperre_grund",
        question: "Wurde ein Grund für die Sperre genannt?",
        inputType: "radio",
        options: [
          { value: "community_richtlinien", label: "Verstoß gegen Community-Richtlinien" },
          { value: "fake_account", label: "Verdacht auf Fake-Account" },
          { value: "spam", label: "Spam-Verdacht" },
          { value: "kein_grund", label: "Kein Grund genannt" },
          { value: "sonstiges", label: "Sonstiger Grund" },
        ],
        required: true,
      },
      {
        key: "einspruch",
        question: "Haben Sie bereits Einspruch eingelegt?",
        inputType: "radio",
        options: [
          { value: "ja_abgelehnt", label: "Ja, wurde abgelehnt" },
          { value: "ja_keine_antwort", label: "Ja, keine Antwort" },
          { value: "nein", label: "Noch nicht" },
        ],
        required: true,
      },
      {
        key: "account_wert",
        question: "Hat der Account einen besonderen Wert für Sie?",
        inputType: "checkbox",
        options: [
          { value: "gewerblich", label: "Gewerbliche Nutzung/Influencer" },
          { value: "viele_follower", label: "Viele Follower (>1000)" },
          { value: "erinnerungen", label: "Persönliche Erinnerungen/Fotos" },
          { value: "kontakte", label: "Wichtige Kontakte" },
          { value: "keiner", label: "Normaler privater Account" },
        ],
        required: true,
      },
    ],
    "bewertung-loeschen": [
      {
        key: "plattform",
        question: "Auf welcher Plattform wurde die Bewertung veröffentlicht?",
        inputType: "radio",
        options: [
          { value: "google", label: "Google" },
          { value: "kununu", label: "Kununu" },
          { value: "trustpilot", label: "Trustpilot" },
          { value: "yelp", label: "Yelp" },
          { value: "sonstige", label: "Andere Plattform" },
        ],
        required: true,
      },
      {
        key: "bewertung_inhalt",
        question: "Was ist problematisch an der Bewertung?",
        inputType: "checkbox",
        options: [
          { value: "unwahr", label: "Unwahre Tatsachenbehauptungen" },
          { value: "beleidigung", label: "Beleidigungen" },
          { value: "fake", label: "Fake-Bewertung (kein echter Kunde)" },
          { value: "verwechslung", label: "Verwechslung (falsches Unternehmen)" },
          { value: "veraltet", label: "Völlig veraltete Situation" },
        ],
        required: true,
      },
    ],
    filesharing: [
      {
        key: "abmahnung_datum",
        question: "Wann haben Sie die Abmahnung erhalten?",
        inputType: "date",
        required: true,
      },
      {
        key: "forderung_hoehe",
        question: "Wie hoch ist die geforderte Summe?",
        inputType: "number",
        placeholder: "Betrag in Euro",
        required: true,
      },
      {
        key: "inhalt_art",
        question: "Um welche Art von Inhalt geht es?",
        inputType: "radio",
        options: [
          { value: "film", label: "Film" },
          { value: "serie", label: "Serie" },
          { value: "musik", label: "Musik" },
          { value: "software", label: "Software/Spiele" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
      {
        key: "download_bestritten",
        question: "Haben Sie den Download durchgeführt?",
        inputType: "radio",
        options: [
          { value: "ja", label: "Ja" },
          { value: "nein", label: "Nein, bestimmt nicht" },
          { value: "unsicher", label: "Nicht sicher / Andere Person im Haushalt" },
        ],
        required: true,
      },
    ],
    "recht-vergessen": [
      {
        key: "inhalt_art",
        question: "Welche Art von Inhalt soll entfernt werden?",
        inputType: "checkbox",
        options: [
          { value: "suchergebnisse", label: "Suchmaschinenergebnisse" },
          { value: "artikel", label: "Online-Artikel" },
          { value: "fotos", label: "Fotos/Videos" },
          { value: "social_media", label: "Social-Media-Beiträge" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
      {
        key: "grund",
        question: "Warum soll der Inhalt entfernt werden?",
        inputType: "checkbox",
        options: [
          { value: "veraltet", label: "Veraltete/nicht mehr aktuelle Information" },
          { value: "falsch", label: "Falsche/unwahre Information" },
          { value: "privat", label: "Sehr private Information" },
          { value: "rufschaedigend", label: "Rufschädigend" },
        ],
        required: true,
      },
    ],
  },
  verbraucherrecht: {
    widerruf: [
      {
        key: "kauf_datum",
        question: "Wann haben Sie den Kauf getätigt?",
        inputType: "date",
        required: true,
      },
      {
        key: "kaufart",
        question: "Wo haben Sie gekauft?",
        inputType: "radio",
        options: [
          { value: "online", label: "Online-Shop" },
          { value: "telefon", label: "Telefonisch" },
          { value: "haustuer", label: "An der Haustür" },
          { value: "laden", label: "Im Laden vor Ort" },
        ],
        required: true,
      },
      {
        key: "widerruf_versucht",
        question: "Haben Sie den Widerruf bereits erklärt?",
        inputType: "radio",
        options: [
          { value: "nein", label: "Noch nicht" },
          { value: "ja_ignoriert", label: "Ja, wird ignoriert" },
          { value: "ja_abgelehnt", label: "Ja, wurde abgelehnt" },
        ],
        required: true,
      },
    ],
    gewaehrleistung: [
      {
        key: "kauf_datum",
        question: "Wann haben Sie das Produkt gekauft?",
        inputType: "date",
        required: true,
      },
      {
        key: "mangel_art",
        question: "Was ist das Problem mit dem Produkt?",
        inputType: "textarea",
        placeholder: "Beschreiben Sie den Mangel...",
        required: true,
      },
      {
        key: "mangel_zeitpunkt",
        question: "Wann ist der Mangel aufgetreten?",
        inputType: "radio",
        options: [
          { value: "sofort", label: "Sofort/bei Lieferung" },
          { value: "kurz_danach", label: "Kurz nach dem Kauf" },
          { value: "spaeter", label: "Nach längerer Nutzung" },
        ],
        required: true,
      },
    ],
    "abo-falle": [
      {
        key: "forderung_art",
        question: "Um was für eine Forderung handelt es sich?",
        inputType: "radio",
        options: [
          { value: "abo", label: "Abo-Vertrag (ungewollt abgeschlossen)" },
          { value: "inkasso", label: "Inkasso-Forderung" },
          { value: "mahnbescheid", label: "Mahnbescheid" },
          { value: "sonstiges", label: "Sonstige Forderung" },
        ],
        required: true,
      },
      {
        key: "forderung_hoehe",
        question: "Wie hoch ist die Forderung?",
        inputType: "number",
        placeholder: "Betrag in Euro",
        required: true,
      },
      {
        key: "vertrag_abgeschlossen",
        question: "Haben Sie bewusst einen Vertrag abgeschlossen?",
        inputType: "radio",
        options: [
          { value: "nein", label: "Nein, nicht bewusst" },
          { value: "getaeuscht", label: "Ja, aber getäuscht über Bedingungen" },
          { value: "ja", label: "Ja, aber möchte kündigen" },
        ],
        required: true,
      },
    ],
    fluggastrechte: [
      {
        key: "flug_datum",
        question: "Wann sollte der Flug stattfinden?",
        inputType: "date",
        required: true,
      },
      {
        key: "problem_art",
        question: "Was ist passiert?",
        inputType: "radio",
        options: [
          { value: "verspaetung", label: "Verspätung (über 3 Stunden)" },
          { value: "annullierung", label: "Flug annulliert" },
          { value: "ueberbuchung", label: "Überbuchung/Nichtbeförderung" },
          { value: "gepaeck", label: "Gepäck verloren/beschädigt" },
        ],
        required: true,
      },
      {
        key: "flugstrecke",
        question: "Wie lang war die Flugstrecke?",
        inputType: "radio",
        options: [
          { value: "kurz", label: "Bis 1.500 km" },
          { value: "mittel", label: "1.500 bis 3.500 km" },
          { value: "lang", label: "Über 3.500 km" },
        ],
        required: true,
      },
      {
        key: "airline",
        question: "Welche Airline?",
        inputType: "text",
        placeholder: "Name der Fluggesellschaft",
        required: true,
      },
    ],
    paket: [
      {
        key: "bestellung_datum",
        question: "Wann haben Sie bestellt?",
        inputType: "date",
        required: true,
      },
      {
        key: "problem_art",
        question: "Was ist das Problem?",
        inputType: "radio",
        options: [
          { value: "nicht_geliefert", label: "Paket nie angekommen" },
          { value: "beschaedigt", label: "Paket beschädigt" },
          { value: "falsch", label: "Falsches Produkt erhalten" },
          { value: "unvollstaendig", label: "Lieferung unvollständig" },
        ],
        required: true,
      },
      {
        key: "haendler_kontakt",
        question: "Haben Sie den Händler kontaktiert?",
        inputType: "radio",
        options: [
          { value: "nein", label: "Noch nicht" },
          { value: "ja_keine_antwort", label: "Ja, keine Antwort" },
          { value: "ja_ablehnung", label: "Ja, Erstattung/Ersatz abgelehnt" },
        ],
        required: true,
      },
    ],
  },
  behoerden: {
    "widerspruch-bescheid": [
      {
        key: "behoerde",
        question: "Von welcher Behörde stammt der Bescheid?",
        inputType: "radio",
        options: [
          { value: "jobcenter", label: "Jobcenter" },
          { value: "bafoeg", label: "BAföG-Amt" },
          { value: "kindergeld", label: "Familienkasse (Kindergeld)" },
          { value: "auslaenderbehoerde", label: "Ausländerbehörde" },
          { value: "sonstige", label: "Andere Behörde" },
        ],
        required: true,
      },
      {
        key: "bescheid_datum",
        question: "Wann haben Sie den Bescheid erhalten?",
        helpText: "Die Widerspruchsfrist beträgt in der Regel 1 Monat!",
        inputType: "date",
        required: true,
      },
      {
        key: "widerspruch_grund",
        question: "Warum möchten Sie Widerspruch einlegen?",
        inputType: "textarea",
        placeholder: "Beschreiben Sie kurz, was aus Ihrer Sicht falsch ist...",
        required: true,
      },
    ],
    gez: [
      {
        key: "anliegen",
        question: "Um was geht es?",
        inputType: "radio",
        options: [
          { value: "befreiung", label: "Befreiung beantragen" },
          { value: "widerspruch", label: "Widerspruch gegen Bescheid" },
          { value: "rueckforderung", label: "Zu viel gezahlt, Rückforderung" },
          { value: "abmeldung", label: "Abmeldung" },
        ],
        required: true,
      },
      {
        key: "befreiungsgrund",
        question: "Aus welchem Grund sollten Sie befreit sein?",
        inputType: "checkbox",
        options: [
          { value: "empfaenger", label: "Empfänger von Sozialleistungen" },
          { value: "bafoeg", label: "BAföG-Empfänger" },
          { value: "schwerbehindert", label: "Schwerbehindert (bestimmte Merkzeichen)" },
          { value: "pflegeheim", label: "Bewohner Pflegeheim" },
          { value: "taubblind", label: "Taubblind" },
        ],
        required: true,
        condition: { questionKey: "anliegen", value: "befreiung" },
      },
    ],
    steuerbescheid: [
      {
        key: "bescheid_datum",
        question: "Wann haben Sie den Steuerbescheid erhalten?",
        helpText: "Die Einspruchsfrist beträgt 1 Monat!",
        inputType: "date",
        required: true,
      },
      {
        key: "abweichung_art",
        question: "Worin weicht der Bescheid von Ihrer Erklärung ab?",
        inputType: "checkbox",
        options: [
          { value: "werbungskosten", label: "Werbungskosten nicht anerkannt" },
          { value: "sonderausgaben", label: "Sonderausgaben nicht anerkannt" },
          { value: "einkuenfte", label: "Einkünfte falsch berechnet" },
          { value: "freibetraege", label: "Freibeträge nicht berücksichtigt" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
    ],
    akteneinsicht: [
      {
        key: "behoerde",
        question: "Bei welcher Behörde möchten Sie Akteneinsicht?",
        inputType: "text",
        placeholder: "Name der Behörde",
        required: true,
      },
      {
        key: "grund",
        question: "Warum benötigen Sie Akteneinsicht?",
        inputType: "textarea",
        placeholder: "Beschreiben Sie kurz den Hintergrund...",
        required: true,
      },
    ],
  },
  finanzen: {
    versicherung: [
      {
        key: "versicherung_art",
        question: "Um welche Versicherung handelt es sich?",
        inputType: "radio",
        options: [
          { value: "kfz", label: "KFZ-Versicherung" },
          { value: "haftpflicht", label: "Haftpflichtversicherung" },
          { value: "hausrat", label: "Hausratversicherung" },
          { value: "berufsunfaehigkeit", label: "Berufsunfähigkeitsversicherung" },
          { value: "kranken", label: "Krankenversicherung" },
          { value: "leben", label: "Lebensversicherung" },
          { value: "sonstige", label: "Sonstige" },
        ],
        required: true,
      },
      {
        key: "ablehnung_grund",
        question: "Wie begründet die Versicherung die Ablehnung?",
        inputType: "textarea",
        placeholder: "Begründung der Versicherung...",
        required: true,
      },
    ],
    schufa: [
      {
        key: "eintrag_art",
        question: "Um was für einen Eintrag handelt es sich?",
        inputType: "radio",
        options: [
          { value: "kredit", label: "Kredit/Darlehen" },
          { value: "mobilfunk", label: "Mobilfunkvertrag" },
          { value: "versandhandel", label: "Versandhandel" },
          { value: "inkasso", label: "Inkasso" },
          { value: "insolvenz", label: "Insolvenz" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
      {
        key: "loeschung_grund",
        question: "Warum sollte der Eintrag gelöscht werden?",
        inputType: "checkbox",
        options: [
          { value: "bezahlt", label: "Forderung wurde bezahlt" },
          { value: "verjahrt", label: "Forderung verjährt" },
          { value: "unberechtigt", label: "Forderung war unberechtigt" },
          { value: "frist_abgelaufen", label: "Löschfrist abgelaufen" },
          { value: "falsch", label: "Daten falsch" },
        ],
        required: true,
      },
    ],
    bankgebuehren: [
      {
        key: "gebuehr_art",
        question: "Welche Gebühren wurden berechnet?",
        inputType: "checkbox",
        options: [
          { value: "kontofuehrung", label: "Kontoführungsgebühren" },
          { value: "dispozinsen", label: "Überhöhte Dispozinsen" },
          { value: "kreditbearbeitung", label: "Kreditbearbeitungsgebühren" },
          { value: "lastschrift", label: "Lastschriftrückgabe-Gebühren" },
          { value: "sonstiges", label: "Sonstige Gebühren" },
        ],
        required: true,
      },
      {
        key: "betrag",
        question: "Wie hoch ist der Betrag, den Sie zurückfordern möchten?",
        inputType: "number",
        placeholder: "Betrag in Euro",
        required: true,
      },
    ],
    "p-konto": [
      {
        key: "anliegen",
        question: "Was möchten Sie tun?",
        inputType: "radio",
        options: [
          { value: "einrichten", label: "P-Konto einrichten" },
          { value: "erhoehen", label: "Freibetrag erhöhen" },
          { value: "problem", label: "Problem mit bestehendem P-Konto" },
        ],
        required: true,
      },
      {
        key: "pfaendung_grund",
        question: "Weshalb droht/besteht eine Pfändung?",
        inputType: "radio",
        options: [
          { value: "schulden", label: "Private Schulden" },
          { value: "finanzamt", label: "Steuerschulden" },
          { value: "unterhalt", label: "Unterhaltsschulden" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
    ],
  },
  erbrecht: {
    testament: [
      {
        key: "verhaeltnis",
        question: "In welchem Verhältnis standen Sie zum Erblasser?",
        inputType: "radio",
        options: [
          { value: "ehepartner", label: "Ehepartner/eingetragene Lebenspartnerschaft" },
          { value: "kind", label: "Kind" },
          { value: "enkel", label: "Enkel" },
          { value: "eltern", label: "Eltern" },
          { value: "geschwister", label: "Geschwister" },
          { value: "sonstige", label: "Sonstige Verwandtschaft/nicht verwandt" },
        ],
        required: true,
      },
      {
        key: "problem",
        question: "Was ist das Problem mit dem Testament?",
        inputType: "checkbox",
        options: [
          { value: "enterbt", label: "Ich wurde enterbt" },
          { value: "formfehler", label: "Verdacht auf Formfehler" },
          { value: "testierfaehigkeit", label: "Zweifel an Testierfähigkeit" },
          { value: "faelschung", label: "Verdacht auf Fälschung" },
          { value: "unklarheit", label: "Testament unklar formuliert" },
        ],
        required: true,
      },
    ],
    pflichtteil: [
      {
        key: "verhaeltnis",
        question: "In welchem Verhältnis standen Sie zum Erblasser?",
        inputType: "radio",
        options: [
          { value: "ehepartner", label: "Ehepartner" },
          { value: "kind", label: "Kind" },
          { value: "eltern", label: "Eltern (wenn keine Kinder)" },
        ],
        required: true,
      },
      {
        key: "nachlasswert",
        question: "Kennen Sie den ungefähren Nachlasswert?",
        inputType: "radio",
        options: [
          { value: "ja", label: "Ja, ungefähr" },
          { value: "nein", label: "Nein, unbekannt" },
          { value: "streit", label: "Wird von Erben verschwiegen" },
        ],
        required: true,
      },
      {
        key: "todesfall_datum",
        question: "Wann ist der Erblasser verstorben?",
        inputType: "date",
        required: true,
      },
    ],
    erbschein: [
      {
        key: "testament_vorhanden",
        question: "Gibt es ein Testament?",
        inputType: "radio",
        options: [
          { value: "ja", label: "Ja" },
          { value: "nein", label: "Nein" },
          { value: "unklar", label: "Nicht bekannt" },
        ],
        required: true,
      },
      {
        key: "erben_anzahl",
        question: "Wie viele Erben gibt es?",
        inputType: "radio",
        options: [
          { value: "allein", label: "Ich bin Alleinerbe" },
          { value: "mehrere_einig", label: "Mehrere Erben, einig" },
          { value: "mehrere_streit", label: "Mehrere Erben, Streit" },
        ],
        required: true,
      },
    ],
    erbengemeinschaft: [
      {
        key: "erben_anzahl",
        question: "Wie viele Miterben gibt es?",
        inputType: "number",
        placeholder: "Anzahl",
        required: true,
      },
      {
        key: "nachlassbestandteile",
        question: "Was gehört zum Nachlass?",
        inputType: "checkbox",
        options: [
          { value: "immobilie", label: "Immobilie(n)" },
          { value: "geld", label: "Geld/Bankguthaben" },
          { value: "wertpapiere", label: "Wertpapiere/Aktien" },
          { value: "fahrzeuge", label: "Fahrzeuge" },
          { value: "unternehmen", label: "Unternehmen/Beteiligung" },
          { value: "sonstiges", label: "Sonstige Wertgegenstände" },
        ],
        required: true,
      },
      {
        key: "problem",
        question: "Was ist das Problem?",
        inputType: "checkbox",
        options: [
          { value: "keine_einigung", label: "Keine Einigung über Aufteilung" },
          { value: "verwaltung", label: "Streit über Verwaltung" },
          { value: "verkauf", label: "Uneinigkeit über Verkauf" },
          { value: "auszahlung", label: "Miterbe verweigert Auszahlung" },
        ],
        required: true,
      },
    ],
    erbausschlagung: [
      {
        key: "todesfall_datum",
        question: "Wann ist der Erblasser verstorben?",
        helpText: "Die Frist zur Erbausschlagung beträgt nur 6 Wochen!",
        inputType: "date",
        required: true,
      },
      {
        key: "kenntnis_datum",
        question: "Wann haben Sie vom Erbfall erfahren?",
        inputType: "date",
        required: true,
      },
      {
        key: "ausschlagung_grund",
        question: "Warum möchten Sie ausschlagen?",
        inputType: "checkbox",
        options: [
          { value: "schulden", label: "Überschuldeter Nachlass" },
          { value: "verpflichtungen", label: "Ungewollte Verpflichtungen" },
          { value: "weitergabe", label: "Weitergabe an anderen Erben" },
          { value: "sonstiges", label: "Sonstige Gründe" },
        ],
        required: true,
      },
    ],
    vermaechtnis: [
      {
        key: "vermaechtnis_art",
        question: "Was wurde Ihnen vermacht?",
        inputType: "radio",
        options: [
          { value: "geld", label: "Geldbetrag" },
          { value: "gegenstand", label: "Bestimmter Gegenstand" },
          { value: "immobilie", label: "Immobilie/Wohnrecht" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
      {
        key: "erbe_verweigert",
        question: "Verweigert der Erbe die Herausgabe?",
        inputType: "radio",
        options: [
          { value: "ja", label: "Ja" },
          { value: "teilweise", label: "Teilweise/Streitig" },
          { value: "noch_nicht_angefordert", label: "Noch nicht angefordert" },
        ],
        required: true,
      },
    ],
  },
  alltag: {
    handwerker: [
      {
        key: "auftrag_art",
        question: "Um was für einen Auftrag ging es?",
        inputType: "radio",
        options: [
          { value: "renovierung", label: "Renovierung" },
          { value: "reparatur", label: "Reparatur" },
          { value: "neubau", label: "Neubau/Umbau" },
          { value: "installation", label: "Installation (Heizung, Sanitär, etc.)" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
      {
        key: "mangel",
        question: "Was ist das Problem?",
        inputType: "checkbox",
        options: [
          { value: "qualitaet", label: "Schlechte Arbeitsqualität" },
          { value: "unvollstaendig", label: "Arbeit nicht fertiggestellt" },
          { value: "schaeden", label: "Schäden verursacht" },
          { value: "kosten", label: "Rechnung zu hoch" },
          { value: "termin", label: "Termine nicht eingehalten" },
        ],
        required: true,
      },
      {
        key: "reklamiert",
        question: "Haben Sie den Mangel bereits reklamiert?",
        inputType: "radio",
        options: [
          { value: "ja_abgelehnt", label: "Ja, Nachbesserung abgelehnt" },
          { value: "ja_ignoriert", label: "Ja, keine Reaktion" },
          { value: "ja_erfolglos", label: "Ja, Nachbesserung erfolglos" },
          { value: "nein", label: "Noch nicht" },
        ],
        required: true,
      },
    ],
    fitnessstudio: [
      {
        key: "kuendigung_grund",
        question: "Warum möchten Sie kündigen?",
        inputType: "radio",
        options: [
          { value: "umzug", label: "Umzug" },
          { value: "krankheit", label: "Krankheit/Verletzung" },
          { value: "schwangerschaft", label: "Schwangerschaft" },
          { value: "unzufrieden", label: "Unzufrieden mit Leistung" },
          { value: "sonstiges", label: "Sonstiger Grund" },
        ],
        required: true,
      },
      {
        key: "vertragslaufzeit",
        question: "Wie lange läuft der Vertrag noch?",
        inputType: "radio",
        options: [
          { value: "unter6", label: "Weniger als 6 Monate" },
          { value: "6bis12", label: "6 bis 12 Monate" },
          { value: "ueber12", label: "Mehr als 12 Monate" },
          { value: "unklar", label: "Nicht sicher" },
        ],
        required: true,
      },
    ],
    laerm: [
      {
        key: "laerm_quelle",
        question: "Woher kommt der Lärm?",
        inputType: "radio",
        options: [
          { value: "nachbar_musik", label: "Nachbar (Musik/Party)" },
          { value: "nachbar_renovierung", label: "Nachbar (Renovierung)" },
          { value: "baustelle", label: "Baustelle" },
          { value: "gewerbe", label: "Gewerbebetrieb" },
          { value: "verkehr", label: "Verkehr" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
      {
        key: "laerm_zeit",
        question: "Wann tritt der Lärm auf?",
        inputType: "checkbox",
        options: [
          { value: "tags", label: "Tagsüber (6-22 Uhr)" },
          { value: "nachts", label: "Nachts (22-6 Uhr)" },
          { value: "wochenende", label: "Am Wochenende" },
          { value: "dauerhaft", label: "Dauerhaft/regelmäßig" },
        ],
        required: true,
      },
      {
        key: "protokoll",
        question: "Führen Sie ein Lärmprotokoll?",
        inputType: "radio",
        options: [
          { value: "ja", label: "Ja" },
          { value: "nein", label: "Nein" },
        ],
        required: true,
      },
    ],
    nachbarrecht: [
      {
        key: "problem_art",
        question: "Um welches Problem geht es?",
        inputType: "radio",
        options: [
          { value: "grenze", label: "Grenzstreitigkeit" },
          { value: "pflanzen", label: "Überhängende Pflanzen/Bäume" },
          { value: "zaun", label: "Zaun/Einfriedung" },
          { value: "wasser", label: "Wasserablauf" },
          { value: "licht", label: "Lichtentzug" },
          { value: "sonstiges", label: "Sonstiges" },
        ],
        required: true,
      },
      {
        key: "gespraech_versucht",
        question: "Haben Sie mit dem Nachbarn gesprochen?",
        inputType: "radio",
        options: [
          { value: "ja_erfolglos", label: "Ja, ohne Erfolg" },
          { value: "ja_eskaliert", label: "Ja, Situation eskaliert" },
          { value: "nein", label: "Noch nicht" },
          { value: "nicht_moeglich", label: "Nicht möglich/zumutbar" },
        ],
        required: true,
      },
    ],
  },
};

export function getQuestionsForSubCategory(
  areaKey: LegalAreaKey,
  subCategoryKey: string
): WizardQuestion[] {
  return wizardQuestions[areaKey]?.[subCategoryKey] || [];
}

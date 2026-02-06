export type LegalAreaKey =
  | "arbeitsrecht"
  | "mietrecht"
  | "datenschutz"
  | "verkehrsrecht"
  | "digitales"
  | "verbraucherrecht"
  | "behoerden"
  | "finanzen"
  | "erbrecht"
  | "alltag";

export interface SubCategory {
  key: string;
  name: string;
  description: string;
  urgentDeadline?: string;
}

export interface LegalArea {
  key: LegalAreaKey;
  name: string;
  description: string;
  icon: string;
  color: string;
  subCategories: SubCategory[];
}

export const legalAreas: LegalArea[] = [
  {
    key: "arbeitsrecht",
    name: "Arbeitsrecht",
    description: "Kündigung, Abmahnung, Lohn & mehr",
    icon: "Briefcase",
    color: "from-amber-500 to-orange-600",
    subCategories: [
      {
        key: "kuendigung",
        name: "Kündigung prüfen",
        description: "Wurde Ihnen gekündigt? Lassen Sie prüfen, ob die Kündigung wirksam ist.",
        urgentDeadline: "3 Wochen Klagefrist nach Erhalt der Kündigung!",
      },
      {
        key: "abmahnung",
        name: "Abmahnung prüfen",
        description: "Abmahnung erhalten? Prüfen Sie, ob sie berechtigt ist.",
      },
      {
        key: "lohn",
        name: "Lohn einfordern",
        description: "Ihr Arbeitgeber zahlt nicht? Fordern Sie Ihren Lohn ein.",
      },
      {
        key: "arbeitszeugnis",
        name: "Arbeitszeugnis prüfen",
        description: "Ist Ihr Arbeitszeugnis fair formuliert?",
      },
      {
        key: "ueberstunden",
        name: "Überstunden-Vergütung",
        description: "Unbezahlte Überstunden? Holen Sie sich Ihr Geld.",
      },
    ],
  },
  {
    key: "mietrecht",
    name: "Mietrecht",
    description: "Miete, Nebenkosten, Kaution & Mängel",
    icon: "Home",
    color: "from-emerald-500 to-teal-600",
    subCategories: [
      {
        key: "mietminderung",
        name: "Mietminderung berechnen",
        description: "Mängel in der Wohnung? Berechnen Sie Ihre Mietminderung.",
      },
      {
        key: "nebenkostenabrechnung",
        name: "Nebenkostenabrechnung prüfen",
        description: "Ist Ihre Nebenkostenabrechnung korrekt?",
      },
      {
        key: "mieterhoehung",
        name: "Mieterhöhung prüfen",
        description: "Mieterhöhung erhalten? Prüfen Sie die Rechtmäßigkeit.",
      },
      {
        key: "kaution",
        name: "Kaution zurückfordern",
        description: "Vermieter zahlt Kaution nicht zurück?",
      },
      {
        key: "eigenbedarf",
        name: "Eigenbedarfskündigung abwehren",
        description: "Kündigung wegen Eigenbedarf? Prüfen Sie Ihre Rechte.",
      },
    ],
  },
  {
    key: "datenschutz",
    name: "Datenschutz",
    description: "DSGVO, Auskunft & Löschung",
    icon: "Shield",
    color: "from-blue-500 to-indigo-600",
    subCategories: [
      {
        key: "dsgvo-verstoss",
        name: "DSGVO-Verstoß melden",
        description: "Wurde gegen Ihre Datenschutzrechte verstoßen?",
      },
      {
        key: "auskunft",
        name: "Auskunftsanspruch durchsetzen",
        description: "Erfahren Sie, welche Daten über Sie gespeichert sind.",
      },
      {
        key: "loeschung",
        name: "Löschungsanspruch durchsetzen",
        description: "Fordern Sie die Löschung Ihrer Daten.",
      },
      {
        key: "schadensersatz-dsgvo",
        name: "Schadensersatz geltend machen",
        description: "DSGVO-Verstoß? Fordern Sie Schadensersatz.",
      },
    ],
  },
  {
    key: "verkehrsrecht",
    name: "Verkehrsrecht",
    description: "Bußgeld, Fahrverbot & Unfall",
    icon: "Car",
    color: "from-red-500 to-rose-600",
    subCategories: [
      {
        key: "bussgeld",
        name: "Bußgeldbescheid prüfen",
        description: "Blitzer, Parken, Rotlicht – lassen Sie den Bescheid prüfen.",
        urgentDeadline: "2 Wochen Einspruchsfrist!",
      },
      {
        key: "fahrverbot",
        name: "Fahrverbot anfechten",
        description: "Fahrverbot droht? Prüfen Sie Ihre Optionen.",
      },
      {
        key: "unfallregulierung",
        name: "Unfallregulierung",
        description: "Versicherung zahlt nicht richtig? Wir helfen.",
      },
      {
        key: "punkte",
        name: "Punkte in Flensburg",
        description: "Zu viele Punkte? Prüfen Sie Ihre Möglichkeiten.",
      },
    ],
  },
  {
    key: "digitales",
    name: "Digitales & Social Media",
    description: "Account-Sperre, Bewertungen & Abmahnungen",
    icon: "Smartphone",
    color: "from-violet-500 to-purple-600",
    subCategories: [
      {
        key: "account-sperre",
        name: "Account-Entsperrung",
        description: "Instagram, Facebook, TikTok, YouTube oder X-Account gesperrt?",
      },
      {
        key: "bewertung-loeschen",
        name: "Negative Bewertung löschen",
        description: "Unfaire Bewertung auf Google, Kununu oder Trustpilot?",
      },
      {
        key: "filesharing",
        name: "Filesharing-Abmahnung abwehren",
        description: "Abmahnung wegen Filesharing erhalten?",
      },
      {
        key: "recht-vergessen",
        name: "Recht auf Vergessenwerden",
        description: "Unerwünschte Inhalte aus dem Internet entfernen.",
      },
    ],
  },
  {
    key: "verbraucherrecht",
    name: "Verbraucherrecht",
    description: "Widerruf, Garantie & Fluggastrechte",
    icon: "ShoppingBag",
    color: "from-pink-500 to-rose-600",
    subCategories: [
      {
        key: "widerruf",
        name: "Widerruf durchsetzen",
        description: "Online-Kauf bereuen? Nutzen Sie Ihr Widerrufsrecht.",
      },
      {
        key: "gewaehrleistung",
        name: "Gewährleistung/Garantie",
        description: "Produkt defekt? Fordern Sie Ihr Recht ein.",
      },
      {
        key: "abo-falle",
        name: "Abo-Falle / Inkasso abwehren",
        description: "Unberechtigte Forderung erhalten?",
      },
      {
        key: "fluggastrechte",
        name: "Fluggastrechte",
        description: "Flug verspätet oder ausgefallen? Bis zu 600€ Entschädigung.",
      },
      {
        key: "paket",
        name: "Paket nicht angekommen",
        description: "Bestellung nie erhalten? Fordern Sie Ihr Geld zurück.",
      },
    ],
  },
  {
    key: "behoerden",
    name: "Behörden & Verwaltung",
    description: "Widerspruch, GEZ & Akteneinsicht",
    icon: "Building2",
    color: "from-slate-500 to-gray-600",
    subCategories: [
      {
        key: "widerspruch-bescheid",
        name: "Widerspruch gegen Bescheide",
        description: "Jobcenter, BAföG, Kindergeld – Bescheid anfechten.",
        urgentDeadline: "1 Monat Widerspruchsfrist!",
      },
      {
        key: "gez",
        name: "GEZ-Befreiung / Widerspruch",
        description: "Rundfunkbeitrag anfechten oder Befreiung beantragen.",
      },
      {
        key: "steuerbescheid",
        name: "Einspruch Steuerbescheid",
        description: "Steuerbescheid falsch? Legen Sie Einspruch ein.",
        urgentDeadline: "1 Monat Einspruchsfrist!",
      },
      {
        key: "akteneinsicht",
        name: "Akteneinsicht beantragen",
        description: "Erfahren Sie, was in Ihrer Akte steht.",
      },
    ],
  },
  {
    key: "finanzen",
    name: "Finanzen & Versicherung",
    description: "Versicherung, Schufa & Bankgebühren",
    icon: "Wallet",
    color: "from-cyan-500 to-sky-600",
    subCategories: [
      {
        key: "versicherung",
        name: "Versicherung zahlt nicht",
        description: "Versicherung verweigert Zahlung? Wir helfen.",
      },
      {
        key: "schufa",
        name: "Schufa-Eintrag löschen",
        description: "Falscher oder veralteter Schufa-Eintrag?",
      },
      {
        key: "bankgebuehren",
        name: "Bankgebühren anfechten",
        description: "Unzulässige Bankgebühren zurückfordern.",
      },
      {
        key: "p-konto",
        name: "P-Konto / Kontopfändungsschutz",
        description: "Schutz vor Kontopfändung einrichten.",
      },
    ],
  },
  {
    key: "erbrecht",
    name: "Erbrecht",
    description: "Testament, Pflichtteil & Erbschein",
    icon: "ScrollText",
    color: "from-amber-600 to-yellow-600",
    subCategories: [
      {
        key: "testament",
        name: "Testament prüfen / anfechten",
        description: "Ist das Testament wirksam oder anfechtbar?",
      },
      {
        key: "pflichtteil",
        name: "Pflichtteil einfordern",
        description: "Enterbt worden? Fordern Sie Ihren Pflichtteil.",
      },
      {
        key: "erbschein",
        name: "Erbschein beantragen",
        description: "Unterstützung beim Erbscheinantrag.",
      },
      {
        key: "erbengemeinschaft",
        name: "Erbengemeinschaft auseinandersetzen",
        description: "Streit mit Miterben? Lösung finden.",
      },
      {
        key: "erbausschlagung",
        name: "Erbausschlagung prüfen",
        description: "Schulden erben? Prüfen Sie die Ausschlagung.",
        urgentDeadline: "6 Wochen Frist zur Ausschlagung!",
      },
      {
        key: "vermaechtnis",
        name: "Vermächtnis durchsetzen",
        description: "Vermächtnis im Testament? Fordern Sie es ein.",
      },
    ],
  },
  {
    key: "alltag",
    name: "Alltag & Nachbarschaft",
    description: "Handwerker, Verträge & Nachbarn",
    icon: "Users",
    color: "from-green-500 to-emerald-600",
    subCategories: [
      {
        key: "handwerker",
        name: "Handwerker-Pfusch reklamieren",
        description: "Schlechte Handwerkerarbeit? Fordern Sie Nachbesserung.",
      },
      {
        key: "fitnessstudio",
        name: "Fitnessstudio-Vertrag kündigen",
        description: "Aus dem Vertrag rauskommen? Wir zeigen wie.",
      },
      {
        key: "laerm",
        name: "Lärmbelästigung",
        description: "Laute Nachbarn? Kennen Sie Ihre Rechte.",
      },
      {
        key: "nachbarrecht",
        name: "Nachbarrecht",
        description: "Streit mit dem Nachbarn? Rechtliche Lösungen finden.",
      },
    ],
  },
];

export function getLegalArea(key: LegalAreaKey): LegalArea | undefined {
  return legalAreas.find((area) => area.key === key);
}

export function getSubCategory(
  areaKey: LegalAreaKey,
  subKey: string
): SubCategory | undefined {
  const area = getLegalArea(areaKey);
  return area?.subCategories.find((sub) => sub.key === subKey);
}

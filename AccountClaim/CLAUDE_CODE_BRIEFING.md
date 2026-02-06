# Sperrrecht.de – Claude Code Projektbriefing

> Dieses Dokument ist eine vollständige Anweisung für Claude Code. Kopiere es in Claude Code und lasse das Projekt damit aufsetzen.

---

## Was gebaut werden soll

Ein Legal-Tech-Portal namens **Sperrrecht.de** für eine zugelassene Rechtsanwaltsgesellschaft. Das Portal automatisiert die Entsperrung gesperrter Social-Media-Konten. Der Mandant füllt ein Formular aus, das System generiert eine anwaltliche Abmahnung als PDF, überwacht die Frist, und eskaliert bei Fristablauf zum gerichtlichen Verfahren.

---

## Tech Stack

```
Framework:       Next.js 14+ (App Router)
Sprache:         TypeScript
Styling:         Tailwind CSS
Datenbank:       PostgreSQL
ORM:             Prisma
Auth:            NextAuth.js (Credentials + Magic Link)
PDF:             @react-pdf/renderer ODER Puppeteer (HTML → PDF)
E-Mail:          Resend (transaktionale E-Mails)
Datei-Upload:    UploadThing oder S3-kompatibel
Cron Jobs:       Vercel Cron (oder node-cron bei Selfhost)
Hosting:         Vercel (oder Hetzner für DE-Hosting)
```

---

## Projektstruktur

```
sperrrecht/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root Layout mit Fonts + Nav
│   │   ├── page.tsx                      # Landing Page
│   │   ├── start/
│   │   │   ├── page.tsx                  # Step 1: Vorprüfung (Wohnsitz + Sperrdatum)
│   │   │   ├── details/page.tsx          # Step 2: Plattform, Nutzername, Sperrgrund, Upload
│   │   │   ├── kontotyp/page.tsx         # Step 3: Privat/Gewerblich
│   │   │   ├── daten/page.tsx            # Step 4: Persönliche Daten
│   │   │   └── mandatierung/page.tsx     # Step 5: Zusammenfassung + Vollmacht
│   │   ├── fall/
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Fall-Übersicht (Timeline, Status, PDF-Links)
│   │   │       └── abmahnung/page.tsx    # Abmahnung PDF-Vorschau
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Alle Fälle mit Fristüberwachung
│   │   ├── api/
│   │   │   ├── cases/
│   │   │   │   ├── route.ts              # POST: neuen Fall anlegen / GET: Fälle auflisten
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts          # GET: Einzelfall / PATCH: Status ändern
│   │   │   │       ├── pdf/route.ts      # GET: Abmahnung als PDF generieren + zurückgeben
│   │   │   │       └── resolve/route.ts  # PATCH: Fall als "entsperrt" markieren
│   │   │   ├── upload/route.ts           # POST: Datei-Upload (Screenshots etc.)
│   │   │   ├── cron/
│   │   │   │   └── deadlines/route.ts    # Cron: Fristüberwachung + E-Mail-Versand
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── impressum/page.tsx
│   │   ├── datenschutz/page.tsx
│   │   └── agb/page.tsx
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── WizardProgress.tsx
│   │   ├── PlatformSelector.tsx
│   │   ├── TrackInfo.tsx                 # Zeigt Track A/B Ergebnis an
│   │   ├── CaseCard.tsx                  # Einzelfall im Dashboard
│   │   ├── Timeline.tsx
│   │   └── AbmahnungDocument.tsx         # Die Abmahnung als React-PDF Komponente
│   ├── lib/
│   │   ├── prisma.ts                     # Prisma Client Singleton
│   │   ├── platforms.ts                  # Plattform-Konfiguration (statische Daten)
│   │   ├── fristlogik.ts                # Monatsfrist-Berechnung + Track-Ermittlung
│   │   ├── abmahnung-template.ts        # Textbausteine für die Abmahnung
│   │   ├── pdf-generator.ts             # PDF-Generierung
│   │   ├── email.ts                     # E-Mail-Versand (Resend)
│   │   └── auth.ts                      # NextAuth Config
│   └── types/
│       └── index.ts                     # TypeScript Types
├── public/
│   └── kanzlei-logo.png                 # Kanzlei-Logo für Briefkopf
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Datenbank-Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  vorname       String
  nachname      String
  telefon       String?
  strasse       String
  plz           String
  stadt         String
  cases         Case[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Case {
  id              String   @id @default(cuid())
  caseNumber      String   @unique  // Format: "SM-XXXXXX"
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  // Status & Track
  status          CaseStatus  @default(INTAKE)
  track           Track

  // Plattform & Konto
  platform        Platform
  nutzername      String
  registrierteEmail String
  profilUrl       String?

  // Sperrung
  sperrDatum      DateTime
  sperrGrund      SperrGrund
  sperrGrundFreitext String?
  sperrDetails    String?     @db.Text

  // Kontotyp
  kontotyp        Kontotyp

  // Gewerbliche Details (nur bei kontotyp = GEWERBLICH)
  gewerbBeschreibung    String?   @db.Text
  followerCount         String?
  monatlicheEinnahmen   String?
  vertraegeBetroffen    Boolean   @default(false)

  // Fristlogik (alles serverseitig berechnet)
  monatsfristEnde       DateTime
  abmahnfristDatum      DateTime  // konkretes Fristdatum im Schreiben
  abmahnfristTage       Int       // Anzahl Tage (7/14 etc.)
  abmahnungVersendetAm  DateTime?
  
  // Mandatierung
  vollmachtErteilt      Boolean   @default(false)
  verguetungAkzeptiert  Boolean   @default(false)
  datenschutzAkzeptiert Boolean   @default(false)

  // Eskalation
  evAntragErstelltAm    DateTime?
  klageErstelltAm       DateTime?

  // Abschluss
  entsperrtAm           DateTime?

  // Relations
  uploads        Upload[]
  notifications  Notification[]

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Upload {
  id        String   @id @default(cuid())
  caseId    String
  case      Case     @relation(fields: [caseId], references: [id])
  filename  String
  url       String
  mimeType  String
  size      Int
  createdAt DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  caseId    String
  case      Case     @relation(fields: [caseId], references: [id])
  type      NotificationType
  sentAt    DateTime @default(now())
}

// ─── Enums ───

enum CaseStatus {
  INTAKE
  REVIEW
  LETTER_GENERATED
  LETTER_SENT
  DEADLINE_RUNNING
  DEADLINE_WARNING
  DEADLINE_EXPIRED
  INJUNCTION_FILED
  LAWSUIT_FILED
  RESOLVED
  CLOSED
}

enum Track {
  A_INJUNCTION   // eV möglich (Sperrung < 1 Monat)
  B_LAWSUIT      // nur Klage (Sperrung > 1 Monat)
}

enum Platform {
  INSTAGRAM
  FACEBOOK
  TIKTOK
  YOUTUBE
  X
  TWITCH
  KICK
}

enum SperrGrund {
  COMMUNITY_STANDARDS
  IMPERSONATION
  SPAM
  COPYRIGHT
  HATE_SPEECH
  UNKNOWN
  OTHER
}

enum Kontotyp {
  PRIVAT
  GEWERBLICH
}

enum NotificationType {
  DEADLINE_REMINDER_3D   // 3 Tage vor Fristablauf
  DEADLINE_REMINDER_1D   // 1 Tag vor Fristablauf
  DEADLINE_EXPIRED       // Frist abgelaufen
  CASE_RESOLVED          // Konto entsperrt
}
```

---

## Plattform-Konfiguration

Datei: `src/lib/platforms.ts`

```typescript
export const PLATFORM_CONFIG = {
  INSTAGRAM: {
    name: "Instagram",
    antragsgegner: "Meta Platforms Ireland Ltd.",
    adresse: "4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland",
    bezeichnung: "des Instagram-Kontos",
    bezeichnungGenitiv: "des Instagram-Kontos",
    isVLOP: true,
  },
  FACEBOOK: {
    name: "Facebook",
    antragsgegner: "Meta Platforms Ireland Ltd.",
    adresse: "4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland",
    bezeichnung: "der Facebook-Seite",
    bezeichnungGenitiv: "der Facebook-Seite",
    isVLOP: true,
  },
  TIKTOK: {
    name: "TikTok",
    antragsgegner: "TikTok Technology Limited",
    adresse: "10 Earlsfort Terrace, Dublin 2, D02 T380, Irland",
    bezeichnung: "des TikTok-Kontos",
    bezeichnungGenitiv: "des TikTok-Kontos",
    isVLOP: true,
  },
  YOUTUBE: {
    name: "YouTube",
    antragsgegner: "Google Ireland Limited",
    adresse: "Gordon House, Barrow Street, Dublin 4, Irland",
    bezeichnung: "des YouTube-Kanals",
    bezeichnungGenitiv: "des YouTube-Kanals",
    isVLOP: true,
  },
  X: {
    name: "X (Twitter)",
    antragsgegner: "Twitter International Unlimited Company",
    adresse: "One Cumberland Place, Fenian Street, Dublin 2, D02 AX07, Irland",
    bezeichnung: "des X-Kontos (vormals Twitter)",
    bezeichnungGenitiv: "des X-Kontos",
    isVLOP: true,
  },
  TWITCH: {
    name: "Twitch",
    antragsgegner: "Twitch Interactive Germany GmbH",
    adresse: "Kurfürstendamm 195, 10707 Berlin, Deutschland",
    bezeichnung: "des Twitch-Kanals",
    bezeichnungGenitiv: "des Twitch-Kanals",
    isVLOP: false,
  },
  KICK: {
    name: "Kick",
    antragsgegner: "Kick Streaming Pty Ltd",
    adresse: "100 Barangaroo Avenue, Sydney NSW 2000, Australien",
    bezeichnung: "des Kick-Kanals",
    bezeichnungGenitiv: "des Kick-Kanals",
    isVLOP: false,
  },
} as const;
```

---

## Kernlogik: Monatsfrist-Berechnung

Datei: `src/lib/fristlogik.ts`

Dies ist die WICHTIGSTE Business-Logik des gesamten Systems.

```typescript
import { differenceInDays, addDays } from "date-fns";

export type TrackResult = {
  track: "A_INJUNCTION" | "B_LAWSUIT";
  tageHer: number;
  fristTyp: "standard" | "frankfurt_hamburg" | "klage";
  warnung?: string;
};

export type FristResult = {
  fristTage: number;          // Wie viele Tage Frist in der Abmahnung
  fristDatum: Date;           // Konkretes Fristende
  monatsfristEnde: Date;      // Wann die eV-Frist abläuft
  verbleibendeZeit: number;   // Tage bis Monatsfrist
  track: TrackResult;
};

/**
 * Berechnet den Track (A = eV möglich, B = nur Klage) basierend auf dem Sperrdatum.
 * 
 * REGEL: Einstweilige Verfügung nur möglich innerhalb von 30 Tagen (standard)
 * bzw. 35 Tagen (LG Frankfurt / LG Hamburg) nach Kenntnis der Sperrung.
 */
export function berechneTrack(sperrDatum: Date, heute: Date = new Date()): TrackResult {
  const tageHer = differenceInDays(heute, sperrDatum);

  if (tageHer <= 30) {
    return { track: "A_INJUNCTION", tageHer, fristTyp: "standard" };
  }
  if (tageHer <= 35) {
    // Frankfurt/Hamburg-Ausnahme: 5 Wochen statt 4
    return {
      track: "A_INJUNCTION",
      tageHer,
      fristTyp: "frankfurt_hamburg",
      warnung: "Einstweilige Verfügung nur bei LG Frankfurt/Hamburg noch möglich (5-Wochen-Frist). Zeit ist sehr knapp.",
    };
  }
  return { track: "B_LAWSUIT", tageHer, fristTyp: "klage" };
}

/**
 * Berechnet die optimale Abmahnfrist.
 * 
 * Bei Track A: Frist muss kurz genug sein, damit nach Ablauf noch Zeit für eV-Antrag.
 * Bei Track B: Standard 14 Tage (kein Zeitdruck mehr).
 */
export function berechneFrist(sperrDatum: Date, heute: Date = new Date()): FristResult {
  const track = berechneTrack(sperrDatum, heute);

  if (track.track === "B_LAWSUIT") {
    const fristTage = 14;
    return {
      fristTage,
      fristDatum: addDays(heute, fristTage),
      monatsfristEnde: addDays(sperrDatum, 30), // bereits abgelaufen
      verbleibendeZeit: 0,
      track,
    };
  }

  // Track A: Frist dynamisch berechnen
  const monatsfristEnde = addDays(sperrDatum, track.fristTyp === "frankfurt_hamburg" ? 35 : 30);
  const verbleibendeZeit = differenceInDays(monatsfristEnde, heute);

  let fristTage: number;
  if (verbleibendeZeit > 21) {
    fristTage = 14;    // komfortable Situation
  } else if (verbleibendeZeit > 14) {
    fristTage = 7;     // es wird knapp
  } else if (verbleibendeZeit > 7) {
    fristTage = 5;     // sehr knapp
  } else {
    fristTage = 3;     // Notfall – ggf. direkt eV ohne Abmahnung
  }

  // Sicherheitscheck: Fristende darf nicht nach Monatsfristende liegen
  const fristDatum = addDays(heute, fristTage);
  if (differenceInDays(monatsfristEnde, fristDatum) < 5) {
    // Warnung hinzufügen
    track.warnung = (track.warnung || "") + " Die eV-Frist ist sehr knapp. Ggf. direkter eV-Antrag ohne Abmahnung nötig.";
  }

  return { fristTage, fristDatum, monatsfristEnde, verbleibendeZeit, track };
}
```

---

## Abmahnschreiben – Vollständiges Template

Datei: `src/lib/abmahnung-template.ts`

Dies ist das **exakte** anwaltliche Schreiben, das als PDF generiert wird. Es basiert auf einem realen Musterschreiben. Jede Variable wird aus den Falldaten befüllt.

```typescript
import { PLATFORM_CONFIG } from "./platforms";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type AbmahnungData = {
  // Mandant
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  stadt: string;
  // Konto
  platform: keyof typeof PLATFORM_CONFIG;
  nutzername: string;
  registrierteEmail: string;
  sperrDatum: Date;
  sperrGrund: string;       // Menschenlesbarer Sperrgrund
  sperrDetails?: string;
  // Kontotyp
  kontotyp: "PRIVAT" | "GEWERBLICH";
  gewerbBeschreibung?: string;
  followerCount?: string;
  monatlicheEinnahmen?: string;
  vertraegeBetroffen?: boolean;
  // Frist
  fristDatum: Date;
  // Track
  track: "A_INJUNCTION" | "B_LAWSUIT";
  // Meta
  erstellDatum: Date;
};

const fmtDatum = (d: Date) => format(d, "d. MMMM yyyy", { locale: de });
const fmtDatumLang = (d: Date) => format(d, "EEEE, 'den' d. MMMM yyyy", { locale: de });

export function generiereAbmahnung(data: AbmahnungData): string {
  const pl = PLATFORM_CONFIG[data.platform];
  const gerichtlicheMassnahme = data.track === "A_INJUNCTION"
    ? "den Erlass einer einstweiligen Verfügung"
    : "Klage auf Wiederherstellung und Schadensersatz";

  // ─── Sachverhalt ───
  let sachverhalt: string;
  if (data.kontotyp === "GEWERBLICH") {
    sachverhalt = `Unser Mandant nutzt ${pl.name} gewerblich.`;
    if (data.gewerbBeschreibung) sachverhalt += ` ${data.gewerbBeschreibung}`;
    if (data.followerCount) sachverhalt += ` Das Konto verfügt über ca. ${data.followerCount} Follower bzw. Abonnenten.`;
    if (data.monatlicheEinnahmen) sachverhalt += ` Über die Plattform generiert unser Mandant monatliche Einnahmen in Höhe von ca. ${data.monatlicheEinnahmen}.`;
    if (data.vertraegeBetroffen) sachverhalt += ` Es bestehen aktive Werbe- und Kooperationsverträge, die durch die Sperrung unmittelbar gefährdet sind.`;
  } else {
    sachverhalt = `Unser Mandant nutzt ${pl.name} im privaten Rahmen zur persönlichen Meinungsäußerung und zum Austausch mit seiner Community.`;
  }

  sachverhalt += `\n\nAm ${fmtDatum(data.sperrDatum)} sperrten Sie das Konto unseres Mandanten unter Hinweis auf angebliche Verstöße gegen die Gemeinschaftsstandards (${data.sperrGrund}).`;
  if (data.sperrDetails) sachverhalt += ` ${data.sperrDetails}`;

  // ─── Fazit ───
  let fazit = `Es ergibt sich Ihre Pflicht zur Gewährung der Nutzung der Plattform ${pl.name} nicht nur aus dem bestehenden Vertragsverhältnis, sondern zugleich aus der Verpflichtung zur Beachtung der deutschen Grundrechte sowie der Charta der Grundrechte der Europäischen Union.\n\n`;

  if (data.kontotyp === "GEWERBLICH") {
    fazit += `Für unseren Mandanten ist die uneingeschränkte Nutzung seines Kontos auf ${pl.name} von erheblicher Bedeutung.`;
    if (data.followerCount) fazit += ` Ihm folgen dort ca. ${data.followerCount} Menschen.`;
    fazit += ` Er nutzt diese Plattform nicht nur zur Entfaltung seiner Meinungsäußerung und seines allgemeinen Persönlichkeitsrechts, sondern vor allem auch zur Bewerbung seines Geschäftsbetriebs. Die Sperrung seines Accounts stellt einen unzulässigen Eingriff in sein allgemeines Persönlichkeitsrecht gemäß Art. 2 Abs. 1 i.V.m. Art. 1 Abs. 1 GG, in seine Meinungsfreiheit nach Art. 5 Abs. 1 GG sowie in seine Berufsausübungsfreiheit nach Art. 12 Abs. 1 GG dar. Jede Stunde, in der er sein Konto nicht nutzen kann, verursacht ihm erhebliche wirtschaftliche Nachteile. Es ist nicht hinnehmbar, diesen Zustand fortbestehen zu lassen.\n\nDies ist vor allem vor dem Hintergrund bemerkenswert, dass er sich nicht nur stets an die Gemeinschaftsstandards gehalten hat, sondern mit seinen Inhalten seit Jahren erheblich zur Reichweite, Attraktivität und positiven Wahrnehmung der Plattform beiträgt.`;
  } else {
    fazit += `Für unseren Mandanten ist die uneingeschränkte Nutzung seines Kontos auf ${pl.name} von erheblicher Bedeutung. Er nutzt die Plattform zur Entfaltung seiner Meinungsäußerung und seines allgemeinen Persönlichkeitsrechts. Die Sperrung seines Accounts stellt einen unzulässigen Eingriff in sein allgemeines Persönlichkeitsrecht gemäß Art. 2 Abs. 1 i.V.m. Art. 1 Abs. 1 GG sowie in seine Meinungsfreiheit nach Art. 5 Abs. 1 GG dar.`;
  }

  // ─── DSA-Block (nur für VLOPs) ───
  const dsaBlock = pl.isVLOP ? `
3. Unionsrechtliche Pflichten

Für Sie als sogenannte Very Large Online Platform (VLOP) im Sinne des Digital Services Acts (DSA) – EU-Verordnung 2022/2065 des Europäischen Parlaments und des Rates vom 19. Oktober 2022 – ergibt sich aus Art. 14 Abs. 4 DSA insoweit eine unmittelbare Bindung an die Rechte aus der EU-Grundrechtecharta. Danach ist es Ihnen untersagt, Nutzer willkürlich zu sperren:

„Die Anbieter von Vermittlungsdiensten gehen bei der Anwendung und Durchsetzung der in Absatz 1 genannten Beschränkungen sorgfältig, objektiv und verhältnismäßig vor und berücksichtigen dabei die Rechte und berechtigten Interessen aller Beteiligten sowie die Grundrechte der Nutzer, die in der Charta verankert sind, etwa das Recht auf freie Meinungsäußerung, die Freiheit und den Pluralismus der Medien und andere Grundrechte und -freiheiten."

Weiterhin sind Sie nach Art. 17 Abs. 1 DSA verpflichtet, jegliche Art von Beschränkungen und Unterdrückungen von Inhalten zu begründen.` : "";

  // ─── Gesamtes Schreiben ───
  return `A B M A H N U N G

${data.vorname} ${data.nachname} ./. ${pl.antragsgegner} – Unterlassungsaufforderung

Sehr geehrte Damen und Herren,

hiermit zeigen wir an, dass wir die rechtlichen Interessen des Herrn ${data.vorname} ${data.nachname}, ${data.strasse}, ${data.plz} ${data.stadt}, vertreten. Ordnungsgemäße Bevollmächtigung wird anwaltlich versichert. Wir weisen darauf hin, dass der Nachweis der schriftlichen Bevollmächtigung keine Wirksamkeitsvoraussetzung darstellt (BGH, Urteil vom 19. Mai 2010, I ZR 140/08).

Gegenstand unserer Beauftragung ist die unrechtmäßige Sperrung ${pl.bezeichnung} unseres Mandanten am ${fmtDatum(data.sperrDatum)}

- Nutzername: ${data.nutzername}
- Verknüpft mit E-Mail: ${data.registrierteEmail}

Mit diesem Schreiben fordern wir Sie außergerichtlich auf, die Sperre ${pl.bezeichnungGenitiv} unseres Mandanten sowie sämtliche damit verknüpfte Seiten unverzüglich aufzuheben und sie in einen Zustand ohne jegliche Einschränkungen zurückzusetzen.

Im Einzelnen:


I.
Sachverhalt

${sachverhalt}


II.
Zu den Pflichten der Betreiber sozialer Netzwerke

1. Vertragliche Pflichten

Zwischen unserem Mandanten und Ihnen besteht ein rechtsgeschäftliches Dauerschuldverhältnis, kraft dessen Sie gemäß §§ 311 Abs. 1, 241 Abs. 1 BGB verpflichtet sind, unserem Mandanten die Nutzung der Plattform ${pl.name} zu ermöglichen, solange er hierbei nicht gegen geltendes deutsches oder europäisches Recht oder Ihre Nutzungsbedingungen verstößt, wobei Ihre Nutzungsbedingungen nach dem Maßstab der AGB-Kontrolle (§§ 305 ff. BGB) nicht unangemessen benachteiligend gegenüber unserem Mandanten sein dürfen. Zu betonen ist hierbei, dass Sie auch im Rahmen der mittelbaren Grundrechtsdrittwirkung an verschiedene Grundrechte gebunden sind.

2. BGH-Rechtsprechung

Ihnen sind die Urteile des Bundesgerichtshofs vom 29. Juli 2021 (Az. III ZR 179/20 und III ZR 192/20) bekannt, in denen klargestellt wurde, dass es Plattformbetreibern verwehrt ist, Nutzerkonten ohne sachlichen Grund und damit willkürlich zu löschen sowie dass ein vorheriges Anhörungsverfahren durchzuführen ist. Eine vertiefte Auseinandersetzung mit dieser Rechtsprechung erübrigt sich daher an dieser Stelle.
${dsaBlock}


III.
Fazit

${fazit}


Wir fordern Sie namens und im Auftrag unseres Mandanten auf, unverzüglich, spätestens bis

${fmtDatumLang(data.fristDatum)}, 12:00 Uhr (UTC+1)

das Nutzerkonto unseres Mandanten zu entsperren und den Zustand wiederherzustellen, der vor Löschung bzw. Sperre am ${fmtDatum(data.sperrDatum)} bestand.

Weil Sie unserem Mandanten gegenüber nicht nur zur Beseitigung, sondern auch zur (künftigen) Unterlassung verpflichtet sind, haben wir Sie namens und im Auftrag unseres Mandanten ebenso aufzufordern, unverzüglich, jedoch spätestens bis

${fmtDatumLang(data.fristDatum)}, 12:00 Uhr (UTC+1)

sich im Wege einer hinreichend bestimmten und strafbewehrten Unterlassungserklärung rechtsverbindlich dazu zu verpflichten, künftige Rechtsverletzungen zu unterlassen, um die hier bestehende Wiederholungsgefahr auszuräumen.

Vorsichtshalber weisen wir darauf hin, dass der Zugang der Unterlassungserklärung vorab per E-Mail oder Telefax nur dann fristwahrend ist, wenn uns das Original anschließend zeitnah auf postalischem Wege zugeht.

Die Fristen sind auch angemessen, da Sie unlängst über die Hintergründe informiert wurden.

Im Falle des fruchtlosen Ablaufs der vorgenannten Fristen werden wir unmittelbar und ohne weitere Ankündigung gerichtliche Hilfe in Anspruch nehmen und ${gerichtlicheMassnahme} gegen Sie beantragen.

Nehmen Sie zur Kenntnis, dass sich unser Mandant in jedem Falle die Geltendmachung von materiellem und immateriellem Schadensersatz gegen Sie vorbehält.


Mit freundlichen Grüßen

[Kanzlei-Unterschrift]
Rechtsanwalt / Rechtsanwältin
Sperrrecht.de Rechtsanwaltsgesellschaft`;
}
```

---

## Cron Job: Fristüberwachung

Datei: `src/app/api/cron/deadlines/route.ts`

```typescript
// Wird täglich ausgeführt (Vercel Cron oder node-cron)
// Prüft alle laufenden Fristen und versendet E-Mails:
// - 3 Tage vor Ablauf: Erinnerung
// - 1 Tag vor Ablauf: Warnung
// - Am Ablauftag: "Frist abgelaufen" + nächster Schritt (eV oder Klage)

export async function GET(request: Request) {
  // Auth-Check: Nur von Cron-Service aufrufbar (Vercel CRON_SECRET)
  
  const heute = new Date();
  
  // Alle Fälle mit Status DEADLINE_RUNNING
  const cases = await prisma.case.findMany({
    where: { status: { in: ["LETTER_SENT", "DEADLINE_RUNNING"] } },
    include: { user: true },
  });

  for (const c of cases) {
    const tageVerbleibend = differenceInDays(c.abmahnfristDatum, heute);
    
    if (tageVerbleibend === 3) {
      // Erinnerung senden
      await sendEmail(c.user.email, "Frist läuft in 3 Tagen ab", ...);
      await createNotification(c.id, "DEADLINE_REMINDER_3D");
    }
    
    if (tageVerbleibend === 1) {
      // Warnung senden
      await sendEmail(c.user.email, "Frist läuft morgen ab", ...);
      await createNotification(c.id, "DEADLINE_REMINDER_1D");
    }
    
    if (tageVerbleibend <= 0) {
      // Frist abgelaufen
      await prisma.case.update({
        where: { id: c.id },
        data: { status: "DEADLINE_EXPIRED" },
      });
      
      const nextStep = c.track === "A_INJUNCTION"
        ? "Wir bereiten den Antrag auf einstweilige Verfügung vor."
        : "Wir bereiten die Klageschrift vor.";
      
      await sendEmail(c.user.email, "Frist abgelaufen – Nächste Schritte", nextStep);
      await createNotification(c.id, "DEADLINE_EXPIRED");
    }
  }

  return Response.json({ checked: cases.length });
}
```

Vercel Cron Config in `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/deadlines", "schedule": "0 8 * * *" }
  ]
}
```

---

## Design-Vorgaben

- **Typografie:** Libre Baskerville (Serif, Überschriften) + Source Sans 3 (Sans, Fließtext)
- **Farben:** Hintergrund #FAFAF8, Akzent #C8102E (Rot), Grün #1B7D3A, Amber #B45309
- **Stil:** Seriös, kanzlei-würdig, aber modern. Kein generisches Tech-Design. Denke an Flightright, aber für Anwälte.
- **Referenz-Prototyp:** Die Datei `sperrrecht-portal.jsx` (liegt im Projekt) enthält einen funktionierenden React-Prototyp mit allen Screens. Nutze diesen als Design-Referenz für Layout, Farben und Interaktionen.

---

## Reihenfolge der Implementierung

1. `npx create-next-app@latest sperrrecht --typescript --tailwind --app` + Prisma einrichten
2. Datenbank-Schema + `npx prisma db push`
3. `src/lib/platforms.ts` + `src/lib/fristlogik.ts` (Kernlogik)
4. Landing Page (`src/app/page.tsx`)
5. Wizard: Step 1–5 (kann ein Multi-Step-Form in einer Route sein oder separate Routen)
6. API: `POST /api/cases` (Fall anlegen, Frist berechnen, in DB speichern)
7. `src/lib/abmahnung-template.ts` (Textgenerierung)
8. PDF-Generierung (`src/lib/pdf-generator.ts` + `src/app/api/cases/[id]/pdf/route.ts`)
9. Ergebnis-Seite (`src/app/fall/[id]/page.tsx`) + Abmahnung-Vorschau
10. Dashboard (`src/app/dashboard/page.tsx`) mit Fristüberwachung
11. Auth (NextAuth Magic Link)
12. Cron Job für Fristüberwachung
13. E-Mail-Integration (Resend)
14. Upload-Funktionalität

---

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="..."
CRON_SECRET="..."
UPLOAD_SECRET="..."  # für UploadThing oder S3
```

---

## Wichtige Hinweise

- **Sprache:** Das gesamte UI ist auf **Deutsch**. Alle Labels, Buttons, Fehlermeldungen, Texte – alles Deutsch.
- **Rechtlich korrekt:** Die Abmahnung enthält echte Rechtsprechung (BGH III ZR 179/20, DSA Art. 14). Diese Texte dürfen NICHT verändert werden.
- **Monatsfrist ist KRITISCH:** Die gesamte Routing-Logik (Track A vs B) hängt davon ab. Muss korrekt implementiert sein.
- **PDF muss professionell aussehen:** Kanzlei-Briefkopf, korrekte Formatierung, Paragrafen-Zeichen korrekt, Fristdatum fett hervorgehoben.
- **Kein RDG-Problem:** Das Portal wird von Anwälten betrieben. Es ist KEINE Selbsthilfe-Plattform.

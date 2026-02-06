# AccountUnlock – Konzeptspezifikation v2

## Legal-Tech-Portal einer zugelassenen Rechtsanwaltsgesellschaft zur automatisierten Entsperrung gesperrter Social-Media-Konten

---

## 1. Rahmenbedingungen

### Betreiber
Das Portal wird von einer **zugelassenen Rechtsanwaltsgesellschaft** betrieben. Es handelt sich um echte anwaltliche Tätigkeit – kein RDG-Problem. Die Kanzlei tritt als Bevollmächtigte des Mandanten auf. Die Abmahnung geht auf Kanzleibriefkopf raus, nicht als Selbsthilfe-PDF.

### Mandatsverhältnis
Der Nutzer schließt über das Portal ein **Mandatsverhältnis** mit der RA-Gesellschaft. Das bedeutet:
- Vollmacht wird digital erteilt (Checkbox + ggf. digitale Signatur)
- Die Kanzlei handelt im Namen und Auftrag des Mandanten
- Bevollmächtigung wird im Schreiben anwaltlich versichert
- Vergütungsvereinbarung wird im Onboarding geschlossen

---

## 2. Kernlogik: Monatsfrist als Weiche

Die **entscheidende Variable** im gesamten System ist die Zeit seit der Sperrung, weil sie bestimmt, welcher Rechtsweg möglich ist.

### Entscheidungsbaum

```
Wohnsitz in Deutschland?
├── NEIN → Ablehnung ("Derzeit nur für Mandanten mit Wohnsitz in Deutschland")
└── JA
    └── Wie lange ist die Sperrung her?
        ├── ≤ 1 Monat (bzw. ≤ 5 Wochen bei LG Frankfurt / LG Hamburg)
        │   └── TRACK A: Abmahnung → Frist → bei Fristablauf: Einstweilige Verfügung
        │
        └── > 1 Monat (bzw. > 5 Wochen bei Frankfurt/Hamburg)
            └── TRACK B: Abmahnung → Frist → bei Fristablauf: Ordentliche Klage
```

### Warum ist die Monatsfrist relevant?
Für den Erlass einer einstweiligen Verfügung muss ein **Verfügungsgrund** vorliegen – die Eilbedürftigkeit. Die meisten Gerichte verlangen, dass der Antrag **innerhalb eines Monats** nach Kenntnis der Rechtsverletzung (= Sperrung) gestellt wird. Wartet der Antragsteller länger, geht die Rechtsprechung davon aus, dass es ihm offensichtlich nicht eilig genug war → Verfügungsgrund entfällt → nur noch normale Klage.

**Ausnahme Frankfurt und Hamburg:** Diese Gerichte gewähren in der Praxis eine großzügigere Frist von ca. **5 Wochen**.

### Berechnung im System

```
sperrDatum = Eingabe des Nutzers
heute = aktuelles Datum
tageHer = heute - sperrDatum

WENN tageHer ≤ 30 Tage:
    → Track A (eV möglich)
    → verbleibende Zeit für Abmahnung + eV berechnen
    → Abmahnfrist so setzen, dass noch genug Zeit für eV-Antrag bleibt

WENN tageHer > 30 UND tageHer ≤ 35 UND zuständiges Gericht = Frankfurt ODER Hamburg:
    → Track A (eV noch möglich, aber knapp)
    → Kürzere Abmahnfrist setzen
    → Warnhinweis: "Die eV-Frist läuft in wenigen Tagen ab"

WENN tageHer > 30 (bzw. > 35 bei Frankfurt/Hamburg):
    → Track B (nur normale Klage)
    → Nutzer informieren, dass eV nicht mehr möglich
    → Abmahnung trotzdem sinnvoll als Vorstufe zur Klage
```

### Dynamische Fristsetzung in der Abmahnung

Die Frist in der Abmahnung muss **knapp genug** sein, damit nach Fristablauf noch genug Zeit für den eV-Antrag bleibt:

```
Faustregel Track A:
- Abmahnfrist = ca. 7–14 Tage
- Aber: Fristende MUSS vor Ablauf der Monatsfrist liegen
- Beispiel: Sperrung am 1.10., heute 10.10.
  → Monatsfrist endet ca. 1.11.
  → Abmahnfrist maximal bis ca. 25.10. (Puffer für eV-Einreichung)
  → Setzt man z.B. 14 Tage → Frist bis 24.10. → passt

Faustregel Track B:
- Abmahnfrist = 14 Tage (Standard)
- Kein Zeitdruck mehr bzgl. eV
```

---

## 3. Intake: Die 7 Kernfragen

Das Formular ist schlank. Genau die Fragen, die ein Anwalt dem Mandanten im Erstgespräch stellt:

### Schritt 1: Vorfilter

| # | Frage | Typ | Zweck |
|---|-------|-----|-------|
| a | **Wohnsitz in Deutschland?** | Ja/Nein | Hard Filter. Bei "Nein" → Ablehnung mit Erklärung |
| b | **Tag der Sperre** | Datum | Berechnung: eV noch möglich? (Monatsfrist) |

→ Sofortige Rückmeldung nach Schritt 1:
- "eV-Verfahren möglich (Sperre liegt X Tage zurück)" **oder**
- "Einstweilige Verfügung nicht mehr möglich – ordentliche Klage als Alternative"

### Schritt 2: Falldaten

| # | Frage | Typ | Zweck |
|---|-------|-----|-------|
| c | **Registrierte E-Mail-Adresse** | E-Mail | Identifikation des Kontos bei der Plattform |
| d | **Nutzername / Profilname** | Text | Identifikation im Schreiben |
| e | **Plattform** | Auswahl | Bestimmt Antragsgegner + zuständiges Gericht |
| f | **Grund der Sperre** | Auswahl + Freitext | Für Sachverhaltsdarstellung im Schreiben |
| g | **Upload: E-Mails/Screenshots der Sperre** | Datei-Upload | Glaubhaftmachung + Sachverhaltsrekonstruktion |

### Plattform-Auswahl (Frage e)

| Plattform | Antragsgegner (jurist. Person) | Adresse |
|-----------|-------------------------------|---------|
| Instagram | Meta Platforms Ireland Ltd. | 4 Grand Canal Square, Dublin 2, Irland |
| Facebook | Meta Platforms Ireland Ltd. | 4 Grand Canal Square, Dublin 2, Irland |
| TikTok | TikTok Technology Limited | 10 Earlsfort Terrace, Dublin 2, Irland |
| YouTube | Google Ireland Limited | Gordon House, Barrow Street, Dublin 4, Irland |
| X (Twitter) | Twitter International ULC | One Cumberland Place, Fenian Street, Dublin 2, Irland |
| Twitch | Twitch Interactive Germany GmbH | *[Adresse prüfen]* |
| Kick | Kick Streaming Pty Ltd | *[Adresse prüfen – australisches Unternehmen, ggf. Sonderfall]* |

*[OFFEN: Zuständige deutsche Gerichte pro Plattform – von dir zu ergänzen]*

### Sperrgrund-Auswahl (Frage f)

- Verstoß gegen Gemeinschaftsstandards (allgemein)
- Impersonation / Nachahmung
- Spam / Verdächtiges Verhalten
- Urheberrechtsverstoß
- Hassrede
- Kein Grund angegeben
- Sonstiger Grund (Freitext)

### Schritt 3: Privat oder Gewerblich?

| Frage | Typ | Zweck |
|-------|-----|-------|
| **Nutzen Sie das Konto gewerblich?** | Ja/Nein | Differenzierung für Verfügungsgrund + Textbausteine |

**Bei "Ja" → Folgefragen:**
- Art der gewerblichen Nutzung (Freitext: "Beschreiben Sie kurz, wie Sie das Konto geschäftlich nutzen")
- Followerzahl (Zahl)
- Geschätzte monatliche Einnahmen über die Plattform (optional)
- Bestehende Werbe-/Kooperationsverträge betroffen? (Ja/Nein)

### Schritt 4: Persönliche Daten des Mandanten

| Feld | Typ |
|------|-----|
| Vorname | Text |
| Nachname | Text |
| Straße + Hausnr. | Text |
| PLZ | Text |
| Stadt | Text |
| E-Mail (Kontakt) | E-Mail |
| Telefon | Text (optional) |

### Schritt 5: Mandatierung

- Checkbox: Vollmachterteilung an die RA-Gesellschaft
- Checkbox: Vergütungsvereinbarung akzeptiert
- Checkbox: Datenschutzeinwilligung
- Zusammenfassung aller Angaben zur Prüfung

---

## 4. Das Abmahnschreiben (Muster-Template)

Basierend auf deinem Musterschreiben. Variable Teile sind mit `{{variable}}` markiert.

### Struktur

```
KANZLEI-BRIEFKOPF

A B M A H N U N G

{{mandant.vorname}} {{mandant.nachname}} ./. {{plattform.antragsgegner}} – Unterlassungsaufforderung

Sehr geehrte Damen und Herren,

hiermit zeigen wir an, dass wir die rechtlichen Interessen
{{Anrede}} {{mandant.vorname}} {{mandant.nachname}}, {{mandant.anschrift}},
vertreten. Ordnungsgemäße Bevollmächtigung wird anwaltlich versichert.
Wir weisen darauf hin, dass der Nachweis der schriftlichen Bevollmächtigung
keine Wirksamkeitsvoraussetzung darstellt (BGH, Urteil vom 19. Mai 2010, I ZR 140/08).

Gegenstand unserer Beauftragung ist die unrechtmäßige Sperrung
{{kontoTypBezeichnung}} unseres Mandanten am {{sperrDatum_formatiert}}

- {{kontoProfil_url}}
- Verknüpft mit E-Mail: {{registrierte_email}}

Mit diesem Schreiben fordern wir Sie außergerichtlich auf, die Sperre
{{kontoTypBezeichnung_genitiv}} unseres Mandanten sowie sämtliche damit
verknüpfte Seiten unverzüglich aufzuheben und sie in einen Zustand
ohne jegliche Einschränkungen zurückzusetzen.

Im Einzelnen:

I.
Sachverhalt

{{sachverhalt_baustein}}

[Hier wird der Sachverhalt aus den Nutzereingaben zusammengebaut:
 - Was ist das für ein Konto? (privat/gewerblich, Followerzahl, Zweck)
 - Was wurde darauf gemacht?
 - Wann und warum wurde gesperrt?
 - Was war der angegebene Sperrgrund?
 - Wurde Einspruch eingelegt? Was war das Ergebnis?]

II.
Zu den Pflichten der Betreiber sozialer Netzwerke

1. Vertragliche Pflichten
Zwischen unserem Mandanten und Ihnen besteht seit {{nutzungsSeit_ca}}
ein rechtsgeschäftliches Dauerschuldverhältnis, kraft dessen Sie gemäß
§§ 311 Abs. 1, 241 Abs. 1 BGB verpflichtet sind, unserem Mandanten die
Nutzung der Plattform {{plattform.name}} zu ermöglichen, solange er hierbei
nicht gegen geltendes deutsches oder europäisches Recht oder Ihre
Nutzungsbedingungen verstößt, wobei Ihre Nutzungsbedingungen nach dem
Maßstab der AGB-Kontrolle (§§ 305 ff. BGB) nicht unangemessen
benachteiligend gegenüber unserem Mandanten sein dürfen. Zu betonen ist
hierbei, dass Sie auch im Rahmen der mittelbaren Grundrechtsdrittwirkung
an verschiedene Grundrechte gebunden sind.

2. {{plattform.name}}-Urteil des BGH
Ihnen sind die Urteile des Bundesgerichtshofs vom 29. Juli 2021
(Az. III ZR 179/20 und III ZR 192/20) bekannt, in denen klargestellt
wurde, dass es Plattformbetreibern verwehrt ist, Nutzerkonten ohne
sachlichen Grund und damit willkürlich zu löschen sowie dass ein vorheriges
Anhörungsverfahren durchzuführen ist. Eine vertiefte Auseinandersetzung mit
dieser Rechtsprechung erübrigt sich daher an dieser Stelle.

3. Unionsrechtliche Pflichten
[DSA-Block – Art. 14 Abs. 4, Art. 14 Abs. 1, Art. 17 Abs. 1 DSA –
 identisch für alle Plattformen, da alle VLOPs sind]

III.
Fazit

{{fazit_baustein}}

[Differenziert nach privat/gewerblich – siehe Abschnitt 5]

1.
Wir fordern Sie namens und im Auftrag unseres Mandanten auf, unverzüglich,
spätestens bis

{{frist_tag}}, den {{frist_datum}}, 12.00 Uhr (UTC+1)

das Nutzerkonto unseres Mandanten zu entsperren und den Zustand
wiederherzustellen, der vor Löschung bzw. Sperre am {{sperrDatum_formatiert}} bestand.

Weil Sie unserem Mandanten gegenüber nicht nur zur Beseitigung, sondern auch
zur (künftigen) Unterlassung verpflichtet sind, haben wir Sie namens und im
Auftrag unseres Mandanten ebenso aufzufordern, unverzüglich, jedoch spätestens bis

{{frist_tag}}, den {{frist_datum}}, 12.00 Uhr (UTC+1)

sich im Wege einer hinreichend bestimmten und strafbewehrten
Unterlassungserklärung rechtsverbindlich dazu zu verpflichten, künftige
Rechtsverletzungen zu unterlassen, um die hier bestehende
Wiederholungsgefahr auszuräumen.

Vorsichtshalber weisen wir darauf hin, dass der Zugang der
Unterlassungserklärung vorab per E-Mail oder Telefax nur dann fristwahrend
ist, wenn uns das Original anschließend zeitnah auf postalischem Wege zugeht.

Die Fristen sind auch angemessen, da Sie unlängst über die Hintergründe
informiert wurden.

Im Falle des fruchtlosen Ablaufs der vorgenannten Fristen werden wir
unmittelbar und ohne weitere Ankündigung gerichtliche Hilfe in Anspruch
nehmen und {{gerichtliche_massnahme}} gegen Sie beantragen.

Nehmen Sie zur Kenntnis, dass sich unser Mandant in jedem Falle die
Geltendmachung von materiellem und immateriellen Schadensersatz gegen
Sie vorbehält.

Mit freundlichen Grüßen

[Unterschrift / Kanzlei]
```

### Variable: `{{gerichtliche_massnahme}}`

| Track | Wert |
|-------|------|
| Track A (eV möglich) | "den Erlass einer einstweiligen Verfügung" |
| Track B (nur Klage) | "Klage auf Wiederherstellung und Schadensersatz" |

### Variable: `{{kontoTypBezeichnung}}` / `{{kontoTypBezeichnung_genitiv}}`

Wird dynamisch aus der Plattform-Auswahl erzeugt:

| Plattform | Bezeichnung | Genitiv |
|-----------|-------------|---------|
| Facebook | "der Facebook-Seite" | "der Facebook-Seite" |
| Instagram | "des Instagram-Kontos" | "des Instagram-Kontos" |
| TikTok | "des TikTok-Kontos" | "des TikTok-Kontos" |
| YouTube | "des YouTube-Kanals" | "des YouTube-Kanals" |
| X | "des X-Kontos (vormals Twitter)" | "des X-Kontos" |
| Twitch | "des Twitch-Kanals" | "des Twitch-Kanals" |
| Kick | "des Kick-Kanals" | "des Kick-Kanals" |

---

## 5. Differenzierung Privat vs. Gewerblich

### 5.1 Auswirkung auf den Sachverhalt-Baustein (Abschnitt I.)

**Privat:**
> Unser Mandant nutzt {{plattform.name}} seit {{nutzungsSeit_ca}} im privaten Rahmen. Sein Konto "{{nutzername}}" dient der persönlichen Meinungsäußerung und dem Austausch mit seiner Community. [Weitere Details aus Nutzereingaben.]

**Gewerblich:**
> Unser Mandant ist {{gewerbliche_taetigkeit}} und betreibt seit {{nutzungsSeit_ca}} das Konto "{{nutzername}}" auf {{plattform.name}} zur Bewerbung seines Geschäftsbetriebs. {{followerzahl_satz}} {{umsatz_satz}} {{vertraege_satz}}

Wobei die Sätze nur eingefügt werden, wenn die Daten vorliegen:
- `{{followerzahl_satz}}` = "Das Konto verfügt über ca. {{followerCount}} Follower/Abonnenten."
- `{{umsatz_satz}}` = "Über die Plattform generiert unser Mandant monatliche Einnahmen in Höhe von ca. {{monthlyRevenue}}."
- `{{vertraege_satz}}` = "Es bestehen aktive Werbe- und Kooperationsverträge, die durch die Sperrung unmittelbar gefährdet sind."

### 5.2 Auswirkung auf den Fazit-Baustein (Abschnitt III.)

**Privat:**
> Es ergibt sich Ihre Pflicht zur Gewährung der Nutzung der Plattform {{plattform.name}} nicht nur aus dem bestehenden Vertragsverhältnis, sondern zugleich aus der Verpflichtung zur Beachtung der deutschen Grundrechte sowie der Charta der Grundrechte der Europäischen Union.
>
> Für unseren Mandanten ist die uneingeschränkte Nutzung seines Kontos auf {{plattform.name}} von erheblicher Bedeutung. Er nutzt die Plattform zur Entfaltung seiner Meinungsäußerung und seines allgemeinen Persönlichkeitsrechts. Die Sperrung seines Accounts stellt einen unzulässigen Eingriff in sein allgemeines Persönlichkeitsrecht gemäß Art. 2 Abs. 1 i.V.m. Art. 1 Abs. 1 GG sowie in seine Meinungsfreiheit nach Art. 5 Abs. 1 GG dar.

**Gewerblich (zusätzliche Argumentation):**
> [...wie privat, plus:]
>
> Darüber hinaus stellt die Sperrung einen unzulässigen Eingriff in seine Berufsausübungsfreiheit nach Art. 12 Abs. 1 GG dar. {{followerzahl_fazit}} Er nutzt diese Plattform nicht nur zur Entfaltung seiner Meinungsäußerung und seiner künstlerischen/unternehmerischen Freiheit, sondern vor allem auch zur Bewerbung {{seines_geschaefts}}.
>
> Jede Stunde, in der er sein Konto nicht nutzen kann, verursacht ihm erhebliche wirtschaftliche Nachteile. Es ist nicht hinnehmbar, diesen Zustand fortbestehen zu lassen.
>
> Dies ist vor allem vor dem Hintergrund bemerkenswert, dass er sich nicht nur stets an die Gemeinschaftsstandards gehalten hat, sondern mit seinen Inhalten seit Jahren erheblich zur Reichweite, Attraktivität und positiven Wahrnehmung der Plattform beiträgt.

Wobei:
- `{{followerzahl_fazit}}` = "Ihm folgen dort {{followerCount_wort}} Menschen." (z.B. "mehr als zwei Millionen")
- `{{seines_geschaefts}}` = dynamisch je nach gewerblicher Tätigkeit ("seiner Musik", "seiner Dienstleistungen", "seiner Produkte" etc.)

### 5.3 Auswirkung auf den Verfügungsgrund (bei eV-Antrag, Track A)

**Privat:**
- Fortdauernde Verletzung des allgemeinen Persönlichkeitsrechts
- Fortdauernde Verletzung der Meinungsfreiheit
- Jeder Tag vertieft den Eingriff
- Außergerichtliche Aufforderung blieb erfolglos → kein milderes Mittel
- *[PLATZHALTER: Deine spezifische Argumentation für private Konten]*

**Gewerblich – DEUTLICH STÄRKER:**
- Alles aus "Privat", plus:
- Unmittelbare, täglich wachsende wirtschaftliche Schäden (bezifferbar)
- Eingriff in den eingerichteten und ausgeübten Gewerbebetrieb
- Drohender Verlust von Werbekooperationen und Verträgen
- Vertragsstrafen gegenüber Werbepartnern
- Unwiederbringlicher Follower-Verlust = bleibender Wettbewerbsnachteil
- Berufsausübungsfreiheit (Art. 12 GG)
- Existenzbedrohung bei plattformabhängigem Geschäftsmodell
- Eilbedürftigkeit liegt offensichtlich vor
- *[PLATZHALTER: Deine spezifische Argumentation für gewerbliche Konten]*

---

## 6. Fristlogik & Eskalation

### 6.1 Abmahnfrist berechnen

```
FUNKTION berechneAbmahnfrist(sperrDatum, heute, gericht):

  monatsfristEnde = sperrDatum + 30 Tage
  WENN gericht IN ["LG Frankfurt", "LG Hamburg"]:
    monatsfristEnde = sperrDatum + 35 Tage

  verbleibendeZeit = monatsfristEnde - heute

  WENN verbleibendeZeit > 21 Tage:
    abmahnfrist = 14 Tage          // Komfortable Situation
  WENN verbleibendeZeit 14–21 Tage:
    abmahnfrist = 7 Tage           // Es wird knapp
  WENN verbleibendeZeit 7–14 Tage:
    abmahnfrist = 3–5 Tage         // Sehr knapp, kurze Frist
  WENN verbleibendeZeit < 7 Tage:
    abmahnfrist = WARNUNG           // Möglicherweise direkt eV ohne Abmahnung
                                    // → Anwaltliche Einzelfallprüfung nötig

  // Sicherheitscheck: Fristende darf nie nach Monatsfristende liegen
  WENN heute + abmahnfrist > monatsfristEnde - 5:
    → Warnung: "Die eV-Frist ist sehr knapp. Ggf. direkter eV-Antrag."

  RETURN abmahnfrist
```

### 6.2 Fristüberwachung nach Abmahnungsversand

```
NACH VERSAND DER ABMAHNUNG:

Tag X:     Abmahnung versendet → Frist beginnt
Tag X+n-3: E-Mail-Erinnerung: "Frist läuft in 3 Tagen ab"
Tag X+n-1: E-Mail-Warnung: "Frist läuft morgen ab"
Tag X+n:   Fristablauf
           → E-Mail: "Frist abgelaufen."

           WENN Track A:
             → "Wir bereiten den Antrag auf einstweilige Verfügung vor"
             → eV-Antrag wird generiert
           WENN Track B:
             → "Wir bereiten die Klageschrift vor"
             → Klage wird vorbereitet

JEDERZEIT:
  Mandant kann "Konto wurde entsperrt" melden → Fall wird als RESOLVED geschlossen
```

### 6.3 Status-Flow

```
INTAKE               → Mandant füllt Formular aus
REVIEW                → Anwaltliche Prüfung (optional, oder automatisch)
LETTER_GENERATED      → Abmahnung als PDF erstellt
LETTER_SENT           → Abmahnung versendet (per Kanzlei oder Mandant bestätigt)
DEADLINE_RUNNING      → Frist läuft
DEADLINE_EXPIRED      → Frist fruchtlos abgelaufen
├── INJUNCTION_FILED  → eV-Antrag eingereicht (Track A)
└── LAWSUIT_FILED     → Klage eingereicht (Track B)
RESOLVED              → Konto entsperrt
CLOSED                → Fall abgeschlossen
```

---

## 7. Datenmodell

### 7.1 Case

```
Case {
  id:                 String (z.B. "SM-K4X8P2")
  createdAt:          DateTime
  status:             Enum (siehe 6.3)
  track:              Enum ["A_INJUNCTION", "B_LAWSUIT"]  // berechnet aus Monatsfrist

  // Mandant
  mandant: {
    vorname:          String
    nachname:         String
    email:            String (Kontakt-E-Mail)
    telefon:          String (optional)
    strasse:          String
    plz:              String
    stadt:            String
    wohnsitzDE:       Boolean (muss true sein)
  }

  // Konto & Plattform
  plattform:          Enum ["instagram", "facebook", "tiktok", "youtube", "x", "twitch", "kick"]
  nutzername:         String
  registrierteEmail:  String (die bei der Plattform hinterlegte E-Mail)
  profilUrl:          String (optional)

  // Sperrung
  sperrDatum:         Date
  sperrGrund:         Enum (siehe 3)
  sperrGrundFreitext: String (optional)
  sperrDetails:       String (Freitext, optional)

  // Uploads
  uploads:            File[] (Screenshots, E-Mails)

  // Privat / Gewerblich
  kontotyp:           Enum ["privat", "gewerblich"]

  // Gewerbliche Details (nur bei kontotyp = gewerblich)
  gewerblich?: {
    beschreibung:     String (wie wird das Konto geschäftlich genutzt)
    followerCount:    String
    monatlicheEinnahmen: String (optional)
    vertraegeBetroffen:  Boolean
  }

  // Fristlogik
  monatsfristEnde:    Date (berechnet: sperrDatum + 30/35 Tage)
  abmahnfrist:        Date (berechnet, Frist im Schreiben)
  abmahnungVersendetAm: DateTime (optional)

  // Eskalation
  evAntragErstelltAm: DateTime (optional, nur Track A)
  klageErstelltAm:    DateTime (optional, nur Track B)

  // Abschluss
  entsperrtAm:        DateTime (optional)
}
```

### 7.2 Plattform-Konfiguration (statisch)

```
Platform {
  id:                String
  name:              String
  antragsgegner:     String (juristische Person)
  adresse:           String
  bezeichnung:       String ("der Facebook-Seite", "des Instagram-Kontos" etc.)
  bezeichnungGenitiv: String
  zustaendigesGericht: String
  gerichtAdresse:    String
  isVLOP:            Boolean (für DSA-Argumentation)
}
```

---

## 8. Seitenstruktur

```
/                        → Landing Page
/start                   → Step 1: Wohnsitz DE? + Sperrdatum (Vorfilter)
/start/details           → Step 2: Plattform, Nutzername, E-Mail, Sperrgrund, Upload
/start/kontotyp          → Step 3: Privat/Gewerblich + ggf. Folgefragen
/start/daten             → Step 4: Persönliche Daten
/start/mandatierung      → Step 5: Zusammenfassung + Vollmacht + Vergütung
/fall/:id                → Fall-Übersicht mit Timeline, PDF-Downloads, Status
/fall/:id/abmahnung      → Abmahnung (PDF-Ansicht / Download)
/fall/:id/ev             → eV-Antrag (nur Track A, nur nach Fristablauf)
/fall/:id/klage          → Klage (nur Track B, nur nach Fristablauf)
/dashboard               → Alle eigenen Fälle (wenn Account-System)
/faq
/impressum
/datenschutz
/agb + Vergütungsordnung
```

---

## 9. Offene Punkte

### Von dir zu ergänzen / zu entscheiden:

- [ ] **Zuständige Gerichte** pro Plattform (für die Zuständigkeitsbestimmung + Frankfurt/Hamburg-Ausnahme)
- [ ] **Verfügungsgrund-Textbausteine** (privat vs. gewerblich – deine spezifische Argumentation)
- [ ] **eV-Antrag**: Muster / Template (kommt das auch noch von dir?)
- [ ] **Klageschrift**: Muster / Template für Track B
- [ ] **Vergütungsmodell**: Pauschal? Nach RVG? Erfolgsbasiert? Mischung?
- [ ] **Versand der Abmahnung**: Versendet die Kanzlei selbst (per E-Mail + Post)? Oder Mandant?
- [ ] **Anwaltliche Prüfung**: Geht jeder Fall automatisch raus oder schaut ein Anwalt drüber?
- [ ] **Sachverhalt**: Soll der Sachverhalt komplett aus den Formulardaten generiert werden oder gibt es ein Freitextfeld "Schildern Sie den Sachverhalt in eigenen Worten"?
- [ ] **Kick**: Australisches Unternehmen – Sonderbehandlung nötig?
- [ ] **BGH-Verweis im Schreiben**: Der BGH-Verweis bezieht sich auf Facebook. Soll bei allen Plattformen auf diese Urteile verwiesen werden (analog), oder gibt es plattformspezifische Rechtsprechung?

### Architektur-Fragen:

- [ ] **Account-System für Mandanten?** (Login, Dashboard) oder reicht ein Magic-Link per E-Mail?
- [ ] **Anwalts-Backend**: Braucht ihr ein internes Dashboard zur Fallverwaltung?
- [ ] **PDF-Erstellung**: HTML→PDF (Puppeteer) oder LaTeX-basiert? (Für Kanzlei-Briefkopf relevant)
- [ ] **E-Mail-Integration**: Automatischer E-Mail-Versand der Abmahnung an die Plattform?

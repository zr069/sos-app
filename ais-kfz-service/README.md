# AIS Kfz Service — Website

Premium, vertrauensbildende Landingpage für einen KFZ-Servicebetrieb mit Fokus auf
**Autoschlüssel, Schlösser, Wegfahrsperren und Steuergeräte-Service**.

Technisch bewusst schlank gehalten: **statisches HTML/CSS/JS, keine Build-Pipeline, kein
Framework** – startet sofort, lädt schnell, deployt direkt auf Vercel.

```
ais-kfz-service/
├── index.html        # Komplette Seitenstruktur (semantisch, deutsch)
├── styles.css        # Designsystem + alle Komponenten
├── main.js           # Header-State, Drawer, FAQ, Scroll-Reveal, Sticky-CTA, Formular
├── vercel.json       # Static-Hosting + Caching-Header
└── assets/
    ├── logo.jpg      # AIS Kfz Service Logo
    └── img/          # Echte Werkstatt-/Steuergeräte-Aufnahmen
```

---

## 1 · Designstrategie

**Positionierung:** Nicht „Schlüsseldienst um die Ecke“, sondern **Fahrzeug-Elektronik-Service
mit Werkstatt-Kompetenz.** Die Seite verkauft *Präzision und Seriosität*, nicht Dringlichkeit.

**Drei Leitprinzipien**

1. **Vertrauen vor Verkauf.** Eigentumsnachweis, „Diagnose zuerst“ und ehrliche Einschätzung
   sind keine Kleingedruckten, sondern sichtbare Argumente – im Hero, im Credibility-Band,
   in der Trust-Sektion und am Formular.
2. **Echtheit statt Stock.** Ausschließlich reale Aufnahmen vom Diagnose- und
   Programmier-Arbeitsplatz (Mikroskop-Lötarbeit, ECU am Bench-Programmer,
   Getriebesteuergerät, Signal-Diagnose). Das ist der stärkste Anti-AI-Slop-Hebel.
3. **Klare Hierarchie, ruhiges Layout.** Eine Aussage pro Sektion, eine primäre CTA pro
   Screen, großzügiger Weißraum, keine HUD-/Dashboard-Optik.

**Tonalität:** sachlich, handwerklich, technisch kompetent. Bewusst verwendete Vokabeln –
*fachgerecht, diagnosebasiert, modellabhängig, nach Prüfung, mit Eigentumsnachweis.*
Bewusst vermieden – *billig, 100 % garantiert, sofort jedes Auto öffnen.*

---

## 2 · Seitenstruktur

| # | Sektion | Funktion |
|---|---------|----------|
| 1 | **Header** (sticky, Glass) | Logo, Navigation, Rückruf, primäre CTA · Mobile-Drawer |
| 2 | **Hero** | Nutzenversprechen, 2 CTAs, 4 Vertrauenselemente, Live-Diagnose-Bild |
| 3 | **Credibility-Band** | 4 Kurzbelege (Eigentumsnachweis · Diagnose · Einschätzung · Privat & Gewerbe) |
| 4 | **Typische Situationen** | 6 Problemkarten mit Lösungshinweis (Problem→Solution) |
| 5 | **Leistungen** | 7 Service-Angebote, 3 davon als Bild-Feature-Karten |
| 6 | **Ablauf** | 4 Schritte: Anfrage → Diagnose → Durchführung → Übergabe |
| 7 | **Warum AIS (Trust)** | Werkstatt-Bild + 4 Vertrauenspunkte |
| 8 | **Werkstatt-Galerie** | 4 echte Arbeitsplatz-Aufnahmen |
| 9 | **FAQ** | 8 Fragen, Single-Open-Akkordeon |
| 10 | **Kontakt** | Info + Formular (Name, Tel, Marke, Modell, Baujahr, Anliegen, Upload) |
| 11 | **Footer** | Navigation, Recht, seriöser Rechtshinweis |
| — | **Mobile Sticky-CTA** | „Anrufen“ + „Anfrage stellen“ (erscheint nach dem Hero) |

---

## 3 · Designsystem

### Farben (gold-on-black, aus dem Logo abgeleitet)
| Token | Hex | Einsatz |
|-------|-----|---------|
| `--ink` | `#0B0C0E` | Basis dunkel |
| `--ink-3` | `#16181E` | Karten auf dunkel |
| `--gold` | `#CDA45C` | Markenakzent |
| `--gold-bright` | `#E6C588` | Highlights, Icons |
| `--gold-deep` | `#A57F3C` | Verlauf-Ende |
| `--paper` | `#F7F5F0` | helle Sektionen (warmweiß) |
| `--on-dark` / `--on-light` | `#F3F1EA` / `#14161B` | Fließtext |
| `--ok` / `--err` | `#3FB984` / `#E0574C` | Feedback (immer mit Icon, nie nur Farbe) |

Dunkle und helle Sektionen wechseln sich ab – „dunkel/hell kombinierbar“ als bewusster Rhythmus.

### Typografie
- **Display:** Sora (600/700) — technisch, präzise, premium
- **Fließtext:** Inter (400/500/600) — exzellente Lesbarkeit
- Fluid-Scale via `clamp()`, Body 16–17 px, Zeilenhöhe 1.6

### Raster & Form
- Container 1180 px · 8-pt-Spacing · Radien 10/14/20/28 px
- Schatten als abgestufte Skala · Gold-Glow nur für die primäre CTA

### Icons
Durchgehend **inline-SVG im Lucide-Stil** (Strichstärke 1.6), keine Emojis, themefähig.

---

## 4 · UX & Barrierefreiheit

- **Mobile-first**, Breakpoints 560 / 860 / 980 / 1080 px, kein Horizontal-Scroll
- Touch-Targets ≥ 44 px, Sticky-CTA mit `env(safe-area-inset-bottom)`
- Sichtbare Focus-States, `aria-*` an Drawer/Akkordeon/Formular, Tab-Reihenfolge = Lesefolge
- `prefers-reduced-motion` respektiert (Scan-/Reveal-/Pulse-Animationen aus)
- Bilder mit `width/height` + `loading="lazy"` (CLS-arm), Hero `fetchpriority="high"`
- Formular: Inline-Validierung bei Blur, Fehler am Feld, Fokus aufs erste fehlerhafte Feld
- Farbe nie als alleiniger Bedeutungsträger (immer Icon/Text dazu)

### Formular-Verarbeitung
Ohne Backend: Die Anfrage wird clientseitig validiert und als **strukturierte E-Mail**
(`mailto:` mit vorbefülltem Betreff/Body) übergeben – der Nutzer behält die Kontrolle.
Für den Produktivbetrieb lässt sich der `submit`-Handler in `main.js` auf einen echten
Endpoint (z. B. Formspree, Vercel Serverless Function, eigenes CRM) umstellen.

---

## 5 · Microcopy (Auszug)

- CTAs: „Jetzt Anfrage stellen“ · „Leistungen ansehen“ · „Fahrzeugdaten senden“ ·
  „Service anfragen“ · „Problem prüfen lassen“ · „Rückruf anfordern“
- Formular-Hinweis: *„Je genauer Ihre Beschreibung, desto präziser unsere Einschätzung.“*
- Vertrauens-Note am Formular: *„Wir arbeiten ausschließlich für rechtmäßige Fahrzeughalter.
  Halten Sie bitte einen Eigentumsnachweis (z. B. Fahrzeugschein) bereit.“*

---

## 6 · Anpassen für den Live-Betrieb

Vor dem Schalten ersetzen:

- **Telefonnummer:** Platzhalter `+490000000000` (Header, Drawer, Kontakt, Footer, Sticky-CTA)
- **E-Mail:** `kontakt@ais-kfz-service.de`
- **Adresse / Öffnungszeiten** in der Kontakt-Sektion
- **Impressum / Datenschutz / AGB:** Links (`#impressum`, `#datenschutz`, `#agb`) auf echte Seiten führen
- Optional Formular-Endpoint statt `mailto:` hinterlegen

---

## 7 · Lokal starten

```bash
cd ais-kfz-service
python3 -m http.server 4178
# → http://localhost:4178
```

## Deployment (Vercel)

Statisches Projekt, **Root Directory = `ais-kfz-service`**, kein Build-Command nötig
(Output = Verzeichnis selbst). `vercel.json` setzt Clean-URLs, langes Asset-Caching und
grundlegende Security-Header.

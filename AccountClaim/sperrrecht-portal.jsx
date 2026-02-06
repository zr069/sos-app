import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════
   CONFIGURATION & DATA
   ═══════════════════════════════════════════ */

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "◐", antragsgegner: "Meta Platforms Ireland Ltd.", adresse: "4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland", bezeichnung: "des Instagram-Kontos", bezeichnungGen: "des Instagram-Kontos", isVLOP: true },
  { id: "facebook", name: "Facebook", icon: "ƒ", antragsgegner: "Meta Platforms Ireland Ltd.", adresse: "4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland", bezeichnung: "der Facebook-Seite", bezeichnungGen: "der Facebook-Seite", isVLOP: true },
  { id: "tiktok", name: "TikTok", icon: "♪", antragsgegner: "TikTok Technology Limited", adresse: "10 Earlsfort Terrace, Dublin 2, D02 T380, Irland", bezeichnung: "des TikTok-Kontos", bezeichnungGen: "des TikTok-Kontos", isVLOP: true },
  { id: "youtube", name: "YouTube", icon: "▶", antragsgegner: "Google Ireland Limited", adresse: "Gordon House, Barrow Street, Dublin 4, Irland", bezeichnung: "des YouTube-Kanals", bezeichnungGen: "des YouTube-Kanals", isVLOP: true },
  { id: "x", name: "X (Twitter)", icon: "𝕏", antragsgegner: "Twitter International Unlimited Company", adresse: "One Cumberland Place, Fenian Street, Dublin 2, D02 AX07, Irland", bezeichnung: "des X-Kontos (vormals Twitter)", bezeichnungGen: "des X-Kontos", isVLOP: true },
  { id: "twitch", name: "Twitch", icon: "◈", antragsgegner: "Twitch Interactive Germany GmbH", adresse: "Kurfürstendamm 195, 10707 Berlin", bezeichnung: "des Twitch-Kanals", bezeichnungGen: "des Twitch-Kanals", isVLOP: false },
  { id: "kick", name: "Kick", icon: "K", antragsgegner: "Kick Streaming Pty Ltd", adresse: "100 Barangaroo Avenue, Sydney NSW 2000, Australien", bezeichnung: "des Kick-Kanals", bezeichnungGen: "des Kick-Kanals", isVLOP: false },
];

const SPERR_GRUENDE = [
  { id: "community", label: "Verstoß gegen Gemeinschaftsstandards" },
  { id: "impersonation", label: "Impersonation / Nachahmung" },
  { id: "spam", label: "Spam / Verdächtiges Verhalten" },
  { id: "copyright", label: "Urheberrechtsverstoß" },
  { id: "hate", label: "Hassrede / Diskriminierung" },
  { id: "unknown", label: "Kein Grund angegeben" },
  { id: "other", label: "Sonstiger Grund" },
];

const STEPS = [
  { id: 1, label: "Vorprüfung" },
  { id: 2, label: "Falldaten" },
  { id: 3, label: "Kontotyp" },
  { id: 4, label: "Ihre Daten" },
  { id: 5, label: "Mandatierung" },
];

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */

const fmt = (d) => new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const fmtLong = (d) => new Date(d).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const daysBetween = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 864e5);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mkId = () => "SM-" + Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.random() * 31 | 0]).join("");

function berechneTrack(sperrDatum) {
  const tageHer = daysBetween(sperrDatum, new Date());
  if (tageHer <= 30) return { track: "A", tageHer };
  if (tageHer <= 35) return { track: "A_KNAPP", tageHer };
  return { track: "B", tageHer };
}

function berechneFrist(sperrDatum) {
  const info = berechneTrack(sperrDatum);
  if (info.track === "B") return { fristTage: 14, info };
  const mEnd = addDays(sperrDatum, info.track === "A_KNAPP" ? 35 : 30);
  const left = daysBetween(new Date(), mEnd);
  let ft = 14;
  if (left <= 21 && left > 14) ft = 7;
  else if (left <= 14 && left > 7) ft = 5;
  else if (left <= 7) ft = 3;
  return { fristTage: ft, left, mEnd, info };
}

/* ═══════════════════════════════════════════
   COLORS & FONTS
   ═══════════════════════════════════════════ */

const C = {
  bg: "#FAFAF8", card: "#FFFFFF", sub: "#F3F2EE",
  tx: "#1A1A1A", tx2: "#6B6B6B", tx3: "#9A9A9A",
  acc: "#C8102E", accBg: "rgba(200,16,46,0.06)",
  bdr: "#E5E4DF", bdr2: "#F0EFEB",
  grn: "#1B7D3A", grnBg: "rgba(27,125,58,0.06)",
  amb: "#B45309", ambBg: "rgba(180,83,9,0.06)",
  redBg: "rgba(200,16,46,0.06)",
};
const F = "'Libre Baskerville','Georgia',serif";
const FS = "'Source Sans 3','Segoe UI',sans-serif";

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function App() {
  const [view, setView] = useState("landing");
  const [step, setStep] = useState(1);
  const [cases, setCases] = useState([]);
  const [cur, setCur] = useState(null);
  const [err, setErr] = useState({});
  const [form, setForm] = useState({
    wohnsitzDE: null, sperrDatum: "",
    registrierteEmail: "", nutzername: "", plattform: null, sperrGrund: "", sperrGrundFreitext: "", sperrDetails: "",
    kontotyp: null, gewerbBeschreibung: "", followerCount: "", monatlicheEinnahmen: "", vertraegeBetroffen: false,
    vorname: "", nachname: "", strasse: "", plz: "", stadt: "", emailKontakt: "", telefon: "",
    vollmacht: false, verguetung: false, datenschutz: false,
  });

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (err[k]) setErr(p => { const n = { ...p }; delete n[k]; return n; }); };
  const trackInfo = useMemo(() => form.sperrDatum ? berechneTrack(form.sperrDatum) : null, [form.sperrDatum]);

  const validate = (s) => {
    const e = {};
    if (s === 1) { if (form.wohnsitzDE === null) e.wohnsitzDE = "Bitte angeben"; if (form.wohnsitzDE === false) e.wohnsitzDE = "Nur für Mandanten mit Wohnsitz in Deutschland."; if (!form.sperrDatum) e.sperrDatum = "Pflichtfeld"; }
    if (s === 2) { if (!form.registrierteEmail) e.registrierteEmail = "Pflichtfeld"; if (!form.nutzername) e.nutzername = "Pflichtfeld"; if (!form.plattform) e.plattform = "Bitte wählen"; if (!form.sperrGrund) e.sperrGrund = "Pflichtfeld"; }
    if (s === 3) { if (form.kontotyp === null) e.kontotyp = "Bitte angeben"; }
    if (s === 4) { ["vorname","nachname","strasse","plz","stadt","emailKontakt"].forEach(k => { if (!form[k]?.trim()) e[k] = "Pflichtfeld"; }); if (form.emailKontakt && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailKontakt)) e.emailKontakt = "Ungültige E-Mail"; }
    if (s === 5) { if (!form.vollmacht) e.vollmacht = "Pflichtfeld"; if (!form.verguetung) e.verguetung = "Pflichtfeld"; if (!form.datenschutz) e.datenschutz = "Pflichtfeld"; }
    setErr(e); return !Object.keys(e).length;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const prev = () => setStep(s => Math.max(1, s - 1));

  const submit = () => {
    if (!validate(5)) return;
    const plat = PLATFORMS.find(p => p.id === form.plattform);
    const fi = berechneFrist(form.sperrDatum);
    const c = { id: mkId(), createdAt: new Date().toISOString(), track: fi.info.track === "B" ? "B" : "A", status: "LETTER_GENERATED", fristDatum: addDays(new Date(), fi.fristTage).toISOString(), fristTage: fi.fristTage, form: { ...form }, plattform: plat };
    setCases(p => [...p, c]); setCur(c); setView("result");
  };

  const Err = ({ k }) => err[k] ? <p style={{ color: C.acc, fontSize: 13, marginTop: 4, fontFamily: FS }}>{err[k]}</p> : null;

  /* ─────── LANDING ─────── */
  if (view === "landing") return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: FS }}>
      <Fonts />
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo /><div style={{ display: "flex", gap: 8 }}>{cases.length > 0 && <Btn g onClick={() => setView("dashboard")}>Meine Fälle ({cases.length})</Btn>}<Btn p onClick={() => { setView("wizard"); setStep(1); }}>Fall starten →</Btn></div>
        </div>
      </nav>
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px 60px" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.acc, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 16px" }}>Rechtsanwaltsgesellschaft · Automatisiert · Rechtssicher</p>
        <h1 style={{ fontFamily: F, fontSize: "clamp(32px,5vw,52px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-1.5px", margin: "0 0 20px", maxWidth: 640 }}>Social-Media-Konto <span style={{ color: C.acc }}>gesperrt?</span></h1>
        <p style={{ fontSize: 18, color: C.tx2, lineHeight: 1.7, maxWidth: 560, margin: "0 0 36px" }}>Wir setzen Ihr Recht auf Entsperrung durch – vom außergerichtlichen Schreiben bis zur einstweiligen Verfügung. Anwaltlich vertreten, vollständig digital.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><Btn p onClick={() => { setView("wizard"); setStep(1); }}>Jetzt Konto entsperren →</Btn><Btn s>So funktioniert es</Btn></div>
        <div style={{ display: "flex", gap: 40, marginTop: 64 }}>
          {[["2 Min.", "Bearbeitungszeit"], ["Bis 14 Tage", "Fristsetzung"], ["§ 823 BGB", "Rechtsgrundlage"]].map(([n, l], i) => (
            <div key={i}><div style={{ fontFamily: F, fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>{n}</div><div style={{ fontSize: 13, color: C.tx2, marginTop: 2 }}>{l}</div></div>
          ))}
        </div>
      </section>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}><div style={{ height: 1, background: C.bdr }} /></div>
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 40 }}>So funktioniert es</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {[["01","Daten eingeben","Plattform, Sperrdatum und Kontodaten. Sofortige Prüfung der Monatsfrist."],["02","Abmahnung","Anwaltliches Schreiben mit Fristsetzung wird generiert und versendet."],["03","Fristüberwachung","Das System überwacht die Frist. Erinnerungen per E-Mail."],["04","Eskalation","Bei Fristablauf: Einstweilige Verfügung oder Klage."]].map(([n,t,d],i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.acc, letterSpacing: "1px", marginBottom: 14 }}>{n}</div>
              <h3 style={{ fontFamily: F, fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{t}</h3>
              <p style={{ fontSize: 14, color: C.tx2, lineHeight: 1.6, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ borderTop: `1px solid ${C.bdr}`, padding: "24px 0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo /><span style={{ fontSize: 13, color: C.tx3 }}>Rechtsanwaltsgesellschaft · Alle Rechte vorbehalten</span>
        </div>
      </footer>
    </div>
  );

  /* ─────── WIZARD ─────── */
  if (view === "wizard") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FS, color: C.tx }}>
      <Fonts />
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: "none", padding: 0 }}><div style={logoMarkS}>§</div><span style={{ fontFamily: F, fontSize: 17, fontWeight: 700 }}>Sperrrecht.de</span></button>
          {cases.length > 0 && <Btn g onClick={() => setView("dashboard")}>Meine Fälle</Btn>}
        </div>
      </nav>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, background: step > s.id ? C.acc : step === s.id ? C.accBg : C.sub, color: step > s.id ? "#fff" : step === s.id ? C.acc : C.tx3, border: step === s.id ? `2px solid ${C.acc}` : "2px solid transparent" }}>{step > s.id ? "✓" : s.id}</div>
                <span style={{ fontSize: 11, color: step >= s.id ? C.tx : C.tx3, marginTop: 6, fontWeight: step === s.id ? 600 : 400, textAlign: "center" }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, margin: "0 8px", background: step > s.id ? C.acc : C.bdr }} />}
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "36px 32px" }}>

          {step === 1 && <>
            <H>Schnelle Vorprüfung</H>
            <Sub>Zwei Fragen, damit wir Ihre Möglichkeiten sofort einschätzen können.</Sub>
            <Field label="Haben Sie Ihren Wohnsitz in Deutschland? *">
              <div style={{ display: "flex", gap: 10 }}>
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => set("wohnsitzDE", v)} style={{ ...btnS, flex: 1, background: form.wohnsitzDE === v ? (v ? C.grnBg : C.redBg) : "transparent", borderColor: form.wohnsitzDE === v ? (v ? C.grn : C.acc) : C.bdr, color: form.wohnsitzDE === v ? (v ? C.grn : C.acc) : C.tx, fontWeight: form.wohnsitzDE === v ? 600 : 400 }}>{v ? "Ja" : "Nein"}</button>
                ))}
              </div>
              <Err k="wohnsitzDE" />
              {form.wohnsitzDE === false && <InfoBox c={C.acc} bg={C.redBg} t="Nicht verfügbar" m="Unser Service ist derzeit nur für Mandanten mit Wohnsitz in Deutschland verfügbar." />}
            </Field>
            <Field label="Wann wurde Ihr Konto gesperrt? *">
              <input type="date" value={form.sperrDatum} onChange={e => set("sperrDatum", e.target.value)} style={{ ...inp, ...(err.sperrDatum ? { borderColor: C.acc } : {}) }} />
              <Err k="sperrDatum" />
            </Field>
            {form.sperrDatum && trackInfo && (
              <InfoBox
                c={trackInfo.track === "B" ? C.amb : C.grn}
                bg={trackInfo.track === "B" ? C.ambBg : C.grnBg}
                t={trackInfo.track === "B" ? "⏳ Einstweilige Verfügung nicht mehr möglich" : trackInfo.track === "A_KNAPP" ? "⚡ Einstweilige Verfügung möglich – aber knapp" : "✓ Einstweilige Verfügung möglich"}
                m={trackInfo.track === "B"
                  ? `Die Sperrung liegt ${trackInfo.tageHer} Tage zurück. Die Monatsfrist ist abgelaufen. Wir können eine Abmahnung versenden und anschließend Klage erheben.`
                  : trackInfo.track === "A_KNAPP"
                  ? `Die Sperrung liegt ${trackInfo.tageHer} Tage zurück. Bei Frankfurt/Hamburg gilt eine 5-Wochen-Frist – eV noch möglich, aber die Zeit ist knapp.`
                  : `Die Sperrung liegt ${trackInfo.tageHer} Tage zurück. Einstweilige Verfügung ist möglich. Wir versenden eine Abmahnung mit kurzer Frist.`}
              />
            )}
          </>}

          {step === 2 && <>
            <H>Angaben zum gesperrten Konto</H>
            <Sub>Diese Daten benötigen wir für das anwaltliche Schreiben.</Sub>
            <Field label="Plattform *">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => set("plattform", p.id)} style={{ padding: "14px 8px", borderRadius: 8, border: `1.5px solid ${form.plattform === p.id ? C.acc : C.bdr}`, background: form.plattform === p.id ? C.accBg : C.card, cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: form.plattform === p.id ? 600 : 400, color: form.plattform === p.id ? C.acc : C.tx }}>{p.name}</div>
                  </button>
                ))}
              </div>
              <Err k="plattform" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Nutzername *"><input value={form.nutzername} onChange={e => set("nutzername", e.target.value)} placeholder="@benutzername" style={{ ...inp, ...(err.nutzername ? { borderColor: C.acc } : {}) }} /><Err k="nutzername" /></Field>
              <Field label="Registrierte E-Mail *"><input value={form.registrierteEmail} onChange={e => set("registrierteEmail", e.target.value)} placeholder="konto@email.de" style={{ ...inp, ...(err.registrierteEmail ? { borderColor: C.acc } : {}) }} /><Err k="registrierteEmail" /></Field>
            </div>
            <Field label="Grund der Sperrung *">
              <select value={form.sperrGrund} onChange={e => set("sperrGrund", e.target.value)} style={{ ...inp, appearance: "none", ...(err.sperrGrund ? { borderColor: C.acc } : {}) }}>
                <option value="">Bitte wählen…</option>{SPERR_GRUENDE.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select><Err k="sperrGrund" />
            </Field>
            {form.sperrGrund === "other" && <Field label="Sperrgrund (Freitext)"><input value={form.sperrGrundFreitext} onChange={e => set("sperrGrundFreitext", e.target.value)} style={inp} /></Field>}
            <Field label="Weitere Details (optional)"><textarea value={form.sperrDetails} onChange={e => set("sperrDetails", e.target.value)} placeholder="Was ist passiert? Einspruch eingelegt?" style={{ ...inp, minHeight: 90, resize: "vertical", lineHeight: 1.5 }} /></Field>
            <Field label="Screenshots / E-Mails hochladen">
              <div style={{ border: `2px dashed ${C.bdr}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", background: C.sub, cursor: "pointer" }}>
                <div style={{ fontSize: 24, marginBottom: 8, color: C.tx3 }}>📎</div>
                <p style={{ fontSize: 14, color: C.tx2, margin: 0 }}>Dateien hierher ziehen oder klicken</p>
                <p style={{ fontSize: 12, color: C.tx3, margin: "6px 0 0" }}>PDF, PNG, JPG – max. 10 MB</p>
              </div>
            </Field>
          </>}

          {step === 3 && <>
            <H>Wie nutzen Sie Ihr Konto?</H>
            <Sub>Die Art der Nutzung bestimmt die rechtliche Strategie – insbesondere die Eilbedürftigkeit.</Sub>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["privat","Privat","Persönliche Nutzung, Meinungsäußerung"],["gewerblich","Gewerblich","Influencer, Selbstständige, Unternehmen, Künstler"]].map(([id,l,d]) => (
                <button key={id} onClick={() => set("kontotyp", id)} style={{ padding: "24px 20px", borderRadius: 10, border: `1.5px solid ${form.kontotyp === id ? C.acc : C.bdr}`, background: form.kontotyp === id ? C.accBg : C.card, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: form.kontotyp === id ? C.acc : C.tx, marginBottom: 6 }}>{l}</div>
                  <div style={{ fontSize: 13, color: C.tx2, lineHeight: 1.5 }}>{d}</div>
                </button>
              ))}
            </div>
            <Err k="kontotyp" />
            {form.kontotyp === "gewerblich" && <>
              <div style={{ height: 1, background: C.bdr, margin: "24px 0" }} />
              <p style={{ fontFamily: F, fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Gewerbliche Details</p>
              <Field label="Wie nutzen Sie das Konto geschäftlich?"><textarea value={form.gewerbBeschreibung} onChange={e => set("gewerbBeschreibung", e.target.value)} placeholder="z.B. Bewerbung meiner Musik, Kooperationen…" style={{ ...inp, minHeight: 80, resize: "vertical" }} /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Follower / Abonnenten"><input value={form.followerCount} onChange={e => set("followerCount", e.target.value)} placeholder="z.B. 50.000" style={inp} /></Field>
                <Field label="Monatl. Einnahmen (optional)"><input value={form.monatlicheEinnahmen} onChange={e => set("monatlicheEinnahmen", e.target.value)} placeholder="z.B. 5.000 €" style={inp} /></Field>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer", marginBottom: 20 }}><input type="checkbox" checked={form.vertraegeBetroffen} onChange={e => set("vertraegeBetroffen", e.target.checked)} style={{ width: 18, height: 18, accentColor: C.acc }} />Bestehende Werbe-/Kooperationsverträge betroffen</label>
              <InfoBox c={C.grn} bg={C.grnBg} t="Stärkerer Verfügungsgrund" m="Bei gewerblichen Konten liegt die Eilbedürftigkeit regelmäßig vor – durch Umsatzeinbußen, gefährdete Verträge und den Eingriff in den Gewerbebetrieb." />
            </>}
            {form.kontotyp === "privat" && <InfoBox c={C.amb} bg={C.ambBg} t="Ansprüche bestehen auch hier" m="Der Verfügungsgrund ergibt sich aus der fortdauernden Verletzung Ihres Persönlichkeitsrechts und Ihrer Meinungsfreiheit." />}
          </>}

          {step === 4 && <>
            <H>Ihre persönlichen Daten</H>
            <Sub>Für das Mandatsverhältnis und das anwaltliche Schreiben.</Sub>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Vorname *"><input value={form.vorname} onChange={e => set("vorname", e.target.value)} style={{ ...inp, ...(err.vorname ? { borderColor: C.acc } : {}) }} /><Err k="vorname" /></Field>
              <Field label="Nachname *"><input value={form.nachname} onChange={e => set("nachname", e.target.value)} style={{ ...inp, ...(err.nachname ? { borderColor: C.acc } : {}) }} /><Err k="nachname" /></Field>
            </div>
            <Field label="Straße + Hausnr. *"><input value={form.strasse} onChange={e => set("strasse", e.target.value)} style={{ ...inp, ...(err.strasse ? { borderColor: C.acc } : {}) }} /><Err k="strasse" /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              <Field label="PLZ *"><input value={form.plz} onChange={e => set("plz", e.target.value)} style={{ ...inp, ...(err.plz ? { borderColor: C.acc } : {}) }} /><Err k="plz" /></Field>
              <Field label="Stadt *"><input value={form.stadt} onChange={e => set("stadt", e.target.value)} style={{ ...inp, ...(err.stadt ? { borderColor: C.acc } : {}) }} /><Err k="stadt" /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="E-Mail *"><input type="email" value={form.emailKontakt} onChange={e => set("emailKontakt", e.target.value)} style={{ ...inp, ...(err.emailKontakt ? { borderColor: C.acc } : {}) }} /><Err k="emailKontakt" /></Field>
              <Field label="Telefon"><input value={form.telefon} onChange={e => set("telefon", e.target.value)} placeholder="optional" style={inp} /></Field>
            </div>
          </>}

          {step === 5 && <>
            <H>Zusammenfassung & Mandatierung</H>
            <Sub>Prüfen Sie Ihre Angaben und erteilen Sie die Vollmacht.</Sub>
            <div style={{ background: C.sub, borderRadius: 10, padding: 20, marginBottom: 24 }}>
              <SRow l="Plattform" v={PLATFORMS.find(p => p.id === form.plattform)?.name} />
              <SRow l="Nutzername" v={form.nutzername} />
              <SRow l="Gesperrt am" v={fmt(form.sperrDatum)} />
              <SRow l="Sperrgrund" v={SPERR_GRUENDE.find(g => g.id === form.sperrGrund)?.label} />
              <SRow l="Kontotyp" v={form.kontotyp === "gewerblich" ? "Gewerblich" : "Privat"} />
              <SRow l="Verfahren" v={trackInfo?.track === "B" ? "Abmahnung → Klage" : "Abmahnung → Einstweilige Verfügung"} acc />
              <SRow l="Mandant" v={`${form.vorname} ${form.nachname}`} />
              <SRow l="Adresse" v={`${form.strasse}, ${form.plz} ${form.stadt}`} last />
            </div>
            <div style={{ height: 1, background: C.bdr, margin: "24px 0" }} />
            {[["vollmacht","Ich erteile der Rechtsanwaltsgesellschaft Vollmacht zur Vertretung meiner Interessen. *"],["verguetung","Ich akzeptiere die Vergütungsvereinbarung. *"],["datenschutz","Ich stimme der Datenverarbeitung gemäß Datenschutzerklärung zu. *"]].map(([k,t]) => (
              <div key={k} style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, cursor: "pointer", lineHeight: 1.5 }}>
                  <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ width: 18, height: 18, accentColor: C.acc, flexShrink: 0, marginTop: 2 }} />
                  <span>{t}</span>
                </label>
                <Err k={k} />
              </div>
            ))}
          </>}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            {step > 1 ? <Btn g onClick={prev}>← Zurück</Btn> : <div />}
            {step < 5
              ? <Btn p onClick={next} dis={step === 1 && form.wohnsitzDE === false}>Weiter →</Btn>
              : <Btn p onClick={submit} green>Mandat erteilen & Abmahnung erstellen ✓</Btn>}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─────── RESULT ─────── */
  if (view === "result" && cur) {
    const pl = cur.plattform;
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FS, color: C.tx }}>
        <Fonts />
        <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.bdr}` }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><button onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: "none", padding: 0 }}><div style={logoMarkS}>§</div><span style={{ fontFamily: F, fontSize: 17, fontWeight: 700 }}>Sperrrecht.de</span></button><Btn g onClick={() => setView("dashboard")}>Alle Fälle →</Btn></div>
        </nav>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.grnBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✓</div>
            <h1 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, margin: "0 0 6px" }}>Abmahnung erstellt</h1>
            <p style={{ fontSize: 15, color: C.tx2 }}>Fallnummer: <strong style={{ color: C.acc }}>{cur.id}</strong></p>
          </div>
          <div style={cardS}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <h3 style={{ fontFamily: F, fontSize: 18, fontWeight: 700, margin: 0 }}>Anwaltliches Schreiben</h3>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.grn, background: C.grnBg, padding: "4px 10px", borderRadius: 4 }}>Erstellt</span>
            </div>
            <p style={{ fontSize: 14, color: C.tx2, lineHeight: 1.6, margin: "0 0 16px" }}>Abmahnung an <strong style={{ color: C.tx }}>{pl.antragsgegner}</strong>. Frist: <strong style={{ color: C.acc }}>{cur.fristTage} Tage</strong>.</p>
            <div style={{ background: C.sub, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <SRow l="Frist bis" v={fmtLong(cur.fristDatum)} acc /><SRow l="Adressat" v={pl.antragsgegner} /><SRow l="Verfahren" v={cur.track === "A" ? "Track A: Abmahnung → eV" : "Track B: Abmahnung → Klage"} last />
            </div>
            <div style={{ display: "flex", gap: 8 }}><Btn p style={{ flex: 1 }} onClick={() => setView("abmahnung")}>Abmahnung ansehen →</Btn><Btn s style={{ flex: 1 }}>PDF herunterladen ↓</Btn></div>
          </div>
          <div style={cardS}>
            <h3 style={{ fontFamily: F, fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>Verfahrensablauf</h3>
            {[{ l: "Abmahnung erstellt", d: fmt(cur.createdAt), s: "done" },{ l: `Frist läuft (${cur.fristTage} Tage)`, d: `bis ${fmt(cur.fristDatum)}`, s: "active" },{ l: cur.track === "A" ? "Einstweilige Verfügung" : "Klageschrift", d: "bei Fristablauf", s: "pending", sub: cur.track === "A" && cur.form.kontotyp === "gewerblich" ? "Gewerblich → starker Verfügungsgrund" : null }].map((s, i, a) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < a.length - 1 ? 20 : 0, position: "relative" }}>
                {i < a.length - 1 && <div style={{ position: "absolute", left: 5, top: 14, width: 2, height: "calc(100% - 6px)", background: s.s === "done" ? C.grn : C.bdr }} />}
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.s === "done" ? C.grn : s.s === "active" ? C.acc : C.bdr, marginTop: 4, flexShrink: 0, boxShadow: s.s === "active" ? `0 0 8px ${C.acc}44` : "none" }} />
                <div><div style={{ fontSize: 14, fontWeight: 500, color: s.s === "pending" ? C.tx3 : C.tx }}>{s.l}</div><div style={{ fontSize: 13, color: C.tx3, marginTop: 2 }}>{s.d}</div>{s.sub && <div style={{ fontSize: 12, color: C.acc, marginTop: 4, fontWeight: 500 }}>{s.sub}</div>}</div>
              </div>
            ))}
          </div>
          <div style={{ ...cardS, background: C.sub }}><p style={{ fontSize: 14, color: C.tx2, margin: "0 0 12px" }}>Wurde Ihr Konto entsperrt?</p><Btn s onClick={() => { const u = { ...cur, status: "RESOLVED" }; setCur(u); setCases(p => p.map(x => x.id === cur.id ? u : x)); }}>✓ Ja, Konto ist entsperrt</Btn></div>
        </div>
      </div>
    );
  }

  /* ─────── ABMAHNUNG PREVIEW ─────── */
  if (view === "abmahnung" && cur) {
    const f = cur.form, pl = cur.plattform;
    const grund = SPERR_GRUENDE.find(g => g.id === f.sperrGrund)?.label || f.sperrGrundFreitext || "—";
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FS, color: C.tx }}>
        <Fonts />
        <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.bdr}` }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: "none", padding: 0 }}><div style={logoMarkS}>§</div><span style={{ fontFamily: F, fontSize: 17, fontWeight: 700 }}>Sperrrecht.de</span></button>
            <div style={{ display: "flex", gap: 8 }}><Btn g onClick={() => setView("result")}>← Zurück</Btn><Btn p small>PDF herunterladen ↓</Btn></div>
          </div>
        </nav>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>
          <div style={{ background: "#fff", border: `1px solid ${C.bdr}`, borderRadius: 4, padding: "56px 56px", fontFamily: F, fontSize: 14, lineHeight: 1.8, color: "#111", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ borderBottom: "2px solid #111", paddingBottom: 16, marginBottom: 32 }}>
              <div style={{ fontFamily: FS, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Rechtsanwaltsgesellschaft</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Sperrrecht.de</div>
              <div style={{ fontFamily: FS, fontSize: 11, color: "#888", marginTop: 4 }}>Musterstraße 1 · 10115 Berlin · info@sperrrecht.de</div>
            </div>
            <div style={{ fontFamily: FS, fontSize: 13, color: "#444", marginBottom: 32, lineHeight: 1.6 }}>{pl.antragsgegner}<br />{pl.adresse}</div>
            <div style={{ textAlign: "right", fontFamily: FS, fontSize: 13, color: "#666", marginBottom: 32 }}>Berlin, den {fmt(cur.createdAt)}</div>
            <h1 style={{ fontFamily: FS, fontSize: 15, fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", textAlign: "center", margin: "0 0 8px" }}>A B M A H N U N G</h1>
            <p style={{ fontFamily: FS, fontSize: 13, textAlign: "center", color: "#444", margin: "0 0 32px" }}>{f.vorname} {f.nachname} ./. {pl.antragsgegner} – Unterlassungsaufforderung</p>
            <p>Sehr geehrte Damen und Herren,</p>
            <p>hiermit zeigen wir an, dass wir die rechtlichen Interessen des Herrn {f.vorname} {f.nachname}, {f.strasse}, {f.plz} {f.stadt}, vertreten. Ordnungsgemäße Bevollmächtigung wird anwaltlich versichert. Wir weisen darauf hin, dass der Nachweis der schriftlichen Bevollmächtigung keine Wirksamkeitsvoraussetzung darstellt (BGH, Urteil vom 19.&nbsp;Mai 2010, I&nbsp;ZR&nbsp;140/08).</p>
            <p>Gegenstand unserer Beauftragung ist die unrechtmäßige Sperrung {pl.bezeichnung} unseres Mandanten am {fmtLong(f.sperrDatum)}</p>
            <ul style={{ listStyle: "disc", paddingLeft: 24, margin: "8px 0 16px" }}><li>Nutzername: {f.nutzername}</li><li>Verknüpft mit E-Mail: {f.registrierteEmail}</li></ul>
            <p>Mit diesem Schreiben fordern wir Sie außergerichtlich auf, die Sperre {pl.bezeichnungGen} unseres Mandanten sowie sämtliche damit verknüpfte Seiten unverzüglich aufzuheben und sie in einen Zustand ohne jegliche Einschränkungen zurückzusetzen.</p>
            <p>Im Einzelnen:</p>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "24px 0 8px" }}>I. Sachverhalt</h2>
            {f.kontotyp === "gewerblich"
              ? <p>Unser Mandant nutzt {pl.name} gewerblich.{f.gewerbBeschreibung ? " " + f.gewerbBeschreibung : ""}{f.followerCount ? ` Das Konto verfügt über ca. ${f.followerCount} Follower bzw. Abonnenten.` : ""}{f.monatlicheEinnahmen ? ` Über die Plattform generiert unser Mandant monatliche Einnahmen in Höhe von ca. ${f.monatlicheEinnahmen}.` : ""}{f.vertraegeBetroffen ? " Es bestehen aktive Werbe- und Kooperationsverträge, die durch die Sperrung unmittelbar gefährdet sind." : ""}</p>
              : <p>Unser Mandant nutzt {pl.name} im privaten Rahmen zur persönlichen Meinungsäußerung und zum Austausch mit seiner Community.</p>}
            <p>Am {fmtLong(f.sperrDatum)} sperrten Sie das Konto unseres Mandanten unter Hinweis auf angebliche Verstöße gegen die Gemeinschaftsstandards ({grund}).{f.sperrDetails ? ` ${f.sperrDetails}` : ""}</p>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "24px 0 8px" }}>II. Zu den Pflichten der Betreiber sozialer Netzwerke</h2>
            <p><strong>1. Vertragliche Pflichten</strong></p>
            <p>Zwischen unserem Mandanten und Ihnen besteht ein rechtsgeschäftliches Dauerschuldverhältnis, kraft dessen Sie gemäß §§&nbsp;311 Abs.&nbsp;1, 241 Abs.&nbsp;1 BGB verpflichtet sind, unserem Mandanten die Nutzung der Plattform {pl.name} zu ermöglichen, solange er hierbei nicht gegen geltendes deutsches oder europäisches Recht oder Ihre Nutzungsbedingungen verstößt, wobei Ihre Nutzungsbedingungen nach dem Maßstab der AGB-Kontrolle (§§&nbsp;305&nbsp;ff. BGB) nicht unangemessen benachteiligend gegenüber unserem Mandanten sein dürfen. Zu betonen ist hierbei, dass Sie auch im Rahmen der mittelbaren Grundrechtsdrittwirkung an verschiedene Grundrechte gebunden sind.</p>
            <p><strong>2. BGH-Rechtsprechung</strong></p>
            <p>Ihnen sind die Urteile des Bundesgerichtshofs vom 29.&nbsp;Juli 2021 (Az.&nbsp;III&nbsp;ZR&nbsp;179/20 und III&nbsp;ZR&nbsp;192/20) bekannt, in denen klargestellt wurde, dass es Plattformbetreibern verwehrt ist, Nutzerkonten ohne sachlichen Grund und damit willkürlich zu löschen sowie dass ein vorheriges Anhörungsverfahren durchzuführen ist.</p>
            {pl.isVLOP && <><p><strong>3. Unionsrechtliche Pflichten</strong></p><p>Für Sie als Very Large Online Platform (VLOP) im Sinne des Digital Services Acts (DSA) – EU-Verordnung 2022/2065 – ergibt sich aus Art.&nbsp;14 Abs.&nbsp;4 DSA eine unmittelbare Bindung an die EU-Grundrechtecharta. Danach ist es Ihnen untersagt, Nutzer willkürlich zu sperren. Sie sind verpflichtet, sorgfältig, objektiv und verhältnismäßig vorzugehen. Weiterhin sind Sie nach Art.&nbsp;17 Abs.&nbsp;1 DSA verpflichtet, jegliche Beschränkungen zu begründen.</p></>}
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "24px 0 8px" }}>III. Fazit</h2>
            <p>Es ergibt sich Ihre Pflicht zur Gewährung der Nutzung der Plattform {pl.name} nicht nur aus dem bestehenden Vertragsverhältnis, sondern zugleich aus der Verpflichtung zur Beachtung der deutschen Grundrechte sowie der Charta der Grundrechte der Europäischen Union.</p>
            {f.kontotyp === "gewerblich"
              ? <p>Für unseren Mandanten ist die uneingeschränkte Nutzung seines Kontos auf {pl.name} von erheblicher Bedeutung.{f.followerCount ? ` Ihm folgen dort ca. ${f.followerCount} Menschen.` : ""} Er nutzt diese Plattform nicht nur zur Entfaltung seiner Meinungsäußerung und seines allgemeinen Persönlichkeitsrechts, sondern vor allem auch zur Bewerbung seines Geschäftsbetriebs. Die Sperrung stellt einen unzulässigen Eingriff in sein allgemeines Persönlichkeitsrecht gemäß Art.&nbsp;2 Abs.&nbsp;1 i.V.m. Art.&nbsp;1 Abs.&nbsp;1 GG, in seine Meinungsfreiheit nach Art.&nbsp;5 Abs.&nbsp;1 GG sowie in seine Berufsausübungsfreiheit nach Art.&nbsp;12 Abs.&nbsp;1 GG dar. Jede Stunde, in der er sein Konto nicht nutzen kann, verursacht ihm erhebliche wirtschaftliche Nachteile. Es ist nicht hinnehmbar, diesen Zustand fortbestehen zu lassen.</p>
              : <p>Für unseren Mandanten ist die uneingeschränkte Nutzung seines Kontos auf {pl.name} von erheblicher Bedeutung. Die Sperrung stellt einen unzulässigen Eingriff in sein allgemeines Persönlichkeitsrecht gemäß Art.&nbsp;2 Abs.&nbsp;1 i.V.m. Art.&nbsp;1 Abs.&nbsp;1 GG sowie in seine Meinungsfreiheit nach Art.&nbsp;5 Abs.&nbsp;1 GG dar.</p>}
            <div style={{ margin: "28px 0", padding: "16px 20px", border: "1px solid #ccc", background: "#FAFAF8" }}>
              <p>Wir fordern Sie namens und im Auftrag unseres Mandanten auf, unverzüglich, spätestens bis</p>
              <p style={{ textAlign: "center", fontWeight: 700, fontSize: 15, margin: "12px 0" }}>{fmtLong(cur.fristDatum)}, 12:00 Uhr (UTC+1)</p>
              <p>das Nutzerkonto unseres Mandanten zu entsperren und den Zustand wiederherzustellen, der vor der Sperre am {fmtLong(f.sperrDatum)} bestand.</p>
              <p>Weil Sie unserem Mandanten gegenüber nicht nur zur Beseitigung, sondern auch zur (künftigen) Unterlassung verpflichtet sind, haben wir Sie ebenso aufzufordern, sich bis zum genannten Datum im Wege einer strafbewehrten Unterlassungserklärung rechtsverbindlich zu verpflichten, künftige Rechtsverletzungen zu unterlassen.</p>
            </div>
            <p>Im Falle des fruchtlosen Ablaufs der vorgenannten Fristen werden wir unmittelbar und ohne weitere Ankündigung gerichtliche Hilfe in Anspruch nehmen und {cur.track === "A" ? "den Erlass einer einstweiligen Verfügung" : "Klage auf Wiederherstellung und Schadensersatz"} gegen Sie beantragen.</p>
            <p>Nehmen Sie zur Kenntnis, dass sich unser Mandant in jedem Falle die Geltendmachung von materiellem und immateriellem Schadensersatz gegen Sie vorbehält.</p>
            <p style={{ marginTop: 40 }}>Mit freundlichen Grüßen</p>
            <div style={{ marginTop: 40, borderTop: "1px solid #999", width: 200, paddingTop: 8, fontFamily: FS, fontSize: 12, color: "#666" }}>Rechtsanwalt / Rechtsanwältin<br />Sperrrecht.de Rechtsanwaltsgesellschaft</div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────── DASHBOARD ─────── */
  if (view === "dashboard") {
    const all = cases.length ? cases : getDemos();
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FS, color: C.tx }}>
        <Fonts />
        <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.bdr}` }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: "none", padding: 0 }}><div style={logoMarkS}>§</div><span style={{ fontFamily: F, fontSize: 17, fontWeight: 700 }}>Sperrrecht.de</span></button>
            <Btn p onClick={() => { setView("wizard"); setStep(1); setForm(p => ({ ...p, wohnsitzDE: null, sperrDatum: "", plattform: null, kontotyp: null, vollmacht: false, verguetung: false, datenschutz: false })); }}>+ Neuer Fall</Btn>
          </div>
        </nav>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px 80px" }}>
          <h1 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.8px" }}>Fristüberwachung</h1>
          {all.map(c => {
            const dl = daysBetween(new Date(), c.fristDatum);
            const exp = dl < 0, urg = dl >= 0 && dl <= 3, res = c.status === "RESOLVED";
            const col = res ? C.grn : exp ? C.acc : urg ? C.amb : C.grn;
            return (
              <div key={c.id} onClick={() => { setCur(c); setView("result"); }} style={{ ...cardS, cursor: "pointer", marginBottom: 12, opacity: res ? 0.6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{c.id}</span>
                      <span style={{ fontSize: 12, color: C.tx3 }}>·</span>
                      <span style={{ fontSize: 13, color: C.tx2 }}>{c.plattform?.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: c.track === "A" ? C.acc : C.amb, background: c.track === "A" ? C.accBg : C.ambBg, padding: "2px 8px", borderRadius: 4 }}>{c.track === "A" ? "eV" : "Klage"}</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.tx3 }}>{c.form?.nutzername} · {c.form?.kontotyp === "gewerblich" ? "Gewerblich" : "Privat"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>{res ? <span style={{ fontSize: 13, fontWeight: 600, color: C.grn }}>✓ Entsperrt</span> : <><div style={{ fontSize: 13, fontWeight: 600, color: col }}>{exp ? "Frist abgelaufen" : `${dl} Tage verbleibend`}</div><div style={{ fontSize: 12, color: C.tx3, marginTop: 2 }}>Frist: {fmt(c.fristDatum)}</div></>}</div>
                </div>
                {exp && !res && <div style={{ marginTop: 12, padding: "10px 14px", background: C.redBg, borderRadius: 8 }}><span style={{ fontSize: 13, fontWeight: 500, color: C.acc }}>⚠ {c.track === "A" ? "Einstweilige Verfügung" : "Klageschrift"} kann erstellt werden →</span></div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════
   TINY COMPONENTS
   ═══════════════════════════════════════════ */

function Fonts() { return <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet" />; }
function Logo() { return <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={logoMarkS}>§</div><span style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 17, fontWeight: 700 }}>Sperrrecht.de</span></div>; }
function H({ children }) { return <h2 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 24, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px", lineHeight: 1.3 }}>{children}</h2>; }
function Sub({ children }) { return <p style={{ fontSize: 15, color: "#6B6B6B", margin: "0 0 28px", lineHeight: 1.6 }}>{children}</p>; }
function Field({ label, children }) { return <div style={{ marginBottom: 20 }}>{label && <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{label}</label>}{children}</div>; }
function SRow({ l, v, acc, last }) { return <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: last ? "none" : `1px solid ${C.bdr2}` }}><span style={{ fontSize: 14, color: C.tx2 }}>{l}</span><span style={{ fontSize: 14, fontWeight: 600, color: acc ? C.acc : C.tx, textAlign: "right" }}>{v}</span></div>; }
function InfoBox({ c, bg, t, m }) { return <div style={{ padding: "14px 18px", borderRadius: 10, border: `1px solid ${c}22`, background: bg, marginTop: 20 }}><p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: c }}>{t}</p><p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.6, margin: 0 }}>{m}</p></div>; }

function Btn({ children, p, s, g, green, small, dis, onClick, style: sx }) {
  const base = { fontFamily: "'Source Sans 3',sans-serif", fontSize: small ? 13 : 15, fontWeight: p ? 600 : 500, cursor: dis ? "default" : "pointer", borderRadius: small ? 6 : 8, transition: "all 0.15s", border: "none", ...(sx || {}) };
  if (p) return <button onClick={onClick} style={{ ...base, background: green ? C.grn : dis ? "#ccc" : C.acc, color: "#fff", padding: small ? "8px 18px" : "12px 28px", pointerEvents: dis ? "none" : "auto" }}>{children}</button>;
  if (s) return <button onClick={onClick} style={{ ...base, background: "transparent", color: C.tx, border: `1.5px solid ${C.bdr}`, padding: "11px 24px" }}>{children}</button>;
  if (g) return <button onClick={onClick} style={{ ...base, background: "none", color: C.tx2, padding: "8px 16px", fontSize: 14 }}>{children}</button>;
  return <button onClick={onClick} style={base}>{children}</button>;
}

const logoMarkS = { width: 32, height: 32, borderRadius: 6, background: C.acc, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 16, fontWeight: 700 };
const cardS = { background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "28px 28px", marginBottom: 16 };
const inp = { width: "100%", padding: "11px 14px", borderRadius: 8, border: `1.5px solid ${C.bdr}`, background: C.card, color: C.tx, fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" };
const btnS = { padding: "11px 24px", borderRadius: 8, border: `1.5px solid ${C.bdr}`, background: "transparent", fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, cursor: "pointer" };

function getDemos() {
  const n = new Date();
  return [
    { id: "SM-T8K3P2", createdAt: addDays(n, -8).toISOString(), track: "A", status: "DEADLINE_RUNNING", fristDatum: addDays(n, 6).toISOString(), fristTage: 14, form: { nutzername: "@maxcreator", kontotyp: "gewerblich" }, plattform: PLATFORMS[0] },
    { id: "SM-R4N7Q1", createdAt: addDays(n, -16).toISOString(), track: "A", status: "DEADLINE_EXPIRED", fristDatum: addDays(n, -2).toISOString(), fristTage: 14, form: { nutzername: "@lisadesign", kontotyp: "gewerblich" }, plattform: PLATFORMS[2] },
    { id: "SM-W6M2T9", createdAt: addDays(n, -3).toISOString(), track: "B", status: "DEADLINE_RUNNING", fristDatum: addDays(n, 11).toISOString(), fristTage: 14, form: { nutzername: "@tomblog", kontotyp: "privat" }, plattform: PLATFORMS[3] },
  ];
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent, useInView } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Briefcase,
  Home as HomeIcon,
  Shield,
  Car,
  Smartphone,
  ShoppingBag,
  Building2,
  Wallet,
  ScrollText,
  Users,
  Clock,
  FileText,
  Zap,
  Lock,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const transition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

// Data
const legalAreas = [
  { icon: Briefcase, name: "Arbeitsrecht", slug: "arbeitsrecht", desc: "Kündigung, Abfindung, Zeugnis", tags: ["Kündigung", "Abfindung"] },
  { icon: HomeIcon, name: "Mietrecht", slug: "mietrecht", desc: "Nebenkostenabrechnung, Kaution", tags: ["Mieterhöhung", "Kaution"] },
  { icon: Shield, name: "Versicherungsrecht", slug: "versicherungsrecht", desc: "Schadensregulierung, Leistungen", tags: ["KFZ", "Haftpflicht"] },
  { icon: Car, name: "Verkehrsrecht", slug: "verkehrsrecht", desc: "Bußgeld, Unfall, Führerschein", tags: ["Bußgeld", "Unfall"] },
  { icon: Smartphone, name: "Verbraucherrecht", slug: "verbraucherrecht", desc: "Widerruf, Gewährleistung", tags: ["Online-Kauf", "Garantie"] },
  { icon: ShoppingBag, name: "Kaufrecht", slug: "kaufrecht", desc: "Rückgabe, Mangel, Umtausch", tags: ["Gewährleistung", "Widerruf"] },
  { icon: Building2, name: "Wohnungseigentum", slug: "wohnungseigentum", desc: "WEG, Hausverwaltung", tags: ["WEG", "Eigentümer"] },
  { icon: Wallet, name: "Bankrecht", slug: "bankrecht", desc: "Gebühren, Kredite, Anlagen", tags: ["Gebühren", "Kredite"] },
  { icon: ScrollText, name: "Reiserecht", slug: "reiserecht", desc: "Flugverspätung, Stornierung", tags: ["Flugrecht", "Pauschalreise"] },
  { icon: Users, name: "Familienrecht", slug: "familienrecht", desc: "Unterhalt, Sorgerecht", tags: ["Unterhalt", "Scheidung"] },
];

const steps = [
  { num: "01", title: "Fall beschreiben", desc: "Beantworten Sie einige einfache Fragen zu Ihrer Situation. Kein Juristendeutsch." },
  { num: "02", title: "Ersteinschätzung erhalten", desc: "Wir prüfen Ihren Fall und zeigen Ihnen Ihre Chancen und nächsten Schritte." },
  { num: "03", title: "Recht durchsetzen", desc: "Beauftragen Sie uns optional mit der Durchsetzung. Wir kümmern uns um alles." },
];

const benefits = [
  { icon: Clock, title: "Schnelle Ersteinschätzung", desc: "In wenigen Minuten wissen Sie, ob Sie einen Anspruch haben." },
  { icon: Zap, title: "100% Digital", desc: "Alles online. Keine Anwaltstermine, keine Wartezeiten." },
  { icon: FileText, title: "Transparente Kosten", desc: "Faire Festpreise ohne versteckte Gebühren. Volle Kostenkontrolle." },
  { icon: Lock, title: "Echte Anwälte", desc: "Zugelassene Rechtsanwälte bearbeiten jeden einzelnen Fall." },
];

const pricing = [
  {
    name: "Ersteinschätzung",
    price: "0€",
    note: "Kostenlos",
    desc: "Erste Einschätzung Ihres Falls",
    features: ["Kostenlose Fallprüfung", "Erfolgsaussichten", "Handlungsoptionen", "Keine Registrierung"],
    cta: "Fall prüfen",
    featured: false,
  },
  {
    name: "Festpreis",
    price: "ab 49€",
    note: "Außergerichtlich",
    desc: "Professionelle Durchsetzung",
    features: ["Alles aus Ersteinschätzung", "Anwaltliches Schreiben", "Digitale Fallakte", "Fristen-Management", "Persönlicher Kontakt"],
    cta: "Jetzt beauftragen",
    featured: true,
  },
  {
    name: "Gerichtlich",
    price: "nach RVG",
    note: "Gesetzliche Gebühren",
    desc: "Vollständige Vertretung",
    features: ["Alles aus Festpreis", "Gerichtliche Vertretung", "Vollständige Mandatsübernahme", "RSV-Anfrage möglich"],
    cta: "Beratung anfordern",
    featured: false,
  },
];

const faqs = [
  { q: "Ist die Erstprüfung wirklich kostenlos?", a: "Ja, komplett kostenlos und unverbindlich. Erst wenn Sie sich für die aktive Durchsetzung entscheiden, fallen Kosten an." },
  { q: "Wer bearbeitet meinen Fall?", a: "Alle Fälle werden von zugelassenen Rechtsanwälten bearbeitet – entweder von unseren Anwälten oder spezialisierten Partneranwälten." },
  { q: "Wie schnell erhalte ich eine Einschätzung?", a: "Nach Abschluss des Fragebogens erhalten Sie sofort eine erste Einschätzung. Bei komplexeren Fällen melden wir uns innerhalb von 24 Stunden." },
  { q: "Welche Dokumente brauche ich?", a: "Das hängt vom Fall ab. Der Fragebogen zeigt Ihnen genau, welche Dokumente relevant sind. Der Upload ist optional, hilft aber bei der Einschätzung." },
  { q: "Wie werden die Kosten berechnet?", a: "Außergerichtlich arbeiten wir mit transparenten Festpreisen. Für gerichtliche Verfahren gilt das RVG. Sie erhalten immer vorab ein klares Angebot." },
  { q: "Was passiert mit meinen Daten?", a: "Streng vertraulich, DSGVO-konform, verschlüsselt. Alle Daten werden in deutschen Rechenzentren gespeichert und nur für Ihren Fall verwendet." },
];

const footerLinks = {
  rechtsgebiete: ["Arbeitsrecht", "Mietrecht", "Versicherungsrecht", "Verkehrsrecht", "Verbraucherrecht"],
  weitere: ["Kaufrecht", "Wohnungseigentum", "Bankrecht", "Reiserecht", "Familienrecht"],
  unternehmen: [
    { name: "Über uns", href: "/ueber-uns" },
    { name: "So funktioniert's", href: "#so-funktionierts" },
    { name: "Preise", href: "#preise" },
    { name: "FAQ", href: "#faq" },
    { name: "Kontakt", href: "/kontakt" },
  ],
  rechtliches: [
    { name: "Impressum", href: "/impressum" },
    { name: "Datenschutz", href: "/datenschutz" },
    { name: "AGB", href: "/agb" },
  ],
};

// Components
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-[var(--color-border)]"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
            <span className="font-serif text-base text-white">A</span>
          </div>
          <span className="font-serif text-xl text-[var(--color-text)]">
            Anspruch<span className="text-[var(--color-accent)]">123</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#rechtsgebiete" className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]">
            Rechtsgebiete
          </a>
          <a href="#so-funktionierts" className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]">
            So funktioniert&apos;s
          </a>
          <a href="#preise" className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]">
            Preise
          </a>
        </nav>

        <Link
          href="/fall-pruefen"
          className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5"
        >
          Fall einreichen
        </Link>
      </div>
    </motion.header>
  );
}

function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center px-6 pt-16">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Pill */}
          <motion.div variants={fadeInUp} transition={transition}>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-light)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent)]">
              Online-Kanzlei für Alltagsrecht
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            transition={transition}
            className="mt-8 font-serif text-5xl leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-6xl md:text-7xl"
          >
            Ihr Recht.
            <br />
            <span className="text-[var(--color-accent)]">Online durchgesetzt.</span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            variants={fadeInUp}
            transition={transition}
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl"
          >
            Prüfen Sie kostenlos Ihren Anspruch und setzen Sie Ihr Recht durch –
            ohne Anwaltstermin, ohne kompliziertes Juristendeutsch.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            transition={transition}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/fall-pruefen"
              className="group flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5 hover:shadow-lg"
            >
              Fall einreichen
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#so-funktionierts"
              className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-8 py-3.5 text-base font-medium text-[var(--color-text)] transition-all hover:border-[var(--color-text-muted)] hover:-translate-y-0.5"
            >
              So funktioniert&apos;s
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <ChevronDown className="h-6 w-6 animate-bounce text-[var(--color-text-muted)]" />
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="so-funktionierts" ref={ref} className="bg-[var(--color-bg-alt)] py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} transition={transition} className="text-center">
            <h2 className="font-serif text-4xl text-[var(--color-text)] md:text-5xl">
              In 3 Schritten zu Ihrem Recht
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-secondary)]">
              Einfach, schnell und transparent.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="mt-20 grid gap-8 md:grid-cols-3 md:gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                transition={{ ...transition, delay: i * 0.1 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+48px)] right-[calc(-50%+48px)] top-8 hidden h-px bg-[var(--color-border)] md:block" />
                )}

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-light)]">
                  <span className="font-serif text-2xl text-[var(--color-accent)]">{step.num}</span>
                </div>
                <h3 className="font-serif text-xl text-[var(--color-text)]">{step.title}</h3>
                <p className="mt-3 text-[var(--color-text-secondary)]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LegalAreas() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="rechtsgebiete" ref={ref} className="py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} transition={transition} className="text-center">
            <h2 className="font-serif text-4xl text-[var(--color-text)] md:text-5xl">
              10 Rechtsgebiete. Ein Portal.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-secondary)]">
              Wählen Sie Ihr Rechtsgebiet und starten Sie die kostenlose Erstprüfung.
            </p>
          </motion.div>

          {/* Grid */}
          <motion.div
            variants={staggerContainer}
            className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {legalAreas.map((area, i) => (
              <motion.div key={i} variants={fadeInUp} transition={transition}>
                <Link
                  href={`/fall-pruefen/${area.slug}`}
                  className="group relative flex flex-col rounded-xl border border-[var(--color-border)] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                >
                  {/* Left stripe on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 origin-bottom scale-y-0 rounded-l-xl bg-[var(--color-accent)] transition-transform duration-300 group-hover:scale-y-100 group-hover:origin-top" />

                  <area.icon className="h-8 w-8 text-[var(--color-accent)]" />
                  <h3 className="mt-4 font-serif text-lg text-[var(--color-text)]">{area.name}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{area.desc}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {area.tags.map((tag, j) => (
                      <span key={j} className="rounded-full bg-[var(--color-bg-alt)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Benefits() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[var(--color-bg-alt)] py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} transition={transition} className="text-center">
            <h2 className="font-serif text-4xl text-[var(--color-text)] md:text-5xl">
              Warum Anspruch123?
            </h2>
          </motion.div>

          {/* Grid */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                transition={{ ...transition, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-card)]">
                  <benefit.icon className="h-6 w-6 text-[var(--color-accent)]" />
                </div>
                <h3 className="font-serif text-lg text-[var(--color-text)]">{benefit.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="preise" ref={ref} className="py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} transition={transition} className="text-center">
            <h2 className="font-serif text-4xl text-[var(--color-text)] md:text-5xl">
              Transparente Preise
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-secondary)]">
              Keine versteckten Kosten. Sie wissen immer, was Sie zahlen.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricing.map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                transition={{ ...transition, delay: i * 0.1 }}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  plan.featured
                    ? "border-2 border-[var(--color-accent)] bg-white shadow-xl"
                    : "border border-[var(--color-border)] bg-white"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-accent)] px-4 py-1 text-xs font-medium text-white">
                    Beliebt
                  </div>
                )}

                <div className="text-center">
                  <h3 className="font-serif text-xl text-[var(--color-text)]">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="font-serif text-4xl text-[var(--color-text)]">{plan.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{plan.note}</p>
                  <p className="mt-4 text-[var(--color-text-secondary)]">{plan.desc}</p>
                </div>

                <div className="my-8 h-px bg-[var(--color-border)]" />

                <ul className="flex-1 space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                      <span className="text-sm text-[var(--color-text)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/fall-pruefen"
                  className={`mt-8 block rounded-full py-3 text-center text-sm font-medium transition-all hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                      : "border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" ref={ref} className="bg-[var(--color-bg-alt)] py-32">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} transition={transition} className="text-center">
            <h2 className="font-serif text-4xl text-[var(--color-text)] md:text-5xl">
              Häufige Fragen
            </h2>
          </motion.div>

          {/* FAQ Items */}
          <motion.div variants={fadeInUp} transition={transition} className="mt-12">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-[var(--color-border)]">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="pr-4 font-medium text-[var(--color-text)]">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-300 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-[var(--color-text-secondary)]">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[var(--color-bg-dark)] py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={transition}
            className="font-serif text-4xl text-[var(--color-text-on-dark)] md:text-5xl lg:text-6xl"
          >
            Hol dir, was dir zusteht.
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            transition={transition}
            className="mx-auto mt-6 max-w-xl text-lg text-[var(--color-text-on-dark-muted)]"
          >
            Starten Sie jetzt mit der kostenlosen Erstprüfung und erfahren Sie,
            welche Chancen Sie haben.
          </motion.p>

          <motion.div variants={fadeInUp} transition={transition} className="mt-10">
            <Link
              href="/fall-pruefen"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5 hover:shadow-xl"
            >
              Jetzt Fall prüfen
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            transition={transition}
            className="mt-6 text-sm text-[var(--color-text-on-dark-muted)]"
          >
            Kostenlos und unverbindlich. Keine Registrierung erforderlich.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--color-bg-dark)] pb-12 pt-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
                <span className="font-serif text-base text-white">A</span>
              </div>
              <span className="font-serif text-xl text-[var(--color-text-on-dark)]">
                Anspruch<span className="text-[var(--color-accent)]">123</span>
              </span>
            </Link>
          </div>

          {/* Rechtsgebiete */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-on-dark-muted)]">
              Rechtsgebiete
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.rechtsgebiete.map((name) => (
                <li key={name}>
                  <Link href={`/fall-pruefen/${name.toLowerCase()}`} className="text-sm text-[var(--color-text-on-dark-muted)] transition-colors hover:text-[var(--color-text-on-dark)]">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Weitere */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-on-dark-muted)]">
              Weitere
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.weitere.map((name) => (
                <li key={name}>
                  <Link href={`/fall-pruefen/${name.toLowerCase()}`} className="text-sm text-[var(--color-text-on-dark-muted)] transition-colors hover:text-[var(--color-text-on-dark)]">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-on-dark-muted)]">
              Unternehmen
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[var(--color-text-on-dark-muted)] transition-colors hover:text-[var(--color-text-on-dark)]">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-on-dark-muted)]">
              Rechtliches
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[var(--color-text-on-dark-muted)] transition-colors hover:text-[var(--color-text-on-dark)]">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-[var(--color-text-on-dark-muted)]">
              &copy; {new Date().getFullYear()} Anspruch123. Alle Rechte vorbehalten.
            </p>
            <p className="text-xs text-[var(--color-text-on-dark-muted)]">
              Alle Mandate werden von zugelassenen Rechtsanwälten bearbeitet.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <HowItWorks />
      <LegalAreas />
      <Benefits />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

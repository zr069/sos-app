"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basis",
    price: "0",
    priceNote: "Kostenlos",
    description: "Erste Einschätzung Ihres Falls",
    features: [
      "Kostenlose Fallprüfung",
      "Ersteinschätzung der Erfolgsaussichten",
      "Erklärung Ihrer Optionen",
      "Keine Registrierung nötig",
    ],
    cta: "Jetzt Fall prüfen",
    ctaVariant: "outline" as const,
    href: "/fall-pruefen",
    popular: false,
  },
  {
    name: "Durchsetzen",
    price: "ab 49",
    priceNote: "Festpreis",
    description: "Außergerichtliche Durchsetzung",
    features: [
      "Alles aus Basis",
      "Anwaltliches Schreiben",
      "Digitale Fallakte",
      "Fristen-Management",
      "E-Mail-Updates zum Status",
      "Persönlicher Ansprechpartner",
    ],
    cta: "Fall durchsetzen",
    ctaVariant: "default" as const,
    href: "/fall-pruefen",
    popular: true,
  },
  {
    name: "Gerichtlich",
    price: "nach RVG",
    priceNote: "gesetzliche Gebühren",
    description: "Volle gerichtliche Vertretung",
    features: [
      "Alles aus Durchsetzen",
      "Gerichtliche Vertretung",
      "Klage vor Gericht",
      "Vollständige Mandatsübernahme",
      "Abrechnung nach Rechtsanwaltsvergütungsgesetz",
      "RSV-Deckungsanfrage möglich",
    ],
    cta: "Beratung anfordern",
    ctaVariant: "secondary" as const,
    href: "/fall-pruefen",
    popular: false,
  },
];

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="preise" ref={sectionRef} className="section bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="reveal text-center">
          <h2 className="font-serif text-3xl text-[var(--color-text-primary)] md:text-4xl lg:text-5xl">
            Transparente Preise
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-secondary)]">
            Wählen Sie das passende Paket für Ihren Fall. Keine versteckten
            Kosten, keine Überraschungen.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="reveal mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
                plan.popular
                  ? "bg-white shadow-[var(--shadow-xl)] ring-2 ring-[var(--color-primary)] scale-[1.02]"
                  : "bg-white shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-4 py-1 text-xs font-semibold text-white">
                  Beliebteste Wahl
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center">
                <h3 className="font-serif text-2xl text-[var(--color-text-primary)]">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="font-serif text-5xl text-[var(--color-text-primary)]">
                    {plan.price}
                  </span>
                  <span className="text-lg text-[var(--color-text-muted)]">
                    {plan.price !== "nach RVG" && "€"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {plan.priceNote}
                </p>
                <p className="mt-4 text-[var(--color-text-secondary)]">
                  {plan.description}
                </p>
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-[var(--color-border-subtle)]" />

              {/* Features */}
              <ul className="flex-1 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                      <Check className="h-3 w-3 text-[var(--color-primary)]" />
                    </div>
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                <Link href={plan.href}>
                  <Button
                    variant={plan.ctaVariant}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="reveal mt-12 text-center text-sm text-[var(--color-text-muted)]">
          Die genauen Kosten hängen von Ihrem Rechtsgebiet und der Komplexität
          des Falls ab. Sie erhalten nach der Erstprüfung ein individuelles
          Angebot.
        </p>
      </div>
    </section>
  );
}

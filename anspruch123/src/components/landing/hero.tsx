"use client";

import Link from "next/link";
import { ArrowRight, Shield, Scale, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Shield, text: "Kostenlose Ersteinschätzung" },
  { icon: Scale, text: "Echte Anwälte, faire Festpreise" },
  { icon: CheckCircle2, text: "Kein Anwaltstermin nötig" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[var(--color-gold)]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline */}
          <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl md:text-6xl lg:text-7xl">
            Ihr Recht.{" "}
            <span className="text-[var(--color-accent)]">Online durchgesetzt.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted)] md:text-xl">
            Rechtsprobleme im Alltag? Prüfen Sie kostenlos Ihren Anspruch und
            setzen Sie Ihr Recht durch – ohne Anwaltstermin, ohne kompliziertes
            Juristendeutsch.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/fall-pruefen">
              <Button size="xl" className="group">
                Jetzt Fall prüfen
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#wie-es-funktioniert">
              <Button variant="outline" size="xl">
                So funktioniert&apos;s
              </Button>
            </a>
          </div>

          {/* Benefits */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-[var(--color-muted)]"
              >
                <benefit.icon className="h-5 w-5 text-[var(--color-sage)]" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Note */}
        <p className="mt-12 text-center text-xs text-[var(--color-muted)]">
          Anspruch123 ist eine Online-Kanzlei. Ihre Fälle werden durch unsere Anwälte
          oder spezialisierte Anwälte aus unserem Netzwerk bearbeitet.
        </p>
      </div>
    </section>
  );
}

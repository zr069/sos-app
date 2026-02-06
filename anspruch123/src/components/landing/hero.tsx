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
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--color-primary-subtle)] rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--color-surface)] rounded-full blur-3xl opacity-70 -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline */}
          <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl lg:text-7xl">
            Ihr Recht.{" "}
            <span className="text-[var(--color-primary)]">Online durchgesetzt.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-secondary)] md:text-xl leading-relaxed">
            Rechtsprobleme im Alltag? Prüfen Sie kostenlos Ihren Anspruch und
            setzen Sie Ihr Recht durch – ohne Anwaltstermin, ohne kompliziertes
            Juristendeutsch.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/fall-pruefen">
              <Button size="xl" className="group">
                Jetzt Fall prüfen
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#wie-es-funktioniert">
              <Button variant="outline" size="xl">
                So funktioniert&apos;s
              </Button>
            </a>
          </div>

          {/* Benefits */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                  <benefit.icon className="h-4 w-4 text-[var(--color-primary)]" />
                </div>
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Note */}
        <p className="mt-16 text-center text-sm text-[var(--color-text-muted)]">
          Anspruch123 ist eine Online-Kanzlei. Ihre Fälle werden durch unsere Anwälte
          oder spezialisierte Anwälte aus unserem Netzwerk bearbeitet.
        </p>
      </div>
    </section>
  );
}

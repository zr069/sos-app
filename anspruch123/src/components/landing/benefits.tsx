"use client";

import { useEffect, useRef } from "react";
import {
  Clock,
  PiggyBank,
  UserCheck,
  FileText,
  Bell,
  Lock,
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Schnell & unkompliziert",
    description:
      "In wenigen Minuten wissen Sie, ob Sie einen Anspruch haben – ohne Wartezeit auf Anwaltstermine.",
  },
  {
    icon: PiggyBank,
    title: "Transparente Festpreise",
    description:
      "Keine versteckten Gebühren. Sie sehen vorab genau, was die Durchsetzung kostet – faire Festpreise ohne Überraschungen.",
  },
  {
    icon: UserCheck,
    title: "Verständliche Sprache",
    description:
      "Kein Juristendeutsch. Wir erklären alles so, dass Sie es verstehen und informierte Entscheidungen treffen können.",
  },
  {
    icon: FileText,
    title: "Digitale Fallakte",
    description:
      "Alle Dokumente, Schreiben und Fristen an einem Ort. Immer verfügbar, immer aktuell.",
  },
  {
    icon: Bell,
    title: "Fristen-Management",
    description:
      "Wir behalten die Fristen im Blick und erinnern Sie rechtzeitig – keine wichtige Frist wird mehr verpasst.",
  },
  {
    icon: Lock,
    title: "Datenschutz garantiert",
    description:
      "Ihre Daten sind sicher. DSGVO-konform, verschlüsselt und werden nur für Ihren Fall verwendet.",
  },
];

export function Benefits() {
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
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="reveal text-center">
          <h2 className="font-serif text-3xl text-[var(--color-ink)] md:text-4xl lg:text-5xl">
            Warum Anspruch123?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Rechtsdurchsetzung muss nicht kompliziert sein. Wir machen es Ihnen
            so einfach wie möglich.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="reveal mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group flex gap-4 rounded-xl p-6 transition-colors hover:bg-white hover:shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)] transition-colors group-hover:bg-[var(--color-gold)] group-hover:text-white">
                <benefit.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[var(--color-ink)]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

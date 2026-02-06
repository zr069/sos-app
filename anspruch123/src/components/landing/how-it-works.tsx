"use client";

import { useEffect, useRef } from "react";
import { FileSearch, Scale, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileSearch,
    title: "Fall beschreiben",
    description:
      "Beantworten Sie einige einfache Fragen zu Ihrer Situation. Kein Juristendeutsch, keine komplizierten Formulare.",
  },
  {
    number: "02",
    icon: Scale,
    title: "Ersteinschätzung erhalten",
    description:
      "Wir prüfen Ihren Fall und zeigen Ihnen direkt, welche Chancen Sie haben und welche nächsten Schritte sinnvoll sind.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Recht durchsetzen",
    description:
      "Beauftragen Sie uns optional mit der Durchsetzung. Wir kümmern uns um alles – Schreiben, Fristen, bei Bedarf Anwalt.",
  },
];

export function HowItWorks() {
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
    <section
      id="wie-es-funktioniert"
      ref={sectionRef}
      className="py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="reveal text-center">
          <h2 className="font-serif text-3xl text-[var(--color-ink)] md:text-4xl lg:text-5xl">
            In 3 Schritten zu Ihrem Recht
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Einfach, schnell und transparent – so funktioniert die
            Online-Rechtsdurchsetzung mit Anspruch123.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="reveal group relative rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Step Number */}
              <div className="absolute -top-4 left-8 flex h-8 items-center justify-center rounded-full bg-[var(--color-accent)] px-3 text-sm font-bold text-white">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-paper)] text-[var(--color-sage)] transition-colors group-hover:bg-[var(--color-sage)] group-hover:text-white">
                <step.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="mt-6 font-serif text-xl text-[var(--color-ink)]">
                {step.title}
              </h3>
              <p className="mt-3 text-[var(--color-muted)]">
                {step.description}
              </p>

              {/* Connector Line (desktop) */}
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-[var(--color-border)] md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

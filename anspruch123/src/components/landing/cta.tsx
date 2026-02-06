"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
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
    <section ref={sectionRef} className="section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal relative overflow-hidden rounded-3xl bg-[var(--color-dark)] px-8 py-16 text-center md:px-16 md:py-20">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-accent)]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          </div>

          <h2 className="font-serif text-3xl text-[var(--color-dark-text)] md:text-4xl lg:text-5xl">
            Bereit, Ihr Recht durchzusetzen?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-dark-muted)]">
            Starten Sie jetzt mit der kostenlosen Erstprüfung und erfahren Sie,
            welche Chancen Sie haben.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/fall-pruefen">
              <Button size="xl" className="group bg-white text-[var(--color-dark)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]">
                Jetzt Fall prüfen
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-[var(--color-dark-muted)]">
            Kostenlos und unverbindlich. Keine Registrierung erforderlich.
          </p>
        </div>
      </div>
    </section>
  );
}

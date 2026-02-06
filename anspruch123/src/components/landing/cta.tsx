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
    <section ref={sectionRef} className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-ink)] to-[#1a2235] px-8 py-16 text-center text-white md:px-16 md:py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-[var(--color-accent)]/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl">
            Bereit, Ihr Recht durchzusetzen?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Starten Sie jetzt mit der kostenlosen Erstprüfung und erfahren Sie,
            welche Chancen Sie haben.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/fall-pruefen">
              <Button size="xl" variant="gold" className="group">
                Jetzt Fall prüfen
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/60">
            Kostenlos und unverbindlich. Keine Registrierung erforderlich.
          </p>
        </div>
      </div>
    </section>
  );
}

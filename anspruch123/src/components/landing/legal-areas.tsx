"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Briefcase,
  Home,
  Shield,
  Car,
  Smartphone,
  ShoppingBag,
  Building2,
  Wallet,
  ScrollText,
  Users,
  ArrowRight,
} from "lucide-react";
import { legalAreas, type LegalArea } from "@/data/legal-areas";

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  Home,
  Shield,
  Car,
  Smartphone,
  ShoppingBag,
  Building2,
  Wallet,
  ScrollText,
  Users,
};

function LegalAreaCard({ area }: { area: LegalArea }) {
  const Icon = iconMap[area.icon] || Shield;

  return (
    <Link
      href={`/fall-pruefen/${area.key}`}
      className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Icon with gradient background */}
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${area.color} text-white shadow-sm`}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3 className="mt-4 font-serif text-lg text-[var(--color-ink)]">
        {area.name}
      </h3>
      <p className="mt-2 flex-1 text-sm text-[var(--color-muted)]">
        {area.description}
      </p>

      {/* Hover Arrow */}
      <div className="mt-4 flex items-center text-sm font-medium text-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100">
        Fall prüfen
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export function LegalAreasSection() {
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
      id="rechtsgebiete"
      ref={sectionRef}
      className="bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="reveal text-center">
          <h2 className="font-serif text-3xl text-[var(--color-ink)] md:text-4xl lg:text-5xl">
            10 Rechtsgebiete. Ein Portal.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Wählen Sie Ihr Rechtsgebiet und starten Sie die kostenlose
            Erstprüfung Ihres Falls.
          </p>
        </div>

        {/* Legal Area Cards */}
        <div className="reveal mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {legalAreas.slice(0, 5).map((area) => (
            <LegalAreaCard key={area.key} area={area} />
          ))}
        </div>
        <div className="reveal mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {legalAreas.slice(5).map((area) => (
            <LegalAreaCard key={area.key} area={area} />
          ))}
        </div>
      </div>
    </section>
  );
}

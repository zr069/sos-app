"use client";

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
} from "lucide-react";
import { legalAreas, type LegalArea } from "@/data/legal-areas";
import { useWizard } from "../wizard-context";
import { cn } from "@/lib/utils";

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
  const { state, setLegalArea, nextStep } = useWizard();
  const Icon = iconMap[area.icon] || Shield;
  const isSelected = state.legalArea === area.key;

  const handleSelect = () => {
    setLegalArea(area.key);
    nextStep();
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all duration-200 hover:-translate-y-1",
        isSelected
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-md"
          : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/50 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-110",
          area.color
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          {area.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {area.description}
        </p>
      </div>
    </button>
  );
}

export function LegalAreaStep() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl text-[var(--color-ink)] md:text-3xl">
          Um welches Rechtsgebiet geht es?
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Wählen Sie den Bereich, der am besten zu Ihrem Anliegen passt.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {legalAreas.map((area) => (
          <LegalAreaCard key={area.key} area={area} />
        ))}
      </div>
    </div>
  );
}

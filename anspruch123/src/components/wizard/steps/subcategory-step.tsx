"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import { useWizard } from "../wizard-context";
import { cn } from "@/lib/utils";

export function SubCategoryStep() {
  const { state, legalAreaData, setSubCategory, nextStep } = useWizard();

  if (!legalAreaData) {
    return null;
  }

  const handleSelect = (subKey: string) => {
    setSubCategory(subKey);
    nextStep();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl text-[var(--color-ink)] md:text-3xl">
          Um was genau geht es?
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Wählen Sie das Thema, das am besten zu Ihrer Situation passt.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
        {legalAreaData.subCategories.map((sub) => {
          const isSelected = state.subCategory === sub.key;

          return (
            <button
              key={sub.key}
              type="button"
              onClick={() => handleSelect(sub.key)}
              className={cn(
                "group flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200",
                isSelected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-md"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/50 hover:shadow-md"
              )}
            >
              <div className="flex-1">
                <h3 className="font-serif text-lg text-[var(--color-ink)]">
                  {sub.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {sub.description}
                </p>
                {sub.urgentDeadline && (
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]">
                    <AlertTriangle className="h-4 w-4" />
                    {sub.urgentDeadline}
                  </div>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--color-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-accent)]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

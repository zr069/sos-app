"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "./wizard-context";

const steps = [
  { number: 1, label: "Rechtsgebiet" },
  { number: 2, label: "Problem" },
  { number: 3, label: "Details" },
  { number: 4, label: "Dokumente" },
  { number: 5, label: "Kontakt" },
  { number: 6, label: "Übersicht" },
];

export function WizardProgress() {
  const { state, totalSteps } = useWizard();
  const progress = ((state.currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = state.currentStep > step.number;
          const isCurrent = state.currentStep === step.number;

          return (
            <div
              key={step.number}
              className={cn(
                "flex flex-col items-center gap-2",
                index === 0 && "items-start",
                index === steps.length - 1 && "items-end"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                  isCompleted &&
                    "bg-[var(--color-sage)] text-white",
                  isCurrent &&
                    "bg-[var(--color-accent)] text-white ring-4 ring-[var(--color-accent)]/20",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-[var(--color-border)] text-[var(--color-muted)]"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isCurrent
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-muted)]"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="flex items-center justify-center gap-2 sm:hidden">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Schritt {state.currentStep} von {totalSteps}
        </span>
        <span className="text-sm text-[var(--color-muted)]">
          – {steps[state.currentStep - 1]?.label}
        </span>
      </div>
    </div>
  );
}

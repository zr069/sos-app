"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { WizardProvider, useWizard } from "./wizard-context";
import { WizardProgress } from "./wizard-progress";
import { LegalAreaStep } from "./steps/legal-area-step";
import { SubCategoryStep } from "./steps/subcategory-step";
import { QuestionsStep } from "./steps/questions-step";
import { DocumentsStep } from "./steps/documents-step";
import { ContactStep } from "./steps/contact-step";
import { SummaryStep } from "./steps/summary-step";
import { Button } from "@/components/ui/button";
import type { LegalAreaKey } from "@/data/legal-areas";

function WizardContent() {
  const { state, prevStep, nextStep, canProceed } = useWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <LegalAreaStep />;
      case 2:
        return <SubCategoryStep />;
      case 3:
        return <QuestionsStep />;
      case 4:
        return <DocumentsStep />;
      case 5:
        return <ContactStep />;
      case 6:
        return <SummaryStep />;
      default:
        return null;
    }
  };

  const showNavigation = state.currentStep < 6;

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--color-ink)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
                <span className="font-serif text-sm font-bold text-white">
                  A
                </span>
              </div>
              <span className="hidden font-serif text-lg sm:inline">
                Anspruch<span className="text-[var(--color-accent)]">123</span>
              </span>
            </Link>

            <Link
              href="/"
              className="rounded-full p-2 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-[var(--color-border)] bg-white py-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <WizardProgress />
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {renderStep()}
      </main>

      {/* Navigation Footer */}
      {showNavigation && (
        <footer className="sticky bottom-0 border-t border-[var(--color-border)] bg-white py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={state.currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="gap-2"
            >
              Weiter
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

interface CaseWizardProps {
  initialLegalArea?: LegalAreaKey;
}

export function CaseWizard({ initialLegalArea }: CaseWizardProps) {
  return (
    <WizardProvider initialLegalArea={initialLegalArea}>
      <WizardContent />
    </WizardProvider>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  FileText,
  User,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useWizard } from "../wizard-context";
import { Button } from "@/components/ui/button";

export function SummaryStep() {
  const router = useRouter();
  const { state, legalAreaData, questions } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subCategory = legalAreaData?.subCategories.find(
    (s) => s.key === state.subCategory
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Implement actual API call to save the case
      // const response = await fetch('/api/cases', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     legalArea: state.legalArea,
      //     subCategory: state.subCategory,
      //     answers: state.answers,
      //     contactInfo: state.contactInfo,
      //   }),
      // });

      setIsSubmitted(true);
    } catch {
      setSubmitError(
        "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-sage)]/10">
          <CheckCircle className="h-10 w-10 text-[var(--color-sage)]" />
        </div>
        <h2 className="font-serif text-2xl text-[var(--color-ink)] md:text-3xl">
          Vielen Dank für Ihre Anfrage!
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[var(--color-muted)]">
          Wir haben Ihre Angaben erhalten und werden Ihren Fall prüfen. Sie
          erhalten in Kürze eine E-Mail mit der Ersteinschätzung an{" "}
          <strong>{state.contactInfo?.email}</strong>.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-xl bg-[var(--color-paper)] p-6">
          <h3 className="font-serif text-lg text-[var(--color-ink)]">
            Wie geht es weiter?
          </h3>
          <ul className="mt-4 space-y-3 text-left text-sm text-[var(--color-muted)]">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">
                1
              </span>
              <span>
                Sie erhalten innerhalb von 24 Stunden eine E-Mail mit Ihrer
                Ersteinschätzung.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">
                2
              </span>
              <span>
                In der E-Mail erfahren Sie, welche Optionen Sie haben und was
                die nächsten Schritte sind.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">
                3
              </span>
              <span>
                Optional können Sie uns dann mit der Durchsetzung beauftragen –
                ganz ohne Risiko.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <Button onClick={() => router.push("/")} variant="outline">
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    );
  }

  // Get question labels for answers
  const getAnswerDisplay = (questionKey: string, answer: string | string[]) => {
    const question = questions.find((q) => q.key === questionKey);
    if (!question) return Array.isArray(answer) ? answer.join(", ") : answer;

    if (question.options) {
      if (Array.isArray(answer)) {
        return answer
          .map((a) => question.options?.find((o) => o.value === a)?.label || a)
          .join(", ");
      }
      return question.options.find((o) => o.value === answer)?.label || answer;
    }

    return Array.isArray(answer) ? answer.join(", ") : answer;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl text-[var(--color-ink)] md:text-3xl">
          Zusammenfassung
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Überprüfen Sie Ihre Angaben, bevor Sie den Fall einreichen.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Legal Area & Category */}
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
          <h3 className="flex items-center gap-2 font-serif text-lg text-[var(--color-ink)]">
            <FileText className="h-5 w-5 text-[var(--color-accent)]" />
            Ihr Anliegen
          </h3>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">Rechtsgebiet</dt>
              <dd className="font-medium text-[var(--color-ink)]">
                {legalAreaData?.name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">Thema</dt>
              <dd className="font-medium text-[var(--color-ink)]">
                {subCategory?.name}
              </dd>
            </div>
          </dl>
        </div>

        {/* Answers */}
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
          <h3 className="flex items-center gap-2 font-serif text-lg text-[var(--color-ink)]">
            <FileText className="h-5 w-5 text-[var(--color-accent)]" />
            Ihre Angaben
          </h3>
          <dl className="mt-4 space-y-3">
            {Object.entries(state.answers).map(([key, value]) => {
              const question = questions.find((q) => q.key === key);
              if (!question) return null;

              return (
                <div key={key} className="border-b border-[var(--color-border)] pb-3 last:border-0">
                  <dt className="text-sm text-[var(--color-muted)]">
                    {question.question}
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ink)]">
                    {getAnswerDisplay(key, value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* Documents */}
        {state.files.length > 0 && (
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="flex items-center gap-2 font-serif text-lg text-[var(--color-ink)]">
              <FileText className="h-5 w-5 text-[var(--color-accent)]" />
              Dokumente ({state.files.length})
            </h3>
            <ul className="mt-4 space-y-2">
              {state.files.map((file, index) => (
                <li
                  key={index}
                  className="text-sm text-[var(--color-ink)]"
                >
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact Info */}
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
          <h3 className="flex items-center gap-2 font-serif text-lg text-[var(--color-ink)]">
            <User className="h-5 w-5 text-[var(--color-accent)]" />
            Kontaktdaten
          </h3>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">Name</dt>
              <dd className="font-medium text-[var(--color-ink)]">
                {state.contactInfo?.name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">E-Mail</dt>
              <dd className="font-medium text-[var(--color-ink)]">
                {state.contactInfo?.email}
              </dd>
            </div>
            {state.contactInfo?.phone && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Telefon</dt>
                <dd className="font-medium text-[var(--color-ink)]">
                  {state.contactInfo.phone}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Legal Notice */}
        <div className="flex items-start gap-3 rounded-lg bg-[var(--color-gold)]/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-gold)]" />
          <div className="text-sm text-[var(--color-muted)]">
            <p className="font-medium text-[var(--color-ink)]">
              Hinweis zur Ersteinschätzung
            </p>
            <p className="mt-1">
              Die kostenlose Ersteinschätzung ersetzt keine individuelle
              Rechtsberatung. Sie dient als erste Orientierung zu Ihren
              Möglichkeiten. Mit dem Absenden stimmen Sie unseren{" "}
              <a
                href="/agb"
                target="_blank"
                className="text-[var(--color-accent)] hover:underline"
              >
                AGB
              </a>{" "}
              und{" "}
              <a
                href="/datenschutz"
                target="_blank"
                className="text-[var(--color-accent)] hover:underline"
              >
                Datenschutzbestimmungen
              </a>{" "}
              zu.
            </p>
          </div>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="rounded-lg bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="xl"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                Kostenlos prüfen lassen
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server-Fehler",
    description:
      "Es liegt ein Problem mit der Server-Konfiguration vor. Bitte versuchen Sie es später erneut.",
  },
  AccessDenied: {
    title: "Zugriff verweigert",
    description:
      "Sie haben keine Berechtigung, sich anzumelden. Bitte kontaktieren Sie den Support.",
  },
  Verification: {
    title: "Link abgelaufen",
    description:
      "Der Login-Link ist abgelaufen oder wurde bereits verwendet. Bitte fordern Sie einen neuen Link an.",
  },
  OAuthSignin: {
    title: "Anmeldefehler",
    description:
      "Es gab ein Problem beim Starten der Anmeldung. Bitte versuchen Sie es erneut.",
  },
  OAuthCallback: {
    title: "Anmeldefehler",
    description:
      "Es gab ein Problem bei der Verarbeitung der Anmeldung. Bitte versuchen Sie es erneut.",
  },
  OAuthCreateAccount: {
    title: "Konto-Fehler",
    description:
      "Es konnte kein Konto erstellt werden. Möglicherweise existiert bereits ein Konto mit dieser E-Mail-Adresse.",
  },
  EmailCreateAccount: {
    title: "Konto-Fehler",
    description:
      "Es konnte kein Konto erstellt werden. Bitte versuchen Sie es mit einer anderen E-Mail-Adresse.",
  },
  Callback: {
    title: "Anmeldefehler",
    description:
      "Es gab ein Problem bei der Anmeldung. Bitte versuchen Sie es erneut.",
  },
  OAuthAccountNotLinked: {
    title: "Konto nicht verknüpft",
    description:
      "Diese E-Mail-Adresse ist bereits mit einem anderen Anmeldeverfahren verknüpft. Bitte melden Sie sich mit der ursprünglichen Methode an.",
  },
  EmailSignin: {
    title: "E-Mail nicht gesendet",
    description:
      "Die Login-E-Mail konnte nicht gesendet werden. Bitte überprüfen Sie Ihre E-Mail-Adresse und versuchen Sie es erneut.",
  },
  SessionRequired: {
    title: "Anmeldung erforderlich",
    description:
      "Sie müssen angemeldet sein, um auf diese Seite zuzugreifen.",
  },
  Default: {
    title: "Anmeldefehler",
    description:
      "Es ist ein unbekannter Fehler aufgetreten. Bitte versuchen Sie es erneut.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="w-full max-w-md text-center">
      {/* Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-error)]/10">
        <AlertCircle className="h-10 w-10 text-[var(--color-error)]" />
      </div>

      {/* Heading */}
      <h1 className="font-serif text-3xl text-[var(--color-ink)]">
        {errorInfo.title}
      </h1>

      {/* Description */}
      <p className="mt-4 text-[var(--color-muted)]">{errorInfo.description}</p>

      {/* Actions */}
      <div className="mt-8 space-y-4">
        <Link href="/login">
          <Button className="w-full">
            <RefreshCw className="h-4 w-4" />
            Erneut versuchen
          </Button>
        </Link>

        <Link href="/">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Zur Startseite
          </Button>
        </Link>
      </div>

      {/* Support Link */}
      <p className="mt-8 text-sm text-[var(--color-muted)]">
        Benötigen Sie Hilfe?{" "}
        <Link
          href="/kontakt"
          className="text-[var(--color-accent)] hover:underline"
        >
          Kontaktieren Sie unseren Support
        </Link>
      </p>

      {/* Debug info in dev */}
      {process.env.NODE_ENV === "development" && error !== "Default" && (
        <div className="mt-8 rounded-lg bg-gray-100 p-4 text-left text-xs text-gray-600">
          <strong>Debug:</strong> Error code: {error}
        </div>
      )}
    </div>
  );
}

export default function LoginErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-muted)]/10">
              <AlertCircle className="h-10 w-10 text-[var(--color-muted)]" />
            </div>
            <h1 className="font-serif text-3xl text-[var(--color-ink)]">
              Laden...
            </h1>
          </div>
        }
      >
        <ErrorContent />
      </Suspense>
    </div>
  );
}

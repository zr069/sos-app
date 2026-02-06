"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
      } else {
        setIsEmailSent(true);
      }
    } catch {
      setError("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  if (isEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-sage)]/10">
            <Mail className="h-8 w-8 text-[var(--color-sage)]" />
          </div>
          <h1 className="font-serif text-2xl text-[var(--color-ink)]">
            E-Mail gesendet
          </h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Wir haben einen Login-Link an <strong>{email}</strong> gesendet.
            Klicken Sie auf den Link in der E-Mail, um sich anzumelden.
          </p>
          <p className="mt-6 text-sm text-[var(--color-muted)]">
            Keine E-Mail erhalten?{" "}
            <button
              onClick={() => setIsEmailSent(false)}
              className="text-[var(--color-accent)] hover:underline"
            >
              Erneut versuchen
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]">
              <span className="font-serif text-lg font-bold text-white">A</span>
            </div>
            <span className="font-serif text-2xl">
              Anspruch<span className="text-[var(--color-accent)]">123</span>
            </span>
          </Link>

          {/* Heading */}
          <h1 className="mt-8 font-serif text-3xl text-[var(--color-ink)]">
            Willkommen zurück
          </h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Melden Sie sich an, um Ihre Fälle zu verwalten.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-lg bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="form-input"
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Mit E-Mail anmelden
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[var(--color-paper)] px-4 text-[var(--color-muted)]">
                oder
              </span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="mt-8 w-full"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Mit Google anmelden
          </Button>

          {/* Privacy Note */}
          <p className="mt-8 text-center text-xs text-[var(--color-muted)]">
            Mit der Anmeldung stimmen Sie unseren{" "}
            <Link
              href="/agb"
              className="text-[var(--color-accent)] hover:underline"
            >
              AGB
            </Link>{" "}
            und{" "}
            <Link
              href="/datenschutz"
              className="text-[var(--color-accent)] hover:underline"
            >
              Datenschutzbestimmungen
            </Link>{" "}
            zu.
          </p>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="relative hidden flex-1 bg-[var(--color-ink)] lg:block">
        <div className="absolute inset-0 flex flex-col justify-center px-16">
          <div className="max-w-md text-white">
            <h2 className="font-serif text-4xl">
              Ihr Dashboard für alle Rechtsfälle
            </h2>
            <p className="mt-6 text-lg text-white/70">
              Behalten Sie den Überblick über Ihre Fälle, kommunizieren Sie
              direkt mit Ihrem Anwalt und laden Sie Dokumente hoch – alles an
              einem Ort.
            </p>
            <ul className="mt-8 space-y-4 text-white/80">
              <li className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-sage)]">
                  <span className="text-sm font-bold text-white">1</span>
                </div>
                Status aller Fälle auf einen Blick
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-sage)]">
                  <span className="text-sm font-bold text-white">2</span>
                </div>
                Direkte Kommunikation mit Ihrem Anwalt
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-sage)]">
                  <span className="text-sm font-bold text-white">3</span>
                </div>
                Alle Dokumente sicher an einem Ort
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-sage)]">
                  <span className="text-sm font-bold text-white">4</span>
                </div>
                Fristen immer im Blick
              </li>
            </ul>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
        <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />
      </div>
    </div>
  );
}

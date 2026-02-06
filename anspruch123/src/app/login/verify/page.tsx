"use client";

import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-sage)]/10">
          <Mail className="h-10 w-10 text-[var(--color-sage)]" />
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl text-[var(--color-ink)]">
          Prüfen Sie Ihr Postfach
        </h1>

        {/* Description */}
        <p className="mt-4 text-[var(--color-muted)]">
          Wir haben Ihnen einen Login-Link per E-Mail gesendet. Klicken Sie auf
          den Link in der E-Mail, um sich anzumelden.
        </p>

        {/* Additional Info */}
        <div className="mt-8 rounded-lg border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-medium text-[var(--color-ink)]">
            Keine E-Mail erhalten?
          </h2>
          <ul className="mt-4 space-y-2 text-left text-sm text-[var(--color-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-sage)]">•</span>
              Prüfen Sie Ihren Spam-Ordner
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-sage)]">•</span>
              Stellen Sie sicher, dass die E-Mail-Adresse korrekt ist
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-sage)]">•</span>
              Der Link ist 24 Stunden gültig
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Login
            </Button>
          </Link>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-[var(--color-muted)]">
          Probleme beim Anmelden?{" "}
          <Link
            href="/kontakt"
            className="text-[var(--color-accent)] hover:underline"
          >
            Kontaktieren Sie uns
          </Link>
        </p>
      </div>
    </div>
  );
}

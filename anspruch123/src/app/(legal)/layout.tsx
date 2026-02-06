import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
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
              <span className="font-serif text-lg">
                Anspruch<span className="text-[var(--color-accent)]">123</span>
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <article className="prose prose-gray max-w-none">
          {children}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-[var(--color-muted)] sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} Anspruch123. Alle Rechte
            vorbehalten.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link
              href="/impressum"
              className="hover:text-[var(--color-ink)]"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="hover:text-[var(--color-ink)]"
            >
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:text-[var(--color-ink)]">
              AGB
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

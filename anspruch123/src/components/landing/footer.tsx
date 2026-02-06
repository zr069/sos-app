import Link from "next/link";
import { legalAreas } from "@/data/legal-areas";

const footerLinks = {
  rechtsgebiete: legalAreas.slice(0, 5).map((area) => ({
    name: area.name,
    href: `/fall-pruefen/${area.key}`,
  })),
  unternehmen: [
    { name: "Über uns", href: "/ueber-uns" },
    { name: "So funktioniert's", href: "/#wie-es-funktioniert" },
    { name: "Preise", href: "/#preise" },
    { name: "FAQ", href: "/#faq" },
    { name: "Kontakt", href: "/kontakt" },
  ],
  rechtliches: [
    { name: "Impressum", href: "/impressum" },
    { name: "Datenschutz", href: "/datenschutz" },
    { name: "AGB", href: "/agb" },
    { name: "Cookie-Einstellungen", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-paper)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--color-ink)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]">
                <span className="font-serif text-lg font-bold text-white">
                  A
                </span>
              </div>
              <span className="font-serif text-xl font-normal">
                Anspruch<span className="text-[var(--color-accent)]">123</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-[var(--color-muted)]">
              Ihr Recht. Online durchgesetzt. Die moderne Art, Rechtsprobleme zu
              lösen.
            </p>
          </div>

          {/* Rechtsgebiete */}
          <div>
            <h3 className="font-serif text-sm font-medium text-[var(--color-ink)]">
              Rechtsgebiete
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.rechtsgebiete.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/fall-pruefen"
                  className="text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
                >
                  Alle anzeigen
                </Link>
              </li>
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <h3 className="font-serif text-sm font-medium text-[var(--color-ink)]">
              Unternehmen
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="font-serif text-sm font-medium text-[var(--color-ink)]">
              Rechtliches
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 md:flex-row">
          <p className="text-sm text-[var(--color-muted)]">
            &copy; {new Date().getFullYear()} Anspruch123. Alle Rechte
            vorbehalten.
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Anspruch123 ist eine Online-Kanzlei. Ihre Fälle werden durch unsere
            Anwälte oder spezialisierte Partneranwälte bearbeitet.
          </p>
        </div>
      </div>
    </footer>
  );
}

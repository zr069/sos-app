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
    <footer className="bg-[var(--color-dark)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[var(--color-dark-text)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]">
                <span className="font-serif text-lg text-white">A</span>
              </div>
              <span className="font-serif text-xl">
                Anspruch<span className="text-[var(--color-primary-light)]">123</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-[var(--color-dark-muted)] leading-relaxed">
              Ihr Recht. Online durchgesetzt. Die moderne Art, Rechtsprobleme zu
              lösen.
            </p>
          </div>

          {/* Rechtsgebiete */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-dark-text)] uppercase tracking-wider">
              Rechtsgebiete
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.rechtsgebiete.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-dark-muted)] transition-colors duration-200 hover:text-[var(--color-dark-text)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/fall-pruefen"
                  className="text-sm font-medium text-[var(--color-primary-light)] transition-colors duration-200 hover:text-white"
                >
                  Alle anzeigen
                </Link>
              </li>
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-dark-text)] uppercase tracking-wider">
              Unternehmen
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-dark-muted)] transition-colors duration-200 hover:text-[var(--color-dark-text)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-dark-text)] uppercase tracking-wider">
              Rechtliches
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-dark-muted)] transition-colors duration-200 hover:text-[var(--color-dark-text)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px bg-white/10" />

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-[var(--color-dark-muted)]">
            &copy; {new Date().getFullYear()} Anspruch123. Alle Rechte
            vorbehalten.
          </p>
          <p className="text-xs text-[var(--color-dark-muted)]">
            Anspruch123 ist eine Online-Kanzlei. Ihre Fälle werden durch unsere
            Anwälte oder spezialisierte Partneranwälte bearbeitet.
          </p>
        </div>
      </div>
    </footer>
  );
}

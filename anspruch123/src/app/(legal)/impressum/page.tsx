import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von Anspruch123 - Angaben gemäß § 5 TMG",
};

export default function ImpressumPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl text-[var(--color-ink)]">Impressum</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Angaben gemäß § 5 TMG
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          Anbieter
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Anspruch123 GmbH
          <br />
          Musterstraße 123
          <br />
          10115 Berlin
          <br />
          Deutschland
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">Kontakt</h2>
        <p className="mt-4 text-[var(--color-ink)]">
          E-Mail: kontakt@anspruch123.de
          <br />
          Telefon: +49 (0) 30 123456789
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          Vertretungsberechtigte Geschäftsführer
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">Max Mustermann</p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          Registereintrag
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Handelsregister: Amtsgericht Berlin-Charlottenburg
          <br />
          Registernummer: HRB 123456
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          Umsatzsteuer-ID
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
          <br />
          DE123456789
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Max Mustermann
          <br />
          Musterstraße 123
          <br />
          10115 Berlin
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          Streitschlichtung
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          Haftungsausschluss
        </h2>
        <h3 className="mt-4 font-serif text-xl text-[var(--color-ink)]">
          Haftung für Inhalte
        </h3>
        <p className="mt-2 text-[var(--color-ink)]">
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine
          rechtswidrige Tätigkeit hinweisen.
        </p>

        <h3 className="mt-6 font-serif text-xl text-[var(--color-ink)]">
          Haftung für Links
        </h3>
        <p className="mt-2 text-[var(--color-ink)]">
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
          der Seiten verantwortlich.
        </p>

        <h3 className="mt-6 font-serif text-xl text-[var(--color-ink)]">
          Urheberrecht
        </h3>
        <p className="mt-2 text-[var(--color-ink)]">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
          diesen Seiten unterliegen dem deutschen Urheberrecht. Die
          Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
          schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          Hinweis zur Rechtsberatung
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Anspruch123 ist eine Online-Kanzlei. Rechtsdienstleistungen werden
          durch zugelassene Rechtsanwälte erbracht. Die kostenlose Erstprüfung
          dient der ersten Orientierung. Ihre Fälle werden durch unsere Anwälte
          oder spezialisierte Partneranwälte aus unserem Netzwerk bearbeitet.
        </p>
      </section>

      <p className="mt-12 text-sm text-[var(--color-muted)]">
        Stand: {new Date().toLocaleDateString("de-DE")}
      </p>
    </div>
  );
}

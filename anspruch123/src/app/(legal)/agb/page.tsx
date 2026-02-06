import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "AGB von Anspruch123 - Allgemeine Geschäftsbedingungen für die Nutzung unserer Dienste",
};

export default function AGBPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl text-[var(--color-ink)]">
        Allgemeine Geschäftsbedingungen
      </h1>
      <p className="mt-4 text-[var(--color-muted)]">
        AGB der Anspruch123 GmbH für die Nutzung der Online-Plattform
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 1 Geltungsbereich
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
          Verträge zwischen der Anspruch123 GmbH (nachfolgend
          &quot;Anbieter&quot;) und dem Nutzer (nachfolgend &quot;Kunde&quot;)
          über die Nutzung der Online-Plattform anspruch123.de.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es
          sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich
          zu.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 2 Vertragsgegenstand
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) Der Anbieter betreibt eine Online-Kanzlei, die Privatpersonen
          ermöglicht, Rechtsprobleme des Alltags zu prüfen und bei Bedarf
          durchsetzen zu lassen.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) Die kostenlose Erstprüfung dient der ersten Orientierung.
          Rechtsdienstleistungen werden durch zugelassene Rechtsanwälte der
          Online-Kanzlei oder spezialisierte Partneranwälte erbracht.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (3) Bei Beauftragung der Rechtsdurchsetzung werden die Fälle durch
          unsere Anwälte oder Partneranwälte aus unserem Netzwerk bearbeitet.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 3 Leistungen und Preise
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) <strong>Basis (kostenlos):</strong> Kostenlose Erstprüfung des
          Falls mit erster Einschätzung der Erfolgsaussichten.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) <strong>Durchsetzen (Festpreis):</strong> Außergerichtliche
          Durchsetzung des Anspruchs durch anwaltliches Schreiben,
          Fristenmanagement und digitale Fallakte. Der genaue Preis wird vor
          Beauftragung mitgeteilt.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (3) <strong>Gerichtlich (nach RVG):</strong> Vollständige
          gerichtliche Vertretung. Die Vergütung richtet sich nach dem
          Rechtsanwaltsvergütungsgesetz (RVG). Auf Wunsch prüfen wir die
          Deckung durch Ihre Rechtsschutzversicherung.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (4) Alle Preise verstehen sich inklusive der gesetzlichen
          Mehrwertsteuer.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 4 Vertragsschluss
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) Die Darstellung der Leistungen auf der Website stellt kein
          verbindliches Angebot dar.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) Der Vertrag über die Erstprüfung kommt mit dem Absenden des
          ausgefüllten Wizard-Formulars zustande.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (3) Der Vertrag über die Rechtsdurchsetzung kommt erst mit
          ausdrücklicher Beauftragung und Zahlungseingang (bei Festpreis) bzw.
          mit Unterzeichnung des Mandatsvertrags (bei gerichtlicher Vertretung)
          zustande.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 5 Mitwirkungspflichten des Kunden
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) Der Kunde ist verpflichtet, alle für die Fallbearbeitung
          erforderlichen Informationen wahrheitsgemäß und vollständig
          mitzuteilen.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) Der Kunde stellt auf Anforderung alle relevanten Dokumente zur
          Verfügung.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (3) Der Kunde informiert den Anbieter unverzüglich über alle
          Änderungen, die für den Fall relevant sein könnten.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 6 Zahlung
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) Bei Festpreisleistungen ist die Zahlung vor Leistungsbeginn
          fällig.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) Die Zahlung erfolgt über die auf der Plattform angebotenen
          Zahlungsmethoden (Kreditkarte, SEPA-Lastschrift, etc.).
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (3) Bei gerichtlicher Vertretung nach RVG wird die Vergütung nach
          den gesetzlichen Bestimmungen des Rechtsanwaltsvergütungsgesetzes
          berechnet und gemäß Mandatsvertrag fällig.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 7 Widerrufsrecht
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe
          von Gründen den Vertrag zu widerrufen.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
          Vertragsabschlusses.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (3) Um das Widerrufsrecht auszuüben, müssen Sie uns mittels einer
          eindeutigen Erklärung (z.B. per E-Mail an widerruf@anspruch123.de)
          über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (4) Das Widerrufsrecht erlischt vorzeitig, wenn wir die Leistung
          vollständig erbracht haben und mit der Ausführung der Leistung erst
          begonnen haben, nachdem der Verbraucher dazu seine ausdrückliche
          Zustimmung gegeben hat.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 8 Haftung
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung
          des Lebens, des Körpers oder der Gesundheit sowie für vorsätzlich
          oder grob fahrlässig verursachte Schäden.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) Für die kostenlose Erstprüfung übernimmt der Anbieter keine
          Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der
          Einschätzung.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (3) Im Übrigen ist die Haftung für leicht fahrlässige
          Pflichtverletzungen ausgeschlossen, soweit nicht wesentliche
          Vertragspflichten verletzt werden.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 9 Datenschutz
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer
          Datenschutzerklärung, die unter{" "}
          <a
            href="/datenschutz"
            className="text-[var(--color-accent)] hover:underline"
          >
            anspruch123.de/datenschutz
          </a>{" "}
          abrufbar ist.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          § 10 Schlussbestimmungen
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          (1) Es gilt das Recht der Bundesrepublik Deutschland unter
          Ausschluss des UN-Kaufrechts.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (2) Ist der Kunde Kaufmann, juristische Person des öffentlichen
          Rechts oder öffentlich-rechtliches Sondervermögen, ist
          ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem
          Vertrag Berlin.
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
          werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </section>

      <p className="mt-12 text-sm text-[var(--color-muted)]">
        Stand: {new Date().toLocaleDateString("de-DE")}
      </p>
    </div>
  );
}

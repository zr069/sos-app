import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von Anspruch123 - Informationen zur Verarbeitung Ihrer personenbezogenen Daten",
};

export default function DatenschutzPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl text-[var(--color-ink)]">
        Datenschutzerklärung
      </h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Informationen zur Verarbeitung Ihrer personenbezogenen Daten gemäß
        Art. 13 und 14 DSGVO
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          1. Verantwortlicher
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          Anspruch123 GmbH
          <br />
          Musterstraße 123
          <br />
          10115 Berlin
          <br />
          E-Mail: datenschutz@anspruch123.de
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          2. Erhebung und Verarbeitung personenbezogener Daten
        </h2>

        <h3 className="mt-6 font-serif text-xl text-[var(--color-ink)]">
          2.1 Beim Besuch unserer Website
        </h3>
        <p className="mt-2 text-[var(--color-ink)]">
          Beim Besuch unserer Website werden automatisch folgende Daten
          erhoben und in Server-Logfiles gespeichert:
        </p>
        <ul className="mt-2 list-disc pl-6 text-[var(--color-ink)]">
          <li>IP-Adresse des anfragenden Rechners</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Name und URL der abgerufenen Datei</li>
          <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
          <li>
            Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners
          </li>
        </ul>
        <p className="mt-4 text-[var(--color-ink)]">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an der Sicherstellung des technischen Betriebs).
        </p>

        <h3 className="mt-6 font-serif text-xl text-[var(--color-ink)]">
          2.2 Bei der Fallprüfung (Wizard)
        </h3>
        <p className="mt-2 text-[var(--color-ink)]">
          Wenn Sie unseren Fallprüfungs-Wizard nutzen, werden folgende Daten
          erhoben:
        </p>
        <ul className="mt-2 list-disc pl-6 text-[var(--color-ink)]">
          <li>Ihre Angaben zu Ihrem Rechtsfall</li>
          <li>Name und Kontaktdaten</li>
          <li>Hochgeladene Dokumente</li>
        </ul>
        <p className="mt-4 text-[var(--color-ink)]">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) bzw.
          Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
        </p>

        <h3 className="mt-6 font-serif text-xl text-[var(--color-ink)]">
          2.3 Bei der Registrierung
        </h3>
        <p className="mt-2 text-[var(--color-ink)]">
          Bei der Erstellung eines Benutzerkontos werden erhoben:
        </p>
        <ul className="mt-2 list-disc pl-6 text-[var(--color-ink)]">
          <li>E-Mail-Adresse</li>
          <li>Name</li>
          <li>Optional: Telefonnummer</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          3. Zweck der Datenverarbeitung
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Wir verarbeiten Ihre Daten zu folgenden Zwecken:
        </p>
        <ul className="mt-2 list-disc pl-6 text-[var(--color-ink)]">
          <li>Bereitstellung und Verbesserung unserer Dienste</li>
          <li>Bearbeitung Ihrer Rechtsanfragen</li>
          <li>Kommunikation mit Ihnen</li>
          <li>Abrechnung unserer Leistungen</li>
          <li>Einhaltung rechtlicher Verpflichtungen</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          4. Weitergabe von Daten
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Ihre Daten werden nur weitergegeben, wenn:
        </p>
        <ul className="mt-2 list-disc pl-6 text-[var(--color-ink)]">
          <li>Sie ausdrücklich eingewilligt haben</li>
          <li>
            dies zur Vertragserfüllung erforderlich ist (z.B. an kooperierende
            Rechtsanwälte)
          </li>
          <li>eine gesetzliche Verpflichtung besteht</li>
          <li>
            dies zur Wahrung berechtigter Interessen erforderlich ist und
            keine überwiegenden schutzwürdigen Interessen Ihrerseits
            entgegenstehen
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          5. Speicherdauer
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies
          für die Erfüllung der Zwecke, für die sie erhoben wurden,
          erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
          Falldaten werden nach Abschluss des Falls und Ablauf der
          gesetzlichen Aufbewahrungsfristen gelöscht.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          6. Ihre Rechte
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
        </p>
        <ul className="mt-2 list-disc pl-6 text-[var(--color-ink)]">
          <li>
            <strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie haben das
            Recht, Auskunft über Ihre bei uns gespeicherten Daten zu erhalten.
          </li>
          <li>
            <strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie können
            die Berichtigung unrichtiger Daten verlangen.
          </li>
          <li>
            <strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können unter
            bestimmten Voraussetzungen die Löschung Ihrer Daten verlangen.
          </li>
          <li>
            <strong>
              Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO):
            </strong>{" "}
            Sie können unter bestimmten Voraussetzungen die Einschränkung der
            Verarbeitung verlangen.
          </li>
          <li>
            <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie können der
            Verarbeitung Ihrer Daten widersprechen.
          </li>
          <li>
            <strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong>{" "}
            Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen
            und maschinenlesbaren Format zu erhalten.
          </li>
        </ul>
        <p className="mt-4 text-[var(--color-ink)]">
          Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:
          datenschutz@anspruch123.de
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          7. Beschwerderecht
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
          über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu
          beschweren. Die für uns zuständige Aufsichtsbehörde ist:
        </p>
        <p className="mt-4 text-[var(--color-ink)]">
          Berliner Beauftragte für Datenschutz und Informationsfreiheit
          <br />
          Alt-Moabit 59-61
          <br />
          10555 Berlin
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          8. Cookies
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Wir verwenden Cookies, um unsere Website benutzerfreundlicher zu
          gestalten. Dabei unterscheiden wir zwischen:
        </p>
        <ul className="mt-2 list-disc pl-6 text-[var(--color-ink)]">
          <li>
            <strong>Technisch notwendige Cookies:</strong> Diese sind für den
            Betrieb der Website erforderlich (Rechtsgrundlage: Art. 6 Abs. 1
            lit. f DSGVO).
          </li>
          <li>
            <strong>Analyse-Cookies:</strong> Diese werden nur mit Ihrer
            Einwilligung gesetzt (Rechtsgrundlage: Art. 6 Abs. 1 lit. a
            DSGVO).
          </li>
        </ul>
        <p className="mt-4 text-[var(--color-ink)]">
          Sie können Ihre Cookie-Einstellungen jederzeit über unseren
          Cookie-Banner anpassen.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          9. Datensicherheit
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Wir verwenden SSL/TLS-Verschlüsselung für die Datenübertragung und
          setzen technische und organisatorische Sicherheitsmaßnahmen ein, um
          Ihre Daten gegen Manipulation, Verlust und unberechtigten Zugriff
          zu schützen. Unsere Server befinden sich in deutschen
          Rechenzentren.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-[var(--color-ink)]">
          10. Änderungen dieser Datenschutzerklärung
        </h2>
        <p className="mt-4 text-[var(--color-ink)]">
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie
          an geänderte Rechtslagen oder bei Änderungen unserer Dienste
          anzupassen. Die aktuelle Version finden Sie stets auf dieser Seite.
        </p>
      </section>

      <p className="mt-12 text-sm text-[var(--color-muted)]">
        Stand: {new Date().toLocaleDateString("de-DE")}
      </p>
    </div>
  );
}

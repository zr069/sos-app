import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata() {
  return {
    title: 'Allgemeine Geschäftsbedingungen & Teilnahmebedingungen - FlappyStar',
    robots: { index: true, follow: true },
  };
}

export default async function AGBPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-white mb-2">
        Allgemeine Geschäftsbedingungen & Teilnahmebedingungen
      </h1>
      <p className="text-text-muted mb-8">Stand: März 2026</p>

      <div className="space-y-8">
        {/* Section 1 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 1 Veranstalter
          </h2>
          <p className="text-text-muted">
            Veranstalter des FlappyStar-Turniers ist DR. SARAFI Rechtsanwaltsgesellschaft mbH,
            Frankfurter Str. 84, 65779 Kelkheim (Taunus).
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 2 Was ist FlappyStar?
          </h2>
          <p className="text-text-muted">
            FlappyStar ist ein Geschicklichkeitswettbewerb. Teilnehmer erwerben gegen einen Einsatz
            das Recht, einmalig am Turnier teilzunehmen und ihren Highscore in der Rangliste zu
            platzieren. Der Ausgang hängt ausschließlich von der Geschicklichkeit des Spielers ab
            – nicht vom Zufall.
          </p>
        </section>

        {/* Section 3 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 3 Teilnahme & Einsatz
          </h2>
          <ul className="text-text-muted space-y-3 list-disc list-inside">
            <li>
              Die Teilnahme kostet je nach gewähltem Paket zwischen €0,50 und €25,00.
            </li>
            <li>
              Mit der Zahlung erwirbt der Teilnehmer das einmalige Recht zur Teilnahme am Turnier.
            </li>
            <li>
              Mit dem Kauf der Teilnahme wird kein Anspruch auf Rückerstattung des Einsatzes
              erworben – unabhängig vom erzielten Ergebnis, technischen Problemen auf Seiten des
              Teilnehmers oder sonstigen Umständen, die nicht vom Veranstalter zu vertreten sind.
            </li>
            <li>
              Pro Person und Zahlungsvorgang ist eine Spielrunde möglich. Mehrfachteilnahmen sind
              durch separate Käufe möglich.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 4 Score-Multiplikator
          </h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="py-3 px-4 text-white font-display">Einsatz</th>
                  <th className="py-3 px-4 text-white font-display">Multiplikator</th>
                </tr>
              </thead>
              <tbody className="text-text-muted">
                <tr className="border-b border-surface-border/50">
                  <td className="py-3 px-4">€0,50 (Promo)</td>
                  <td className="py-3 px-4">1x</td>
                </tr>
                <tr className="border-b border-surface-border/50">
                  <td className="py-3 px-4">€1,00</td>
                  <td className="py-3 px-4">1x</td>
                </tr>
                <tr className="border-b border-surface-border/50">
                  <td className="py-3 px-4">€5,00</td>
                  <td className="py-3 px-4 text-primary font-bold">2x</td>
                </tr>
                <tr className="border-b border-surface-border/50">
                  <td className="py-3 px-4">€10,00</td>
                  <td className="py-3 px-4 text-primary font-bold">3x</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">€25,00</td>
                  <td className="py-3 px-4 text-primary font-bold">5x</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-text-muted">
            Der gewertete Score ergibt sich aus: <span className="text-white">Spielscore × Multiplikator</span>.
            Dieser gewertete Score ist maßgeblich für die Rangliste und die Ermittlung der Finalisten.
          </p>
        </section>

        {/* Section 5 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 5 Rangliste & Finale
          </h2>
          <ul className="text-text-muted space-y-3 list-disc list-inside">
            <li>
              Alle Teilnehmer werden nach ihrem gewerteten Score in einer öffentlichen Rangliste geführt.
            </li>
            <li>
              Am Ende des Turniierzeitraums (<span className="text-white">17. Juni 2026, 23:59 Uhr</span>)
              werden die Plätze 1 bis 3 der Rangliste für das Live-Finale qualifiziert.
            </li>
            <li>
              Das Finale wird als <span className="text-white">Live-Event auf Twitch</span> ausgetragen.
            </li>
            <li>
              Im Finale spielen die drei Qualifizierten gegeneinander in Echtzeit. Wer am längsten
              durchhält – also den höchsten Score im Finale erzielt – gewinnt den Gesamtpreis von
              <span className="text-primary font-bold"> €10.000</span>.
            </li>
            <li>
              Datum und Uhrzeit des Finales werden mindestens 7 Tage vorher auf flappystar.com und
              dem FlappyStar-Twitch-Kanal bekannt gegeben.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 6 Dateneingabe & Gewinnberechtigung
          </h2>
          <ul className="text-text-muted space-y-3 list-disc list-inside">
            <li>
              Nach dem Spiel werden Teilnehmer aufgefordert, ihre vollständigen und korrekten
              Kontaktdaten (Name, E-Mail-Adresse) einzugeben.
            </li>
            <li>
              Wer falsche oder unvollständige Daten eingibt, verliert jeden Anspruch auf den
              Gewinn – auch wenn er in der Rangliste geführt wird.
            </li>
            <li>
              Der Veranstalter ist berechtigt, die Identität der Finalisten vor Auszahlung des
              Preisgeldes zu überprüfen (z.B. durch Vorlage eines Lichtbildausweises).
            </li>
            <li>
              Kann ein Finalist seine Identität nicht nachweisen oder stimmen seine Daten nicht
              mit den angegebenen überein, verfällt sein Anspruch auf das Preisgeld. Der
              nächstplatzierte Teilnehmer rückt nach.
            </li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 7 Auszahlung des Preisgeldes
          </h2>
          <ul className="text-text-muted space-y-3 list-disc list-inside">
            <li>
              Das Preisgeld von <span className="text-primary font-bold">€10.000</span> wird
              ausschließlich an den Gewinner des Live-Finales ausgezahlt.
            </li>
            <li>
              Die Auszahlung erfolgt binnen 14 Tagen nach dem Finale per Banküberweisung auf
              das vom Gewinner angegebene Konto.
            </li>
            <li>
              Steuern und Abgaben, die auf den Gewinn anfallen, trägt der Gewinner selbst.
            </li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 8 Technische Fairness & Anti-Cheat
          </h2>
          <ul className="text-text-muted space-y-3 list-disc list-inside">
            <li>
              Das Spielergebnis wird serverseitig validiert. Manipulierte Scores werden
              automatisch erkannt und disqualifiziert.
            </li>
            <li>
              Bei begründetem Verdacht auf Manipulation behält sich der Veranstalter das Recht
              vor, einen Teilnehmer ohne Anspruch auf Rückerstattung zu disqualifizieren.
            </li>
            <li>
              Der Veranstalter entscheidet im Streitfall abschließend über die Wertung eines Scores.
            </li>
          </ul>
        </section>

        {/* Section 9 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 9 Haftung
          </h2>
          <ul className="text-text-muted space-y-3 list-disc list-inside">
            <li>
              Der Veranstalter haftet nicht für technische Ausfälle auf Seiten des Teilnehmers
              (Internetverbindung, Gerät, Browser).
            </li>
            <li>
              Der Veranstalter haftet nicht für Ausfälle von Drittanbietern (Stripe, Supabase,
              Vercel), soweit diese nicht von ihm zu vertreten sind.
            </li>
            <li>
              Im Übrigen gilt die gesetzliche Haftung.
            </li>
          </ul>
        </section>

        {/* Section 10 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 10 Änderungen & Absage
          </h2>
          <ul className="text-text-muted space-y-3 list-disc list-inside">
            <li>
              Der Veranstalter behält sich vor, das Turnier bei technischer Unmöglichkeit oder
              höherer Gewalt abzusagen. In diesem Fall werden alle Einsätze erstattet.
            </li>
            <li>
              Änderungen am Turniermodus werden mindestens 48 Stunden vorher auf flappystar.com
              bekannt gegeben.
            </li>
          </ul>
        </section>

        {/* Section 11 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 11 Anwendbares Recht
          </h2>
          <p className="text-text-muted">
            Es gilt ausschließlich deutsches Recht. Gerichtsstand ist Kelkheim (Taunus).
          </p>
        </section>

        {/* Section 12 */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">
            § 12 Kontakt
          </h2>
          <p className="text-text-muted">
            Bei Fragen: <a href="mailto:info@flappystar.com" className="text-primary hover:underline">info@flappystar.com</a>
          </p>
        </section>

      </div>
    </div>
  );
}

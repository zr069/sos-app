import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'footer' });

  return {
    title: t('agb'),
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

  const t = await getTranslations('legal');
  const tFooter = await getTranslations('footer');

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-white mb-8">
        {tFooter('agb')}
      </h1>

      <div className="glass-card rounded-2xl p-8">
        <div className="prose prose-invert max-w-none">
          <p className="text-text-muted">{t('placeholder')}</p>

          <div className="mt-8 space-y-6 text-text-muted">
            <section>
              <h2 className="text-xl font-display font-bold text-white">
                1. Geltungsbereich
              </h2>
              <p>
                Diese Allgemeinen Geschäftsbedingungen gelten für die Teilnahme
                am FlappyStar Tournament und die Nutzung der Website
                flappystar.com.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                2. Teilnahmebedingungen
              </h2>
              <p>
                Die Teilnahme am Turnier ist für Personen ab 18 Jahren gestattet.
                Pro Zahlung von €0,50 erhält der Teilnehmer einen Spielversuch.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                3. Gewinnermittlung
              </h2>
              <p>
                Der Gewinner wird anhand des höchsten verifizierten Punktestands
                am Ende des Turnierseitraums ermittelt. Bei Punktgleichheit
                entscheidet das frühere Einreichungsdatum.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                4. Preisauszahlung
              </h2>
              <p>
                Der Gewinn in Höhe von €10.000 wird innerhalb von 14 Werktagen
                nach Turnierende und Verifizierung des Gewinners ausgezahlt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                5. Ausschluss
              </h2>
              <p>
                FlappyStar behält sich das Recht vor, Teilnehmer bei Verdacht
                auf Manipulation oder Betrug auszuschließen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                6. Haftung
              </h2>
              <p>
                FlappyStar haftet nicht für technische Störungen oder
                Datenverlusten, die außerhalb unserer Kontrolle liegen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                7. Anwendbares Recht
              </h2>
              <p>
                Es gilt das Recht der Bundesrepublik Deutschland.
                Gerichtsstand ist der Sitz des Unternehmens.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

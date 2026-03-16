import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'footer' });

  return {
    title: t('datenschutz'),
    robots: { index: true, follow: true },
  };
}

export default async function DatenschutzPage({
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
        {tFooter('datenschutz')}
      </h1>

      <div className="glass-card rounded-2xl p-8">
        <div className="prose prose-invert max-w-none">
          <p className="text-text-muted">{t('placeholder')}</p>

          <div className="mt-8 space-y-6 text-text-muted">
            <section>
              <h2 className="text-xl font-display font-bold text-white">
                1. Datenschutz auf einen Blick
              </h2>
              <h3 className="text-lg font-medium text-white mt-4">
                Allgemeine Hinweise
              </h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber,
                was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
                Website besuchen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                2. Hosting
              </h2>
              <p>
                Diese Website wird bei Vercel Inc. gehostet. Weitere
                Informationen finden Sie in der Datenschutzerklärung von Vercel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                3. Zahlungsabwicklung
              </h2>
              <p>
                Für die Zahlungsabwicklung nutzen wir den Dienst Stripe. Die
                Datenschutzerklärung von Stripe finden Sie unter:
                https://stripe.com/privacy
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                4. Datenbank
              </h2>
              <p>
                Wir nutzen Supabase zur Speicherung von Turnierdaten. Ihre Daten
                werden sicher in der EU gespeichert.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white">
                5. Ihre Rechte
              </h2>
              <p>
                Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder
                Löschung Ihrer personenbezogenen Daten. Kontaktieren Sie uns
                unter: contact@flappystar.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

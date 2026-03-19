import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'footer' });

  return {
    title: t('impressum'),
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tFooter = await getTranslations('footer');

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-white mb-8">
        {tFooter('impressum')}
      </h1>

      <div className="glass-card rounded-2xl p-8">
        <div className="prose prose-invert max-w-none">
          <div className="space-y-6 text-text-muted">
            <h2 className="text-xl font-display font-bold text-white">
              Angaben gemäß § 5 DDG
            </h2>
            <p className="text-sm text-text-muted/70">
              (Digitale-Dienste-Gesetz)
            </p>

            <div className="mt-6">
              <p className="text-white font-bold text-lg">Devory IT GmbH</p>
              <p>
                Frankfurter Straße 84
                <br />
                65779 Kelkheim (Taunus)
                <br />
                Deutschland
              </p>
            </div>

            <h2 className="text-xl font-display font-bold text-white mt-8">
              Handelsregister
            </h2>
            <p>
              Amtsgericht Königstein (Taunus)
              <br />
              Registernummer: HRB 11764
            </p>

            <h2 className="text-xl font-display font-bold text-white mt-8">
              Umsatzsteuer-ID
            </h2>
            <p>DE368032735</p>

            <h2 className="text-xl font-display font-bold text-white mt-8">
              Geschäftsführer
            </h2>
            <p>Dr. Nik Sarafi</p>

            <h2 className="text-xl font-display font-bold text-white mt-8">
              Kontakt
            </h2>
            <p>
              E-Mail:{' '}
              <a
                href="mailto:info@flappystar.com"
                className="text-primary hover:underline"
              >
                info@flappystar.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

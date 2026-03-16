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
    robots: { index: true, follow: true },
  };
}

export default async function ImpressumPage({
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
        {tFooter('impressum')}
      </h1>

      <div className="glass-card rounded-2xl p-8">
        <div className="prose prose-invert max-w-none">
          <p className="text-text-muted">{t('placeholder')}</p>

          <div className="mt-8 space-y-4 text-text-muted">
            <h2 className="text-xl font-display font-bold text-white">
              Angaben gemäß § 5 TMG
            </h2>
            <p>
              FlappyStar GmbH
              <br />
              Musterstraße 123
              <br />
              12345 Musterstadt
              <br />
              Deutschland
            </p>

            <h2 className="text-xl font-display font-bold text-white mt-6">
              Kontakt
            </h2>
            <p>
              E-Mail: contact@flappystar.com
            </p>

            <h2 className="text-xl font-display font-bold text-white mt-6">
              Verantwortlich für den Inhalt
            </h2>
            <p>
              Max Mustermann
              <br />
              Musterstraße 123
              <br />
              12345 Musterstadt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

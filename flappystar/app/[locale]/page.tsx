import { getTranslations, setRequestLocale } from 'next-intl/server';
import CountdownTimer from '@/components/ui/CountdownTimer';
import LiveWidget from '@/components/leaderboard/LiveWidget';
import Accordion from '@/components/ui/Accordion';
import StakeSelector from '@/components/landing/StakeSelector';
import DemoPreview from '@/components/landing/DemoPreview';
import ShareModalWrapper from '@/components/ui/ShareModalWrapper';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('landing');
  const tFaq = await getTranslations('landing.faq');

  const tournamentEndDate = process.env.TOURNAMENT_END_DATE || '2026-09-17T23:59:59Z';

  // FAQ items
  const faqItems = [
    { question: tFaq('q1.question'), answer: tFaq('q1.answer') },
    { question: tFaq('q2.question'), answer: tFaq('q2.answer') },
    { question: tFaq('q3.question'), answer: tFaq('q3.answer') },
    { question: tFaq('q4.question'), answer: tFaq('q4.answer') },
    { question: tFaq('q5.question'), answer: tFaq('q5.answer') },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-8 sm:pt-28 sm:pb-16">
      {/* Share Modal (shown when URL has share params) */}
      <ShareModalWrapper />

      {/* Hero Section */}
      <section id="tournament" className="text-center mb-16 sm:mb-24">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-white mb-4">
          {t('hero.title')}
          <br />
          <span className="gold-shimmer text-5xl sm:text-7xl lg:text-8xl">
            {t('hero.prize')}
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-8">
          {t('hero.subtitle')}
        </p>

        {/* Countdown */}
        <div className="mb-10">
          <CountdownTimer targetDate={tournamentEndDate} />
        </div>

        {/* Stake Selector */}
        <StakeSelector locale={locale} />
      </section>

      {/* Live Game Demo */}
      <section className="mb-16 sm:mb-24">
        <DemoPreview />
      </section>

      {/* How It Works */}
      <section className="mb-16 sm:mb-24">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white text-center mb-10">
          {t('howItWorks.title')}
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {['step1', 'step2', 'step3'].map((step, index) => (
            <div
              key={step}
              className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group"
            >
              <div className="absolute -top-4 -right-4 text-8xl font-display font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                {index + 1}
              </div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  {index === 0 && (
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  {t(`howItWorks.${step}.title`)}
                </h3>
                <p className="text-text-muted text-sm">
                  {t(`howItWorks.${step}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Leaderboard */}
      <section className="max-w-2xl mx-auto mb-16 sm:mb-24">
        <LiveWidget />
      </section>

      {/* FAQ */}
      <section className="mb-16 sm:mb-24">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white text-center mb-10">
          {tFaq('title')}
        </h2>

        <div className="max-w-3xl mx-auto">
          <Accordion items={faqItems} />
        </div>
      </section>
    </div>
  );
}

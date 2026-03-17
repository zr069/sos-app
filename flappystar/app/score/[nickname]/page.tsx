import { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ nickname: string }>;
  searchParams: Promise<{ score?: string; rank?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { nickname } = await params;
  const { score, rank } = await searchParams;

  const decodedNickname = decodeURIComponent(nickname);
  const scoreNum = parseInt(score || '0', 10);
  const rankNum = parseInt(rank || '0', 10);

  const title = `${decodedNickname} - Platz #${rankNum} mit ${scoreNum} Punkten | FlappyStar`;
  const description = `${decodedNickname} hat ${scoreNum} Punkte erreicht und ist auf Platz #${rankNum}! Kannst du es besser? Spiele jetzt FlappyStar!`;

  return {
    title,
    description,
    openGraph: {
      title: `${decodedNickname} erreichte Platz #${rankNum} bei FlappyStar!`,
      description: `${scoreNum} Punkte! Kannst du besser sein? Spiele jetzt für €0.50 und gewinne €10.000!`,
      type: 'website',
      siteName: 'FlappyStar',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${decodedNickname} - Platz #${rankNum} bei FlappyStar`,
      description: `${scoreNum} Punkte! Kannst du es besser?`,
    },
  };
}

export default async function SharePage({ params, searchParams }: PageProps) {
  const { nickname } = await params;
  const { score, rank } = await searchParams;

  const decodedNickname = decodeURIComponent(nickname);
  const scoreNum = parseInt(score || '0', 10);
  const rankNum = parseInt(rank || '0', 10);

  return (
    <>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          {/* Gold Star */}
          <div className="mb-8">
            <svg
              width="140"
              height="140"
              viewBox="0 0 120 120"
              className="mx-auto drop-shadow-[0_0_40px_rgba(255,215,0,0.6)]"
            >
              <defs>
                <radialGradient id="shareStarGrad" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFF8DC" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </radialGradient>
              </defs>
              {/* Glow */}
              <polygon
                points="60,5 72,42 110,42 80,65 90,102 60,80 30,102 40,65 10,42 48,42"
                fill="#FFD700"
                opacity="0.3"
                transform="scale(1.15) translate(-9, -9)"
              />
              {/* Main star */}
              <polygon
                points="60,5 72,42 110,42 80,65 90,102 60,80 30,102 40,65 10,42 48,42"
                fill="url(#shareStarGrad)"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* FlappyStar heading */}
          <p className="text-primary font-display font-bold text-lg mb-2">FlappyStar</p>

          {/* Achievement message */}
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-6">
            {decodedNickname} hat {scoreNum} Punkte erreicht!
          </h1>

          {/* Rank display */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-primary/20">
            <p className="text-text-muted text-sm mb-2">Platzierung</p>
            <p className="text-5xl sm:text-6xl font-display font-bold gold-shimmer">
              #{rankNum}
            </p>
            <p className="text-text-muted text-sm mt-2">in der Rangliste</p>
          </div>

          {/* Tournament Info */}
          <div className="mb-8 p-4 rounded-xl bg-white/[0.02] border border-surface-border">
            <p className="text-text-muted text-sm">
              FlappyStar Tournament
            </p>
            <p className="text-xl font-display font-bold gold-shimmer mt-1">
              €10.000 Preisgeld
            </p>
          </div>

          {/* CTA Button */}
          <a
            href="https://www.flappystar.com"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-background font-display font-bold text-lg rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105"
          >
            Jetzt mitspielen
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>

          {/* Secondary text */}
          <p className="text-text-muted text-sm mt-6">
            Nur €0.50 Eintritt
          </p>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="py-6 text-center">
        <a href="https://www.flappystar.com" className="text-primary hover:underline font-display text-lg">
          FlappyStar.com
        </a>
      </footer>
    </>
  );
}

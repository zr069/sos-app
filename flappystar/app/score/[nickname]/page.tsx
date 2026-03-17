import { Metadata } from 'next';
import Link from 'next/link';
import '@/app/globals.css';

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

  const title = `${decodedNickname} erreichte Platz #${rankNum} mit ${scoreNum} Punkten bei FlappyStar!`;
  const description = `Kannst du besser sein? Spiele jetzt für €0.50 und gewinne €10.000!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'FlappyStar',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
    <html lang="de">
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-white">
        {/* Starfield background */}
        <div className="starfield" />

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

            {/* Nickname */}
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              {decodedNickname}
            </h1>

            {/* Score */}
            <div className="my-6">
              <p className="text-7xl sm:text-8xl font-display font-bold gold-shimmer">
                {scoreNum}
              </p>
              <p className="text-xl text-text-muted mt-1">Punkte</p>
            </div>

            {/* Rank */}
            <div className="mb-8">
              <p className="text-2xl font-display text-white">
                Platz <span className="text-primary font-bold">#{rankNum}</span>
              </p>
            </div>

            {/* Tournament Info */}
            <div className="mb-10 p-4 rounded-xl bg-white/[0.02] border border-surface-border">
              <p className="text-text-muted text-sm">
                FlappyStar Tournament
              </p>
              <p className="text-xl font-display font-bold gold-shimmer mt-1">
                €10.000 Preisgeld
              </p>
            </div>

            {/* CTA Button */}
            <Link
              href="/"
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
            </Link>

            {/* Secondary text */}
            <p className="text-text-muted text-sm mt-6">
              Nur €0.50 Eintritt • Kannst du es besser?
            </p>
          </div>
        </main>

        {/* Minimal footer */}
        <footer className="py-6 text-center">
          <Link href="/" className="text-primary hover:underline font-display text-lg">
            FlappyStar.com
          </Link>
        </footer>
      </body>
    </html>
  );
}

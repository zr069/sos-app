'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShareModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [shareData, setShareData] = useState<{
    sharedBy: string;
    score: number;
    rank: number;
  } | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Remove query params from URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete('sharedBy');
    url.searchParams.delete('score');
    url.searchParams.delete('rank');
    router.replace(url.pathname, { scroll: false });
  }, [router]);

  useEffect(() => {
    const sharedBy = searchParams.get('sharedBy');
    const score = searchParams.get('score');
    const rank = searchParams.get('rank');

    if (sharedBy && score && rank) {
      setShareData({
        sharedBy: decodeURIComponent(sharedBy),
        score: parseInt(score, 10),
        rank: parseInt(rank, 10),
      });
      setIsOpen(true);

      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, handleClose]);

  const handlePlay = () => {
    handleClose();
    // Scroll to tournament section
    const tournamentSection = document.getElementById('tournament');
    if (tournamentSection) {
      tournamentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!shareData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 max-w-lg w-full"
          >
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-primary/30 shadow-2xl shadow-primary/20">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Animated Gold Star */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="mb-6"
                >
                  <svg
                    width="100"
                    height="100"
                    viewBox="0 0 120 120"
                    className="mx-auto drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
                  >
                    <defs>
                      <radialGradient id="shareModalStarGrad" cx="50%" cy="30%" r="70%">
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
                      fill="url(#shareModalStarGrad)"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="2"
                    />
                  </svg>
                </motion.div>

                {/* Achievement text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                    {shareData.sharedBy} hat gerade
                  </p>
                  <p className="text-4xl sm:text-5xl font-display font-bold gold-shimmer mb-2">
                    {shareData.score} Punkte
                  </p>
                  <p className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
                    gemacht!
                  </p>
                </motion.div>

                {/* Rank */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-text-muted text-lg mb-6"
                >
                  und ist <span className="text-primary font-bold">Platz #{shareData.rank}</span> der weltweiten Rangliste
                </motion.p>

                {/* Challenge text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl text-white font-display font-bold mb-6"
                >
                  Kannst du es besser?
                </motion.p>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={handlePlay}
                  className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
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
                </motion.button>

                {/* Prize info */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-text-muted text-sm mt-4"
                >
                  Gewinne <span className="text-primary font-bold">€10.000</span>
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

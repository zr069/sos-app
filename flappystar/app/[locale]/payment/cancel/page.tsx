'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';

export default function PaymentCancelPage() {
  const t = useTranslations('payment.cancel');

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-display font-bold text-white mb-2">
          {t('title')}
        </h1>

        <p className="text-text-muted mb-8">{t('subtitle')}</p>

        <div className="space-y-3">
          <Link href="/" className="btn-primary w-full block">
            {t('tryAgain')}
          </Link>

          <Link
            href="/play?mode=free"
            className="btn-secondary w-full block"
          >
            {t('playFree')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

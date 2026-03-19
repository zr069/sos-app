'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { href: '/impressum', label: t('impressum') },
    { href: '/datenschutz', label: t('datenschutz') },
    { href: '/agb', label: t('agb') },
  ];

  return (
    <footer className="border-t border-surface-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and copyright */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <path
                  d="M16 2l4.5 9.5L32 13l-8 7.5L26 32l-10-5.5L6 32l2-11.5L0 13l11.5-1.5z"
                  fill="#FFD700"
                />
              </svg>
            </div>
            <span className="text-text-muted text-sm">
              {t('copyright', { year: currentYear })}
            </span>
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-4 sm:gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-muted hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Payment logos / trust badges */}
        <div className="mt-6 pt-6 border-t border-surface-border flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <svg className="w-8 h-5" viewBox="0 0 60 25" fill="currentColor">
              <rect width="60" height="25" rx="3" fill="#635BFF"/>
              <text x="8" y="17" fontSize="10" fill="white" fontWeight="bold">stripe</text>
            </svg>
            <span>Secure Payments</span>
          </div>
          <div className="text-text-muted text-xs">
            🔒 SSL Encrypted
          </div>
        </div>
      </div>
    </footer>
  );
}

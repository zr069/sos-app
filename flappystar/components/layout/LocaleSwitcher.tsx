'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // Get flag emoji for locale
  const getFlag = (loc: Locale): string => {
    const flags: Record<Locale, string> = {
      en: '🇬🇧',
      de: '🇩🇪',
      fr: '🇫🇷',
      es: '🇪🇸',
      it: '🇮🇹',
      zh: '🇨🇳',
      ar: '🇸🇦',
      pl: '🇵🇱',
      hr: '🇭🇷',
      sr: '🇷🇸',
      ru: '🇷🇺',
    };
    return flags[loc];
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Minimal trigger - just flag + chevron */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 py-2 text-white/60 hover:text-white transition-colors duration-200"
        aria-label="Change language"
      >
        <span className="text-lg leading-none">{getFlag(locale)}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-44 overflow-hidden rounded-xl z-50"
            style={{
              background: 'rgba(15, 15, 20, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="py-1.5 max-h-72 overflow-y-auto scrollbar-thin">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`w-full px-3.5 py-2.5 flex items-center gap-3 text-left transition-colors duration-150 ${
                    locale === loc
                      ? 'text-[#FFD700] bg-white/5'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg leading-none">{getFlag(loc)}</span>
                  <span className="text-sm font-medium">{localeNames[loc]}</span>
                  {locale === loc && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD700]"
                      style={{
                        boxShadow: '0 0 6px 1px rgba(255, 215, 0, 0.5)',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

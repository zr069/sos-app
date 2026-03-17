'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/play', label: t('play') },
    { href: '/leaderboard', label: t('leaderboard') },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 pt-5"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo - Left side, outside the pill */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 relative">
            <svg
              viewBox="0 0 32 32"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }}
            >
              <defs>
                <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#FFED4A" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>
              <path
                d="M16 2l4.5 9.5L32 13l-8 7.5L26 32l-10-5.5L6 32l2-11.5L0 13l11.5-1.5z"
                fill="url(#starGradient)"
                className="transition-all duration-300"
              />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight group-hover:text-primary transition-colors duration-200">
            FlappyStar
          </span>
        </Link>

        {/* Floating Pill Navigation - Center */}
        <nav
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-5 py-2 text-sm font-medium transition-colors duration-200 group"
            >
              <span
                className={`relative z-10 ${
                  isActive(item.href)
                    ? 'text-[#FFD700]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </span>
              {/* Active indicator - glowing dot */}
              {isActive(item.href) && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FFD700]"
                  style={{
                    boxShadow: '0 0 8px 2px rgba(255, 215, 0, 0.6)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side - Language switcher + Mobile menu */}
        <div className="flex items-center gap-2 shrink-0">
          <LocaleSwitcher />

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide down drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden mt-4 mx-auto max-w-md overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="p-3">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-[#FFD700]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive(item.href) && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#FFD700]"
                        style={{
                          boxShadow: '0 0 8px 2px rgba(255, 215, 0, 0.6)',
                        }}
                      />
                    )}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

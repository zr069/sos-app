'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({
  targetDate,
  className = '',
}: CountdownTimerProps) {
  const t = useTranslations('landing.countdown');
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsEnded(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isEnded) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-xl font-display font-bold text-primary">
          {t('ended')}
        </p>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  const timeUnits = [
    { value: timeLeft.days, label: t('days') },
    { value: timeLeft.hours, label: t('hours') },
    { value: timeLeft.minutes, label: t('minutes') },
    { value: timeLeft.seconds, label: t('seconds') },
  ];

  return (
    <div className={className}>
      <p className="text-text-muted text-sm mb-3 text-center">{t('title')}</p>
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
            <motion.div
              key={`${unit.label}-${unit.value}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="glass-card px-3 sm:px-4 py-2 sm:py-3 rounded-lg min-w-[60px] sm:min-w-[80px] text-center"
            >
              <div className="text-2xl sm:text-3xl font-display font-bold text-white">
                {unit.value.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-text-muted uppercase tracking-wider">
                {unit.label}
              </div>
            </motion.div>
            {index < timeUnits.length - 1 && (
              <span className="text-2xl sm:text-3xl font-bold text-text-muted">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

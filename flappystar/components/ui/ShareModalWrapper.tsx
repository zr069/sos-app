'use client';

import { Suspense } from 'react';
import ShareModal from './ShareModal';

interface ShareModalWrapperProps {
  locale: string;
}

export default function ShareModalWrapper({ locale }: ShareModalWrapperProps) {
  return (
    <Suspense fallback={null}>
      <ShareModal locale={locale} />
    </Suspense>
  );
}

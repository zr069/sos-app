'use client';

import { Suspense } from 'react';
import ShareModal from './ShareModal';

export default function ShareModalWrapper() {
  return (
    <Suspense fallback={null}>
      <ShareModal />
    </Suspense>
  );
}

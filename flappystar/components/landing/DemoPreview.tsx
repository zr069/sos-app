'use client';

import FlappyBird from '@/components/game/FlappyBird';

export default function DemoPreview() {
  return (
    <div className="w-full flex justify-center">
      {/* Phone mockup frame */}
      <div className="relative">
        {/* LIVE PREVIEW badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="px-3 py-1 bg-primary text-background text-xs font-bold rounded-full shadow-lg shadow-primary/30">
            LIVE PREVIEW
          </div>
        </div>

        {/* Phone frame */}
        <div
          className="relative overflow-hidden"
          style={{
            width: '300px',
            height: '550px',
            borderRadius: '40px',
            border: '4px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
          }}
        >
          {/* Inner content area */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              borderRadius: '36px',
            }}
          >
            <FlappyBird mode="demo" />
          </div>
        </div>

        {/* Subtle glow effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: '40px',
            background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}

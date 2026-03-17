'use client';

import { Link } from '@/i18n/routing';

export default function GamePreview() {
  return (
    <Link href="/play?mode=free" className="block group">
      <div className="relative w-full max-w-[280px] mx-auto">
        {/* Phone frame */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-b from-gray-800 to-gray-900 p-2 shadow-2xl">
          {/* Inner bezel */}
          <div className="relative rounded-[2rem] overflow-hidden bg-black">
            {/* Dynamic island / notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />

            {/* Game screen SVG */}
            <svg
              viewBox="0 0 200 360"
              className="w-full h-auto"
              style={{ background: 'linear-gradient(180deg, #0a0a1f 0%, #0a0a0f 50%, #050508 100%)' }}
            >
              <defs>
                {/* Star gradient */}
                <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF8DC" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </radialGradient>

                {/* Glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Shimmer animation */}
                <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,215,0,0)">
                    <animate attributeName="offset" values="-1;2" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="rgba(255,215,0,0.3)">
                    <animate attributeName="offset" values="-0.5;2.5" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="rgba(255,215,0,0)">
                    <animate attributeName="offset" values="0;3" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>

              {/* Background stars */}
              <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                <circle cx="20" cy="50" r="1" fill="white" opacity="0.5" />
                <circle cx="180" cy="80" r="1.5" fill="white" opacity="0.4" />
                <circle cx="50" cy="120" r="1" fill="white" opacity="0.6" />
                <circle cx="160" cy="160" r="1" fill="white" opacity="0.3" />
                <circle cx="30" cy="200" r="1.5" fill="white" opacity="0.5" />
                <circle cx="170" cy="240" r="1" fill="white" opacity="0.4" />
                <circle cx="45" cy="280" r="1" fill="white" opacity="0.6" />
                <circle cx="155" cy="300" r="1.5" fill="white" opacity="0.3" />
                <circle cx="100" cy="100" r="0.8" fill="white" opacity="0.5" />
                <circle cx="80" cy="320" r="1" fill="white" opacity="0.4" />
              </g>

              {/* Score display */}
              <text
                x="100"
                y="50"
                textAnchor="middle"
                fill="#FFD700"
                fontSize="28"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
                filter="url(#glow)"
              >
                7
              </text>

              {/* Level indicator */}
              <text
                x="100"
                y="70"
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontFamily="system-ui, sans-serif"
              >
                Level 1
              </text>

              {/* Pipes group - animated moving left */}
              <g>
                {/* Pipe 1 */}
                <g style={{ animation: 'pipesMove 4s linear infinite' }}>
                  {/* Top pipe body */}
                  <rect x="140" y="0" width="30" height="100" fill="#1e0a3c" />
                  {/* Top pipe gold cap */}
                  <rect x="136" y="90" width="38" height="12" fill="#FFD700" rx="2" />

                  {/* Bottom pipe body */}
                  <rect x="140" y="200" width="30" height="160" fill="#1e0a3c" />
                  {/* Bottom pipe gold cap */}
                  <rect x="136" y="200" width="38" height="12" fill="#FFD700" rx="2" />
                </g>

                {/* Pipe 2 (offset) */}
                <g style={{ animation: 'pipesMove 4s linear infinite', animationDelay: '-2s' }}>
                  {/* Top pipe body */}
                  <rect x="250" y="0" width="30" height="140" fill="#1e0a3c" />
                  {/* Top pipe gold cap */}
                  <rect x="246" y="130" width="38" height="12" fill="#FFD700" rx="2" />

                  {/* Bottom pipe body */}
                  <rect x="250" y="240" width="30" height="120" fill="#1e0a3c" />
                  {/* Bottom pipe gold cap */}
                  <rect x="246" y="240" width="38" height="12" fill="#FFD700" rx="2" />
                </g>
              </g>

              {/* Star bird - animated bobbing */}
              <g filter="url(#glow)" style={{ animation: 'birdBob 1.5s ease-in-out infinite' }}>
                <polygon
                  points="60,160 66,172 80,172 69,181 73,194 60,185 47,194 51,181 40,172 54,172"
                  fill="url(#starGradient)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1"
                />
              </g>

              {/* Shimmer overlay */}
              <rect x="0" y="0" width="200" height="360" fill="url(#shimmer)" opacity="0.3" />

              {/* CSS Animations */}
              <style>{`
                @keyframes birdBob {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-12px); }
                }
                @keyframes pipesMove {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-200px); }
                }
              `}</style>
            </svg>

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/50 transform group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Glow effect behind phone */}
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl -z-10 opacity-50 group-hover:opacity-75 transition-opacity" />

        {/* "Try it" label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-text-muted group-hover:text-primary transition-colors">
          Click to play
        </div>
      </div>
    </Link>
  );
}

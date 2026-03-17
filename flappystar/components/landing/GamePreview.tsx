'use client';

import { Link } from '@/i18n/routing';

export default function GamePreview() {
  return (
    <div className="w-full flex justify-center">
      <Link href="/play?mode=free" className="block group">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 0 40px rgba(255,215,0,0.2)',
          }}
        >
          {/* Game screen SVG */}
          <svg
            width="300"
            height="500"
            viewBox="0 0 300 500"
            className="block"
          >
            {/* Background */}
            <rect width="300" height="500" fill="#0a0a0f" rx="16" />

            {/* Subtle gold border */}
            <rect
              x="1" y="1"
              width="298" height="498"
              fill="none"
              stroke="rgba(255,215,0,0.3)"
              strokeWidth="2"
              rx="15"
            />

            {/* Starfield - static dots */}
            <g fill="white">
              <circle cx="25" cy="60" r="1" opacity="0.5" />
              <circle cx="275" cy="45" r="1.2" opacity="0.4" />
              <circle cx="60" cy="120" r="0.8" opacity="0.6" />
              <circle cx="240" cy="95" r="1" opacity="0.3" />
              <circle cx="45" cy="180" r="1.2" opacity="0.5" />
              <circle cx="260" cy="160" r="0.8" opacity="0.4" />
              <circle cx="30" cy="250" r="1" opacity="0.6" />
              <circle cx="270" cy="230" r="1.2" opacity="0.3" />
              <circle cx="55" cy="320" r="0.8" opacity="0.5" />
              <circle cx="245" cy="290" r="1" opacity="0.4" />
              <circle cx="40" cy="380" r="1.2" opacity="0.6" />
              <circle cx="255" cy="350" r="0.8" opacity="0.3" />
              <circle cx="150" cy="140" r="1" opacity="0.5" />
              <circle cx="180" cy="400" r="1.2" opacity="0.4" />
              <circle cx="120" cy="450" r="0.8" opacity="0.6" />
              <circle cx="200" cy="80" r="1" opacity="0.4" />
              <circle cx="90" cy="280" r="1" opacity="0.5" />
            </g>

            {/* Score display */}
            <text
              x="150"
              y="55"
              textAnchor="middle"
              fill="#FFD700"
              fontSize="36"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              8
            </text>

            {/* Level indicator */}
            <text
              x="150"
              y="80"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontFamily="system-ui, sans-serif"
            >
              Level 1
            </text>

            {/* Animated pipes group */}
            <g style={{ animation: 'pipesMove 3s linear infinite' }}>
              {/* Pipe pair 1 */}
              {/* Top pipe body */}
              <rect x="180" y="0" width="40" height="130" fill="#1e0a3c" />
              {/* Top pipe gold cap */}
              <rect x="174" y="118" width="52" height="12" fill="#FFD700" rx="2" />

              {/* Bottom pipe body */}
              <rect x="180" y="260" width="40" height="240" fill="#1e0a3c" />
              {/* Bottom pipe gold cap */}
              <rect x="174" y="260" width="52" height="12" fill="#FFD700" rx="2" />

              {/* Pipe pair 2 (offset) */}
              {/* Top pipe body */}
              <rect x="340" y="0" width="40" height="180" fill="#1e0a3c" />
              {/* Top pipe gold cap */}
              <rect x="334" y="168" width="52" height="12" fill="#FFD700" rx="2" />

              {/* Bottom pipe body */}
              <rect x="340" y="310" width="40" height="190" fill="#1e0a3c" />
              {/* Bottom pipe gold cap */}
              <rect x="334" y="310" width="52" height="12" fill="#FFD700" rx="2" />
            </g>

            {/* Star bird - proper 5-pointed star with bobbing animation */}
            <g style={{ animation: 'birdFloat 1.2s ease-in-out infinite' }}>
              <g transform="translate(80, 220)">
                {/* Glow effect */}
                <polygon
                  points="0,-18 5,-6 18,-6 8,3 12,16 0,9 -12,16 -8,3 -18,-6 -5,-6"
                  fill="#FFD700"
                  opacity="0.3"
                  transform="scale(1.3)"
                />
                {/* Main star */}
                <polygon
                  points="0,-18 5,-6 18,-6 8,3 12,16 0,9 -12,16 -8,3 -18,-6 -5,-6"
                  fill="url(#starGrad)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1"
                />
              </g>
            </g>

            {/* Star gradient definition */}
            <defs>
              <radialGradient id="starGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFF8DC" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </radialGradient>
            </defs>

            {/* CSS animations */}
            <style>{`
              @keyframes pipesMove {
                0% { transform: translateX(0); }
                100% { transform: translateX(-320px); }
              }
              @keyframes birdFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
            `}</style>
          </svg>

          {/* Play button overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/50 transform group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* "Click to play" label */}
        <p className="text-center text-sm text-text-muted mt-4 group-hover:text-primary transition-colors">
          Click to play free
        </p>
      </Link>
    </div>
  );
}

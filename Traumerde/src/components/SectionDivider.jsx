export function WaveDivider({ flip = false, color = '#faf6f1', className = '' }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className}`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="w-full h-[60px] sm:h-[80px] lg:h-[120px]"
      >
        <path
          d="M0,40 C360,120 720,0 1080,80 C1260,120 1380,60 1440,40 L1440,120 L0,120 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

export function DiagonalDivider({ flip = false, color = '#faf6f1', className = '' }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`}>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-[40px] sm:h-[60px] lg:h-[80px]"
      >
        <polygon
          points={flip ? '0,80 1440,0 1440,80' : '0,0 1440,80 0,80'}
          fill={color}
        />
      </svg>
    </div>
  )
}

export function OrganicDivider({ color = '#faf6f1', className = '' }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`}>
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="w-full h-[50px] sm:h-[70px] lg:h-[100px]"
      >
        <path
          d="M0,60 C180,100 360,20 540,50 C720,80 900,10 1080,40 C1200,60 1340,30 1440,50 L1440,100 L0,100 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

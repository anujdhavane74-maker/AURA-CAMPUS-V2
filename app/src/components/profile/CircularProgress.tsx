import React from 'react';

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 56,
  strokeWidth = 5,
  className = '',
  showText = true,
}) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  // Determine dynamic color based on score thresholds
  let strokeColor = '#0d9488'; // teal-600
  let textColor = 'text-teal-700';

  if (safeScore === 100) {
    strokeColor = '#059669'; // emerald-600
    textColor = 'text-emerald-700';
  } else if (safeScore < 40) {
    strokeColor = '#d97706'; // amber-600
    textColor = 'text-amber-700';
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      role="progressbar"
      aria-valuenow={safeScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Profile completeness: ${safeScore}%`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        style={{ width: size, height: size }}
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Percentage Center Text */}
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-xs font-black tracking-tight ${textColor}`}>
            {safeScore}%
          </span>
        </div>
      )}
    </div>
  );
};

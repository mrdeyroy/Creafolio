import React from "react";

interface VaultSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VaultSpinner({
  label = "Loading vault...",
  size = "md",
  className = "",
}: VaultSpinnerProps) {
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  const containerSize = isSmall ? "w-8 h-8" : isLarge ? "w-14 h-14" : "w-11 h-11";
  const svgSize = isSmall ? 32 : isLarge ? 56 : 44;
  const radius = isSmall ? 13 : isLarge ? 24 : 19;
  const center = svgSize / 2;
  const strokeWidth = isSmall ? 2 : 2.5;
  const glyphSize = isSmall
    ? "w-6 h-6 rounded-md"
    : isLarge
    ? "w-9 h-9 rounded-xl"
    : "w-7 h-7 rounded-lg";
  const iconSize = isSmall ? 12 : isLarge ? 18 : 14;

  return (
    <div
      role="status"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-3 select-none animate-in fade-in duration-200 ${className}`}
    >
      <div className={`relative flex items-center justify-center ${containerSize}`}>
        {/* Kinetic Spinning Track */}
        <svg
          className="absolute inset-0 animate-spin text-emerald-400"
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          fill="none"
        >
          {/* Subtle background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* High-contrast emerald arc */}
          <path
            d={`M${center} ${center - radius} A${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>

        {/* Themed Vault Glyph Mark */}
        <div
          className={`flex items-center justify-center border border-white/10 bg-zinc-950/90 shadow-lg shadow-emerald-500/10 backdrop-blur-md transition-all ${glyphSize}`}
        >
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-200"
          >
            <rect width="18" height="18" x="3" y="3" rx="4" />
            <path d="M9 3v18" />
            <path d="M14 9h5" className="logo-line-1" />
            <path d="M14 15h5" className="logo-line-2" />
          </svg>
        </div>
      </div>

      {label && (
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          <span>{label}</span>
          <span className="inline-block h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
        </div>
      )}
    </div>
  );
}

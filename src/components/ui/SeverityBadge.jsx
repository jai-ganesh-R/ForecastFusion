import React from 'react';
import clsx from 'clsx';

export const SeverityBadge = ({ severity, className = "" }) => {
  const styles = {
    LOW: "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(0,230,118,0.2)]",
    MODERATE: "bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(255,176,32,0.2)]",
    HIGH: "bg-orange-950/70 border-orange-500/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.25)]",
    EXTREME: "bg-rose-950/80 border-rose-500/70 text-rose-300 shadow-[0_0_12px_rgba(255,59,92,0.3)] animate-pulse"
  };

  const currentStyle = styles[severity?.toUpperCase()] || styles.LOW;

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider border uppercase",
        currentStyle,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {severity}
    </span>
  );
};

import React from 'react';
import clsx from 'clsx';

export const SeverityBadge = ({ severity, className = "" }) => {
  const styles = {
    LOW: "bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 shadow-sm",
    MODERATE: "bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 shadow-sm",
    HIGH: "bg-orange-100 dark:bg-orange-950/70 border-orange-300 dark:border-orange-500/50 text-orange-800 dark:text-orange-300 shadow-sm",
    EXTREME: "bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500/70 text-rose-800 dark:text-rose-300 shadow-sm animate-pulse"
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

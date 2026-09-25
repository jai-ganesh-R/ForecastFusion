import React from 'react';
import clsx from 'clsx';

export const GlassCard = ({ 
  children, 
  className = "", 
  variant = "default", // default | glow | warning | danger
  title = "",
  badge = null,
  headerAction = null 
}) => {
  const variantStyles = {
    default: "border-slate-800/80 bg-[#0d1424]/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
    glow: "border-cyan-500/40 bg-[#0d1424]/90 shadow-[0_0_25px_rgba(0,229,255,0.12)]",
    warning: "border-amber-500/40 bg-[#1e150a]/80 shadow-[0_0_20px_rgba(255,176,32,0.15)]",
    danger: "border-rose-500/40 bg-[#240c14]/80 shadow-[0_0_20px_rgba(255,59,92,0.18)]"
  };

  return (
    <div className={clsx("rounded-xl border backdrop-blur-md p-4 transition-all duration-300", variantStyles[variant], className)}>
      {(title || badge || headerAction) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            {title && (
              <h3 className="font-orbitron font-semibold text-sm tracking-wide text-slate-100 flex items-center gap-2">
                {title}
              </h3>
            )}
            {badge && <div>{badge}</div>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

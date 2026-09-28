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
    default: "glass-panel text-slate-900 dark:text-slate-100",
    glow: "glass-panel-glow text-slate-900 dark:text-slate-100",
    warning: "glass-panel-warning text-amber-950 dark:text-amber-100",
    danger: "glass-panel-danger text-rose-950 dark:text-rose-100"
  };

  return (
    <div className={clsx("rounded-2xl p-5 transition-all duration-300 relative", variantStyles[variant], className)}>
      {(title || badge || headerAction) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center space-x-2.5">
            {title && (
              <h3 className="font-orbitron font-semibold text-xs tracking-wider uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
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

import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSwitcher = () => {
  const { lang, setLang, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
      >
        <Languages className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">{current.nativeLabel}</span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#0d1424] border border-slate-700 rounded-xl shadow-2xl z-[9999] overflow-hidden">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition hover:bg-slate-800 ${
                l.code === lang ? 'text-cyan-400 bg-cyan-950/40 font-bold' : 'text-slate-300'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <div className="text-left">
                <div className="font-medium">{l.nativeLabel}</div>
                <div className="text-[10px] text-slate-500">{l.label}</div>
              </div>
              {l.code === lang && <span className="ml-auto text-[10px] text-cyan-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

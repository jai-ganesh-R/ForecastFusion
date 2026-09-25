import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLanguage } from '../context/LanguageContext';

const STEPS = [
  {
    num: '1',
    emoji: '🌐',
    titleEn: 'We collect data from 4 weather models',
    titleHi: 'हम 4 मौसम मॉडलों से डेटा इकट्ठा करते हैं',
    titleTa: '4 வானிலை மாதிரிகளிலிருந்து தரவு சேகரிக்கிறோம்',
    titleTe: '4 వాతావరణ మోడల్‌ల నుండి డేటా సేకరిస్తాం',
    titleKn: '4 ಹವಾಮಾನ ಮಾಡೆಲ್‌ಗಳಿಂದ ಡೇಟಾ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ',
    titleBn: '4টি আবহাওয়া মডেল থেকে তথ্য সংগ্রহ করি',
    titleMr: '4 हवामान मॉडेलमधून डेटा गोळा करतो',
    descEn: 'Every 30 seconds, we pull fresh weather data from ECMWF (Europe), GFS (USA), NCUM-IMD (India), and Open-Meteo. Each model makes its own prediction for your area.',
    color: 'cyan',
    models: ['🇪🇺 ECMWF (Europe)', '🇺🇸 GFS (USA)', '🇮🇳 NCUM-IMD (India)', '🌐 Open-Meteo'],
  },
  {
    num: '2',
    emoji: '📊',
    titleEn: 'We check which model was most accurate recently',
    titleHi: 'हम देखते हैं कि हाल ही में कौन सा मॉडल सबसे सटीक था',
    titleTa: 'சமீபத்தில் எந்த மாதிரி மிகவும் துல்லியமாக இருந்தது என சரிபார்க்கிறோம்',
    titleTe: 'ఇటీవల ఏ మోడల్ అత్యంత ఖచ్చితమైనదో తనిఖీ చేస్తాం',
    titleKn: 'ಇತ್ತೀಚೆಗೆ ಯಾವ ಮಾಡೆಲ್ ಹೆಚ್ಚು ನಿಖರವಾಗಿತ್ತು ಎಂದು ಪರಿಶೀಲಿಸುತ್ತೇವೆ',
    titleBn: 'সম্প্রতি কোন মডেল সবচেয়ে সঠিক ছিল তা পরীক্ষা করি',
    titleMr: 'अलीकडे कोणते मॉडेल सर्वात अचूक होते ते तपासतो',
    descEn: 'We compare what each model predicted against what actually happened (using real ground weather stations and satellites). A model that was wrong gets a lower trust score. One that was right gets a higher score.',
    color: 'violet',
    analogy: '🏏 Think of it like cricket stats — a batsman with a better recent average gets to bat first.',
  },
  {
    num: '3',
    emoji: '⚖️',
    titleEn: 'We blend all 4 predictions into one',
    titleHi: 'हम सभी 4 पूर्वानुमानों को एक में मिलाते हैं',
    titleTa: '4 முன்னறிவிப்புகளையும் ஒன்றாக இணைக்கிறோம்',
    titleTe: '4 అంచనాలన్నింటినీ ఒకటిగా మిళితం చేస్తాం',
    titleKn: '4 ಮುನ್ಸೂಚನೆಗಳನ್ನು ಒಂದಾಗಿ ಮಿಶ್ರಣ ಮಾಡುತ್ತೇವೆ',
    titleBn: '4টি পূর্বাভাস একসাথে মিলিয়ে দিই',
    titleMr: '4 अंदाज एकत्र मिसळतो',
    descEn: 'The final forecast is a weighted average — accurate models get more influence, inaccurate ones get less. This is far better than trusting just one model.',
    color: 'emerald',
    analogy: '🧑‍⚕️ Like getting a second opinion from multiple doctors and trusting the one with the best track record most.',
  },
  {
    num: '4',
    emoji: '🔍',
    titleEn: 'We explain every decision — no black boxes',
    titleHi: 'हम हर निर्णय समझाते हैं — कोई रहस्य नहीं',
    titleTa: 'ஒவ்வொரு முடிவையும் விளக்குகிறோம் — இரகசியம் இல்லை',
    titleTe: 'ప్రతి నిర్ణయాన్ని వివరిస్తాం — రహస్యాలు లేవు',
    titleKn: 'ಪ್ರತಿ ನಿರ್ಣಯವನ್ನು ವಿವರಿಸುತ್ತೇವೆ — ರಹಸ್ಯ ಇಲ್ಲ',
    titleBn: 'প্রতিটি সিদ্ধান্ত ব্যাখ্যা করি — কোনো রহস্য নেই',
    titleMr: 'प्रत्येक निर्णय स्पष्ट करतो — कोणते रहस्य नाही',
    descEn: 'You can see exactly why ECMWF got 45% trust and GFS got 25% — based on their recent accuracy, their known biases, and how well they perform in your specific terrain.',
    color: 'amber',
    analogy: '📋 Like a school report card — every subject has a score and a reason.',
  },
  {
    num: '5',
    emoji: '⚡',
    titleEn: 'If a model goes wrong — we auto-fix it',
    titleHi: 'अगर कोई मॉडल गलत हो जाए — हम अपने आप ठीक कर देते हैं',
    titleTa: 'ஒரு மாதிரி தவறாக போனால் — தானாகவே சரிசெய்கிறோம்',
    titleTe: 'ఒక మోడల్ తప్పు అయితే — స్వయంచాలకంగా సరిచేస్తాం',
    titleKn: 'ಒಂದು ಮಾಡೆಲ್ ತಪ್ಪಾದರೆ — ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸರಿಪಡಿಸುತ್ತೇವೆ',
    titleBn: 'কোনো মডেল ভুল হলে — স্বয়ংক্রিয়ভাবে ঠিক করি',
    titleMr: 'एखादे मॉडेल चुकले तर — आपोआप दुरुस्त करतो',
    descEn: 'Our system checks every 30 seconds. If GFS has been over-predicting rain for Mumbai for 4 days in a row, we automatically reduce its weight and give more influence to NCUM-IMD.',
    color: 'rose',
    analogy: '🚦 Like a traffic light that sees a jam and automatically re-routes you.',
  },
  {
    num: '6',
    emoji: '📢',
    titleEn: 'We convert it into simple warnings for everyone',
    titleHi: 'हम इसे सभी के लिए सरल चेतावनियों में बदलते हैं',
    titleTa: 'எல்லோருக்கும் எளிய எச்சரிக்கைகளாக மாற்றுகிறோம்',
    titleTe: 'అందరికీ సరళమైన హెచ్చరికలుగా మారుస్తాం',
    titleKn: 'ಎಲ್ಲರಿಗೂ ಸರಳ ಎಚ್ಚರಿಕೆಗಳಾಗಿ ಪರಿವರ್ತಿಸುತ್ತೇವೆ',
    titleBn: 'সবার জন্য সহজ সতর্কতায় রূপান্তরিত করি',
    titleMr: 'सर्वांसाठी सोप्या सूचनांमध्ये रूपांतरित करतो',
    descEn: 'The numbers (mm of rain, °C, km/h) are converted into simple color-coded warnings (Green/Yellow/Orange/Red) with clear actions: "Stay indoors", "Don\'t go fishing", "Drink water every hour". Available in 7 Indian languages.',
    color: 'sky',
    analogy: '🌈 Simple colors everyone understands — no science degree needed.',
  },
];

const HAZARD_TABLE = [
  { hazard: '🌧️ Heavy Rain', mild: '< 15 mm', moderate: '15–64 mm', severe: '65–115 mm', extreme: '> 115 mm' },
  { hazard: '🌡️ Heatwave',  mild: 'Normal', moderate: '+2–3°C above normal', severe: '+4.5°C (Heatwave)', extreme: '+6.4°C (Severe)' },
  { hazard: '💨 Wind',      mild: '< 30 km/h', moderate: '30–50 km/h', severe: '50–65 km/h (Squally)', extreme: '> 65 km/h (Gale)' },
];

export const Methodology = () => {
  const { t, lang } = useLanguage();
  const [openStep, setOpenStep] = useState(null);

  const getTitle = (step) => {
    const key = `title${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
    return step[key] || step.titleEn;
  };

  const COLOR_MAP = {
    cyan:   'border-cyan-500/40 bg-cyan-950/20 text-cyan-400',
    violet: 'border-violet-500/40 bg-violet-950/20 text-violet-400',
    emerald:'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
    amber:  'border-amber-500/40 bg-amber-950/20 text-amber-400',
    rose:   'border-rose-500/40 bg-rose-950/20 text-rose-400',
    sky:    'border-sky-500/40 bg-sky-950/20 text-sky-400',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#0d1424]/90 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-2 mb-1">
          <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
          </span>
          <h2 className="font-orbitron font-bold text-2xl text-white">{t('meth_title')}</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl font-sans leading-relaxed">
          {t('meth_subtitle')}
        </p>
      </div>

      {/* Step-by-step accordion */}
      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const isOpen = openStep === idx;
          const colorClass = COLOR_MAP[step.color];
          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all ${isOpen ? colorClass : 'border-slate-800 bg-slate-900/40'}`}
            >
              <button
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setOpenStep(isOpen ? null : idx)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl font-orbitron font-bold border ${colorClass}`}>
                  {step.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Step {step.num}</span>
                  </div>
                  <div className="text-sm font-semibold text-white leading-snug">{getTitle(step)}</div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-sm text-slate-200 font-sans leading-relaxed">{step.descEn}</p>
                  {step.analogy && (
                    <div className="p-3 bg-black/40 rounded-lg border border-slate-800 text-xs text-slate-300 font-sans italic">
                      {step.analogy}
                    </div>
                  )}
                  {step.models && (
                    <div className="flex flex-wrap gap-2">
                      {step.models.map((m, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">{m}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hazard thresholds table */}
      <GlassCard title="📏 When do we issue warnings? (IMD thresholds)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                <th className="pb-2 pr-4">Hazard Type</th>
                <th className="pb-2 pr-4 text-emerald-400">✅ Normal</th>
                <th className="pb-2 pr-4 text-amber-400">🟡 Moderate</th>
                <th className="pb-2 pr-4 text-orange-400">🟠 Severe</th>
                <th className="pb-2 text-rose-400">🔴 Extreme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {HAZARD_TABLE.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 pr-4 text-slate-300 font-semibold">{row.hazard}</td>
                  <td className="py-2 pr-4 text-emerald-400">{row.mild}</td>
                  <td className="py-2 pr-4 text-amber-400">{row.moderate}</td>
                  <td className="py-2 pr-4 text-orange-400">{row.severe}</td>
                  <td className="py-2 text-rose-400">{row.extreme}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* SIH footer */}
      <div className="p-4 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-blue-950/50 border border-cyan-500/30 rounded-xl text-center text-xs text-slate-400 font-mono">
        Built for <span className="text-cyan-400 font-bold">Smart India Hackathon (SIH26081)</span> — Ministry of Earth Sciences (MoES) &nbsp;|&nbsp; ForecastFusion © 2026
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { FaPiggyBank, FaChartPie, FaBullseye, FaBook, FaLightbulb, FaMoon, FaSun } from 'react-icons/fa';

const quickLinks = [
  { label: 'Investments', icon: <FaPiggyBank />, to: '/investments', color: 'from-primary to-accent-violet' },
  { label: 'Transactions', icon: <FaChartPie />, to: '/transactions', color: 'from-accent-violet to-primary' },
  { label: 'Goals', icon: <FaBullseye />, to: '/goals', color: 'from-accent-emerald to-primary' },
  { label: 'Library', icon: <FaBook />, to: '/library', color: 'from-accent-orange to-accent-violet' },
  { label: 'Insights', icon: <FaLightbulb />, to: '/insights', color: 'from-primary to-accent-emerald' },
];

const STRIP_SCENES = [
  {
    key: 'invest',
    label: 'Smart investing',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><g>
        <rect x="20" y="32" width="8" height="10" rx="4" fill="#818cf8"/>
        <rect x="22" y="10" width="4" height="22" rx="2" fill="#a21caf"/>
        <polygon points="24,4 28,14 20,14" fill="#d946ef"/>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -6; 0 0" dur="1.5s" repeatCount="indefinite"/>
      </g></svg>
    )
  },
  {
    key: 'goals',
    label: 'Seamless goals',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><g>
        <ellipse cx="24" cy="36" rx="12" ry="4" fill="#818cf8" opacity=".2"/>
        <rect x="18" y="18" width="12" height="16" rx="6" fill="#a21caf"/>
        <rect x="22" y="10" width="4" height="8" rx="2" fill="#d946ef"/>
        <rect x="20" y="28" width="8" height="6" rx="3" fill="#818cf8"/>
        <animateTransform attributeName="transform" type="scale" values="1 1; 1.1 1.1; 1 1" dur="1.5s" repeatCount="indefinite"/>
      </g></svg>
    )
  },
  {
    key: 'ai',
    label: 'AI insights',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><g>
        <circle cx="24" cy="24" r="20" fill="#818cf8" opacity=".1"/>
        <circle cx="24" cy="24" r="10" fill="#a21caf"/>
        <polygon points="24,14 28,24 24,20 20,24" fill="#d946ef"/>
        <circle cx="24" cy="24" r="3" fill="#fff"/>
        <animateTransform attributeName="transform" type="rotate" values="0 24 24; 20 24 24; 0 24 24" dur="1.5s" repeatCount="indefinite"/>
      </g></svg>
    )
  }
];

function CinematicStrip() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setScene(s => (s + 1) % STRIP_SCENES.length), 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-background-glass/80 shadow-lg border border-white/10 backdrop-blur-xl min-w-[260px] max-w-[340px] transition-all duration-500">
      {STRIP_SCENES.map((s, i) => (
        <div
          key={s.key}
          className={`flex flex-col items-center transition-all duration-700 ${i === scene ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          style={{ minWidth: 80, minHeight: 60 }}
        >
          <div className="mb-1">{s.icon}</div>
          <span className="text-xs font-semibold text-fuchsia-200 tracking-wide" style={{letterSpacing: '0.04em'}}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

const Home = () => {
  // Visual toggle (not wired to theme context)
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#18181b]">
      {/* Fluid Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-fluid-bg" style={{background: 'linear-gradient(120deg, #18181b 0%, #2e1065 50%, #818cf8 100%)', backgroundSize: '200% 200%'}} />
      {/* Midground floating lines or blur shapes */}
      <div className="pointer-events-none select-none">
        <svg className="absolute top-0 left-0 w-full h-32 opacity-20" viewBox="0 0 1440 100"><polyline points="0,80 400,40 800,90 1200,20 1440,60" fill="none" stroke="#a21caf" strokeWidth="6" strokeDasharray="12 8" /></svg>
        <svg className="absolute bottom-0 right-0 w-full h-32 opacity-10" viewBox="0 0 1440 100"><polyline points="0,60 300,20 700,80 1100,30 1440,90" fill="none" stroke="#818cf8" strokeWidth="6" strokeDasharray="10 10" /></svg>
      </div>
      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center w-full pt-24 pb-12 animate-fadein">
        <h1
          className="text-5xl md:text-7xl font-extrabold mb-6 text-center tracking-tight bg-clip-text text-transparent animate-hero-gradient"
          style={{
            backgroundImage: 'linear-gradient(90deg, #d946ef 20%, #a21caf 50%, #818cf8 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to FinPilot X
        </h1>
        <p className="text-2xl md:text-3xl text-gray-300 mb-8 text-center max-w-3xl animate-slidein">Your all-in-one, AI-powered finance multiverse. Track, plan, and grow your wealth with confidence and style.</p>
        {/* Split CTA Button */}
        <div className="flex gap-4 mt-2 animate-fadein">
          <a href="/login" className="relative px-8 py-4 rounded-[2rem] font-bold text-lg bg-gradient-to-r from-fuchsia-600 to-indigo-500 shadow-xl border-2 border-fuchsia-400/40 focus:outline-none focus:ring-4 focus:ring-fuchsia-400/50 transition-all duration-200 text-white group overflow-hidden hover:scale-105">
            <span className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-fuchsia-400/30 to-indigo-400/30 blur-lg opacity-60 group-hover:opacity-90 animate-pulse-glow" />
            <span className="relative z-10">I'm new</span>
          </a>
          <a href="/login" className="relative px-8 py-4 rounded-[2rem] font-bold text-lg bg-gradient-to-r from-indigo-500 to-fuchsia-600 shadow-xl border-2 border-indigo-400/40 focus:outline-none focus:ring-4 focus:ring-indigo-400/50 transition-all duration-200 text-white group overflow-hidden hover:scale-105">
            <span className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-indigo-400/30 to-fuchsia-400/30 blur-lg opacity-60 group-hover:opacity-90 animate-pulse-glow" />
            <span className="relative z-10">I'm returning</span>
          </a>
        </div>
        {/* Mini Onboarding Cinematic Strip */}
        <div className="w-full flex justify-center mt-8">
          <CinematicStrip />
        </div>
        {/* Signature angled glassmorphic highlight card */}
        <div className="relative mt-16 flex justify-center w-full">
          <div className="skew-y-[-6deg] bg-background-glass/80 border border-fuchsia-500/30 shadow-2xl backdrop-blur-2xl px-10 py-8 max-w-xl w-full flex flex-col items-center"
            style={{
              boxShadow: '0 8px 32px 0 #a21caf44, 0 0 0 2px #d946ef33 inset',
              borderRadius: '2.5rem 1.5rem 2.5rem 1.5rem / 2rem 2.5rem 1.5rem 2.5rem',
              borderWidth: 2,
              zIndex: 2,
              background: 'rgba(36,33,44,0.85)',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(129,140,248,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(36,33,44,0.85)'}
          >
            <span className="text-2xl font-bold text-fuchsia-300 mb-2 tracking-wide">Your AI-powered finance multiverse</span>
            <span className="text-base text-gray-300 text-center">Experience seamless investing, goal tracking, and insights — all in one futuristic dashboard.</span>
          </div>
        </div>
      </section>
      {/* Signature Asymmetrical Visual Grid */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-0 pb-16 animate-fadein2 max-w-6xl mx-auto" style={{marginTop: '4rem'}}>
        {/* Large angled highlight card (left) */}
        <a href="/investments" className="group col-span-1 md:col-span-2 row-span-2 bg-background-glass/80 border-2 border-fuchsia-500/40 shadow-2xl backdrop-blur-2xl px-10 py-12 flex flex-col items-start justify-between skew-y-[-6deg] hover:skew-y-[-3deg] transition-all duration-300 relative overflow-hidden signature-card" style={{
          borderRadius: '2.5rem 1.5rem 2.5rem 1.5rem / 2rem 2.5rem 1.5rem 2.5rem',
          minHeight: 260,
          background: 'rgba(36,33,44,0.85)',
        }}>
          {/* Candlestick chart SVG background */}
          <svg className="absolute left-0 bottom-0 w-full h-24 opacity-20" viewBox="0 0 320 96">
            <rect x="10" y="40" width="8" height="36" rx="3" fill="#818cf8" />
            <rect x="30" y="20" width="8" height="56" rx="3" fill="#d946ef" />
            <rect x="50" y="60" width="8" height="16" rx="3" fill="#a21caf" />
            <rect x="70" y="30" width="8" height="46" rx="3" fill="#818cf8" />
            <rect x="90" y="50" width="8" height="26" rx="3" fill="#d946ef" />
            <rect x="110" y="35" width="8" height="41" rx="3" fill="#a21caf" />
            <rect x="130" y="60" width="8" height="16" rx="3" fill="#818cf8" />
            <rect x="150" y="25" width="8" height="51" rx="3" fill="#d946ef" />
            <rect x="170" y="45" width="8" height="31" rx="3" fill="#a21caf" />
            <rect x="190" y="40" width="8" height="36" rx="3" fill="#818cf8" />
            <rect x="210" y="20" width="8" height="56" rx="3" fill="#d946ef" />
            <rect x="230" y="60" width="8" height="16" rx="3" fill="#a21caf" />
            <rect x="250" y="30" width="8" height="46" rx="3" fill="#818cf8" />
            <rect x="270" y="50" width="8" height="26" rx="3" fill="#d946ef" />
            <rect x="290" y="35" width="8" height="41" rx="3" fill="#a21caf" />
          </svg>
          <svg className="absolute top-4 right-4 w-16 h-16 opacity-20" viewBox="0 0 64 64"><polyline points="0,32 16,16 32,48 48,8 64,32" fill="none" stroke="#d946ef" strokeWidth="4" strokeDasharray="6 6" /></svg>
          <span className="text-2xl font-bold text-fuchsia-200 mb-2 tracking-wide">Invest with AI</span>
          <span className="text-base text-gray-300 mb-4">Get personalized, data-driven investment recommendations in seconds.</span>
          <span className="inline-block mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-500 text-white font-semibold shadow-lg border border-fuchsia-400/40 group-hover:scale-105 transition-all duration-200">Try Investment Recommender</span>
          <span className="absolute left-0 bottom-0 w-full h-2 bg-gradient-to-r from-fuchsia-500/30 to-indigo-500/30 blur-lg opacity-60 group-hover:opacity-90 animate-pulse-glow" />
        </a>
        {/* Set Your Goals card with dotted matrix background */}
        <a href="/goals" className="group bg-background-glass/80 border-2 border-indigo-500/40 shadow-xl backdrop-blur-2xl px-8 py-8 flex flex-col items-start justify-between skew-y-[-4deg] hover:skew-y-[-2deg] transition-all duration-300 relative overflow-hidden signature-card" style={{
          borderRadius: '2rem 1.5rem 2rem 1.5rem / 1.5rem 2rem 1.5rem 2rem',
          minHeight: 120,
          background: 'rgba(36,33,44,0.85)',
        }}>
          {/* Dotted matrix background */}
          <svg className="absolute left-0 top-0 w-full h-full opacity-20" viewBox="0 0 120 60">
            {Array.from({length: 8}).map((_, row) => (
              Array.from({length: 16}).map((_, col) => (
                <circle key={row + '-' + col} cx={col*8+4} cy={row*8+4} r="1.2" fill="#818cf8" />
              ))
            ))}
          </svg>
          <svg className="absolute top-2 right-2 w-10 h-10 opacity-20" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#818cf8" strokeWidth="3" strokeDasharray="4 4" /></svg>
          <span className="text-lg font-bold text-indigo-200 mb-1">Set Your Goals</span>
          <span className="text-sm text-gray-300">Track and achieve your financial goals with smart nudges.</span>
        </a>
        {/* Your Library card with orbit-style animated lines */}
        <a href="/library" className="group bg-background-glass/80 border-2 border-emerald-500/40 shadow-xl backdrop-blur-2xl px-8 py-8 flex flex-col items-start justify-between skew-y-[-4deg] hover:skew-y-[-2deg] transition-all duration-300 relative overflow-hidden signature-card" style={{
          borderRadius: '2rem 1.5rem 2rem 1.5rem / 1.5rem 2rem 1.5rem 2rem',
          minHeight: 120,
          background: 'rgba(36,33,44,0.85)',
        }}>
          {/* Orbit-style animated lines */}
          <svg className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 opacity-20 animate-orbit-spin" viewBox="0 0 96 96">
            <ellipse cx="48" cy="48" rx="40" ry="16" fill="none" stroke="#34d399" strokeWidth="2" />
            <ellipse cx="48" cy="48" rx="24" ry="8" fill="none" stroke="#a21caf" strokeWidth="1.5" />
          </svg>
          <svg className="absolute top-2 right-2 w-10 h-10 opacity-20" viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" rx="6" fill="none" stroke="#34d399" strokeWidth="3" strokeDasharray="4 4" /></svg>
          <span className="text-lg font-bold text-emerald-200 mb-1">Your Library</span>
          <span className="text-sm text-gray-300">Save, revisit, and learn from your past recommendations.</span>
        </a>
        {/* Bottom strip for trends/onboarding */}
        <div className="col-span-1 md:col-span-3 flex items-center justify-center mt-8">
          <div className="w-full max-w-2xl px-6 py-4 rounded-[2rem] bg-background-glass/70 border border-white/10 shadow-lg flex items-center gap-4 backdrop-blur-xl relative signature-card" style={{
            borderRadius: '2rem 1.5rem 2rem 1.5rem / 1.5rem 2rem 1.5rem 2rem',
            minHeight: 60,
          }}>
            <svg className="w-8 h-8 opacity-30" viewBox="0 0 32 32"><polyline points="2,30 8,18 14,26 20,10 26,22 30,14" fill="none" stroke="#d946ef" strokeWidth="3" strokeDasharray="4 4" /></svg>
            <span className="text-sm text-fuchsia-200 font-semibold tracking-wide">Trending: AI-driven investing is up 32% this year 🚀</span>
          </div>
        </div>
      </section>
      {/* Animations */}
      <style>{`
        @keyframes fluid-bg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fluid-bg {
          animation: fluid-bg 16s ease-in-out infinite;
        }
        @keyframes hero-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-hero-gradient {
          background-size: 200% 200%;
          animation: hero-gradient 8s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2.2s infinite;
        }
        .animate-fadein { animation: fadein 1.2s cubic-bezier(.4,0,.2,1) both; }
        .animate-fadein2 { animation: fadein 1.6s cubic-bezier(.4,0,.2,1) both; }
        .animate-fadein3 { animation: fadein 2s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadein { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
        .animate-slidein { animation: slidein 1.5s cubic-bezier(.4,0,.2,1) both; }
        @keyframes slidein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        .signature-card {
          box-shadow: 0 8px 32px 0 #a21caf44, 0 0 0 2px #d946ef33 inset;
          transition: box-shadow 0.3s, background 0.3s, transform 0.2s;
        }
        .signature-card:hover {
          box-shadow: 0 12px 40px 0 #818cf888, 0 0 0 2px #a21caf66 inset, 0 0 16px 2px #d946ef55;
          background: rgba(129,140,248,0.12) !important;
          transform: perspective(600px) rotateY(-4deg) scale(1.03);
        }
        .signature-card:active {
          box-shadow: 0 4px 16px 0 #a21caf44, 0 0 0 2px #d946ef33 inset;
          background: rgba(36,33,44,0.95) !important;
          animation: ripple-pulse 0.4s;
        }
        @keyframes ripple-pulse {
          0% { box-shadow: 0 0 0 0 #d946ef55; }
          100% { box-shadow: 0 0 0 16px rgba(217,70,239,0); }
        }
        .animate-orbit-spin {
          animation: orbit-spin 6s linear infinite;
        }
        @keyframes orbit-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;
  
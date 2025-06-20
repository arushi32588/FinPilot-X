import React, { useState, useEffect } from 'react';
import config from '../config';
import InvestmentProfileForm from './InvestmentProfileForm';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';
import { FaChartLine } from 'react-icons/fa';
import { FaRobot } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import GalaxyLoader from './GalaxyLoader';
import AnimatedNumber from './AnimatedNumber';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const InvestmentRecommender = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { isDarkMode } = useTheme();
  const [showPortfolioExplanation, setShowPortfolioExplanation] = useState(false);
  const [portfolioExplanation, setPortfolioExplanation] = useState(null);
  const [portfolioExplanationLoading, setPortfolioExplanationLoading] = useState(false);
  const [portfolioExplanationError, setPortfolioExplanationError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [user, setUser] = useState(null);

  const sectionRefs = {
    summary: React.useRef(),
    portfolio: React.useRef(),
    micro: React.useRef(),
    growth: React.useRef(),
    risk: React.useRef(),
    tips: React.useRef(),
    gamify: React.useRef(),
  };
  const sectionList = [
    { key: 'summary', label: 'Summary', icon: '📊' },
    { key: 'portfolio', label: 'Portfolio', icon: '💼' },
    { key: 'micro', label: 'Micro-Invest', icon: '🪐' },
    { key: 'growth', label: 'Simulate', icon: '🌀' },
    { key: 'risk', label: 'Risk', icon: '⚡' },
    { key: 'tips', label: 'Tips', icon: '💡' },
    { key: 'gamify', label: 'Gamify', icon: '🏆' },
  ];
  const [activeSection, setActiveSection] = React.useState('summary');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sectionList.map(({ key }) => {
        const ref = sectionRefs[key].current;
        return ref ? ref.getBoundingClientRect().top : Infinity;
      });
      const idx = offsets.findIndex((top, i) => top > 80 && (i === 0 || offsets[i-1] <= 80));
      setActiveSection(sectionList[Math.max(0, idx-1)].key);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = key => {
    const ref = sectionRefs[key].current;
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleProfileSubmit = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      setUserProfile(profileData);

      const response = await fetch(`${config.API_BASE_URL}/api/investment-recommender/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainPortfolio = async () => {
    setShowPortfolioExplanation(true);
    setPortfolioExplanation(null);
    setPortfolioExplanationError(null);
    setPortfolioExplanationLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/decision-explainer/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio: recommendations.recommended_portfolio,
          user_profile: userProfile
        })
      });
      if (!response.ok) throw new Error('Failed to fetch explanation');
      const data = await response.json();
      setPortfolioExplanation(data);
    } catch (err) {
      setPortfolioExplanationError(err.message);
    } finally {
      setPortfolioExplanationLoading(false);
    }
  };

  const handleSaveRecommendation = async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/investment-recommender/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.uid || 'demo_user',
          recommendation: recommendations
        })
      });
      if (!response.ok) throw new Error('Failed to save');
      setSaveStatus('success');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="relative w-full min-h-[500px] flex items-center justify-center">
        <GalaxyLoader overlay />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#0ea5e9] animate-gradient-move relative overflow-x-hidden py-12">
        {/* Animated SVG/gradient background shapes for depth */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-gradient-to-br from-[#38bdf8]/40 via-[#818cf8]/30 to-[#f472b6]/20 rounded-full blur-3xl opacity-60 animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-gradient-to-tr from-[#f472b6]/30 via-[#fbbf24]/20 to-[#38bdf8]/20 rounded-full blur-2xl opacity-50 animate-pulse-slower" />
        </div>
        <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center">
          {/* Glassy Card with Neon Border */}
          <div className="w-full bg-white/10 backdrop-blur-xl rounded-3xl border-2 border-[#38bdf8] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-0 md:p-1.5 md:pt-0 md:pb-8 mt-4 mb-8 animate-fade-in">
            {/* Animated Heading */}
            <div className="flex flex-col items-center justify-center pt-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl md:text-5xl text-[#38bdf8] animate-bounce-slow"><FaChartLine /></span>
                <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] bg-clip-text text-transparent animate-gradient-text">Investment Recommender</h2>
              </div>
              <p className="text-lg md:text-xl text-[#e0e7ef] font-medium tracking-wide animate-fade-in-slow">Personalized, AI-powered investment strategies for your goals</p>
            </div>
            <div className="w-full flex flex-col items-center px-2 md:px-8">
      <div style={{
        maxWidth: '64rem',
        margin: '0 auto',
        padding: '1.5rem'
      }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: isDarkMode ? '#991b1b' : '#fee2e2',
          borderRadius: '0.75rem',
          border: `1px solid ${isDarkMode ? '#7f1d1d' : '#fecaca'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{
              fontSize: '1.5rem',
              marginRight: '0.75rem',
              color: isDarkMode ? '#fecaca' : '#991b1b'
            }}>⚠️</span>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: isDarkMode ? '#fecaca' : '#991b1b'
            }}>
              Error Loading Recommendations
            </h3>
          </div>
          <p style={{
            color: isDarkMode ? '#fecaca' : '#991b1b',
            marginBottom: '1rem'
          }}>
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isDarkMode ? '#7f1d1d' : '#fecaca',
              color: isDarkMode ? '#fecaca' : '#991b1b',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Try Again
          </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations) {
    console.log('micro_investment_plan:', recommendations.micro_investment_plan);
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#0ea5e9] animate-gradient-move relative overflow-x-hidden py-12">
      {/* Animated SVG/gradient background shapes for depth */}
      <div className="absolute inset-0 -z-10 animate-fluid-bg" style={{background: 'linear-gradient(120deg, #0b0c10 0%, #18181b 50%, #2e1065 100%)', backgroundSize: '200% 200%'}} />
      <div className="pointer-events-none select-none">
        <svg className="absolute top-0 left-0 w-full h-32 opacity-20" viewBox="0 0 1440 100"><polyline points="0,80 400,40 800,90 1200,20 1440,60" fill="none" stroke="#a21caf" strokeWidth="6" strokeDasharray="12 8" /></svg>
        <svg className="absolute bottom-0 right-0 w-full h-32 opacity-10" viewBox="0 0 1440 100"><polyline points="0,60 300,20 700,80 1100,30 1440,90" fill="none" stroke="#818cf8" strokeWidth="6" strokeDasharray="10 10" /></svg>
      </div>
      {/* Floating AI-generated tag above the card */}
      {recommendations && (
        <div className="relative z-30 flex flex-col items-center w-full" style={{marginBottom: '-1.5rem'}}>
          <div className="flex items-center justify-center mx-auto px-6 py-2 rounded-full bg-gradient-to-r from-fuchsia-900/80 via-indigo-900/80 to-fuchsia-900/80 border border-fuchsia-400/40 shadow-2xl backdrop-blur-xl relative" style={{boxShadow: '0 2px 24px 0 #a21caf55, 0 0 0 2px #d946ef33 inset', marginBottom: '1.5rem'}}>
            <span className="mr-2 animate-ai-sparkle text-fuchsia-200 text-lg">✨</span>
            <span className="ai-typewriter-badge text-base md:text-lg font-semibold text-fuchsia-100 tracking-wide" style={{letterSpacing: '0.04em'}}>Personalized by FinPilot AI</span>
            <span className="ai-typewriter-cursor text-fuchsia-300 text-lg ml-1">|</span>
          </div>
          <style>{`
            @keyframes aiBadgeFadeIn {
              from { opacity: 0; transform: translateY(24px) scale(0.98); }
              to { opacity: 1; transform: none; }
            }
            .animate-ai-badge-fade-in {
              animation: aiBadgeFadeIn 1.2s cubic-bezier(.4,0,.2,1);
            }
            @keyframes aiSparkle {
              0%, 100% { filter: brightness(1.2) drop-shadow(0 0 8px #f472b6); }
              50% { filter: brightness(2) drop-shadow(0 0 18px #fbbf24); }
            }
            .animate-ai-sparkle {
              animation: aiSparkle 1.6s infinite;
            }
            @keyframes aiTypewriter {
              from { width: 0; }
              to { width: 100%; }
            }
            .ai-typewriter-badge {
              display: inline-block;
              overflow: hidden;
              white-space: nowrap;
              border-right: none;
              width: 0;
              animation: aiTypewriter 1.7s steps(30, end) 0.3s forwards;
            }
            @keyframes aiCursorBlink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            .ai-typewriter-cursor {
              animation: aiCursorBlink 1s steps(1) infinite;
              opacity: 0;
              animation-delay: 2.1s;
              /* Cursor appears after typewriter finishes */
              animation-fill-mode: forwards;
            }
          `}</style>
            </div>
      )}
      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center">
        {/* Glassy Card with Neon Border */}
        <div className="w-full signature-card bg-background-glass/90 border-2 border-fuchsia-500/40 shadow-2xl backdrop-blur-2xl px-8 py-10 flex flex-col items-center" style={{
          borderRadius: '2.5rem 1.5rem 2.5rem 1.5rem / 2rem 2.5rem 1.5rem 2.5rem',
          boxShadow: '0 8px 32px 0 #a21caf44, 0 0 0 2px #d946ef33 inset',
          background: 'rgba(36,33,44,0.92)',
        }}>
          {/* Animated Heading */}
          <div className="flex flex-col items-center justify-center pt-8 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl md:text-5xl text-fuchsia-400 animate-bounce-slow"><FaChartLine /></span>
              <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-logo-gradient">Investment Recommender</h2>
          </div>
            <p className="text-lg md:text-xl text-fuchsia-200 font-medium tracking-wide animate-fade-in-slow">Personalized, AI-powered investment strategies for your goals</p>
          </div>
          <div className="w-full flex flex-col items-center px-2 md:px-8">
            {/* Profile Form or Summary */}
          {!userProfile ? (
              <div className="w-full max-w-2xl mx-auto mb-8">
                <div className="bg-white/20 rounded-2xl p-6 border border-[#818cf8] shadow-inner">
                  <h3 className="text-xl font-bold text-[#38bdf8] mb-4">Tell us about your investment preferences</h3>
                  <InvestmentProfileForm onSubmit={handleProfileSubmit} glassy />
              </div>
            </div>
          ) : (
            <>
              {/* User Profile Summary */}
                <div className="w-full mb-8">
                  <div className="bg-white/10 rounded-2xl border border-[#818cf8] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
                  {[
                    { label: 'Investment Goal', value: userProfile.goal },
                    { label: 'Risk Tolerance', value: userProfile.risk_tolerance },
                    { label: 'Time Horizon', value: `${Math.round(userProfile.time_horizon_months / 12)} years` },
                    { label: 'Micro-Investments', value: userProfile.wants_micro_invest ? 'Enabled' : 'Disabled' },
                    { label: 'Target Amount', value: userProfile.target_amount ? `₹${userProfile.target_amount.toLocaleString()}` : 'Not specified' },
                    { label: 'Monthly Investment', value: userProfile.monthly_investment ? `₹${userProfile.monthly_investment.toLocaleString()}` : 'Not specified' },
                    { label: 'Current Investments', value: userProfile.current_investments ? `₹${userProfile.current_investments.toLocaleString()}` : 'Not specified' },
                    { label: 'Annual Income', value: userProfile.income_range },
                    { label: 'Investment Experience', value: userProfile.investment_experience }
                  ].map((item, index) => (
                      <div key={index} className="bg-white/20 rounded-xl p-4 flex flex-col items-start shadow">
                        <span className="text-xs font-semibold text-[#818cf8] mb-1">{item.label}</span>
                        <span className="text-lg font-bold text-[#38bdf8]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
                {/* Render Recommendations */}
              {recommendations && (
                      <div className="w-full flex flex-col gap-6">
                        {/* Central Summary */}
                      <div ref={sectionRefs.summary} />
                  {recommendations.central_summary && (
                        <>
                          <div className="section-glow-divider" />
                          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] bg-clip-text text-transparent mb-4 mt-8">
                            Summary
                          </div>
                          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {Object.entries(recommendations.central_summary)
                              .filter(([k]) => k !== 'goal_gap_status')
                              .map(([k, v]) => (
                                <div
                                  key={k}
                                  className="relative group bg-gradient-to-br from-[#232046]/90 to-[#181c2f]/90 backdrop-blur-xl rounded-2xl border-l-8 border-l-[#38bdf8] border-2 border-[#38bdf8] shadow-[0_12px_30px_rgba(100,100,255,0.15)] p-6 flex flex-col items-center gap-2"
                                  style={{ fontFamily: 'Inter, DM Sans, sans-serif', boxShadow: '0 2px 16px 0 rgba(56,189,248,0.10), 0 1.5px 0 0 #818cf8 inset' }}
                                >
                                  <span className="font-bold text-pink-400 text-base underline decoration-dotted decoration-2 mb-1 text-center" style={{ fontWeight: 700 }}>
                                    {k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  <span className="text-2xl font-bold text-blue-400 text-center" style={{ fontWeight: 700 }}>
                                    {v}
                                  </span>
                          </div>
                        ))}
                      </div>
                        </>
                      )}
                        {/* Portfolio */}
                        {recommendations.recommended_portfolio && (
                          <>
                            <div ref={sectionRefs.portfolio} />
                            <div className="section-glow-divider" />
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                              {recommendations.recommended_portfolio.map((fund, i) => {
                                const riskColors = {
                                  Low: 'bg-green-500 text-white',
                                  Medium: 'bg-yellow-400 text-gray-900',
                                  High: 'bg-red-500 text-white',
                                };
                                const riskIcon = {
                                  Low: '🟢',
                                  Medium: '🟡',
                                  High: '🔴',
                                };
                                const allocationPercent = parseFloat((fund.allocation || '').toString().replace('%','')) || 0;
                                const tooltip = fund.reasoning || 'Good for diversified investing.';
                                return (
                                  <div
                                    key={i}
                                    className={`recommendation-card group relative bg-gradient-to-br from-[#232046]/90 to-[#181c2f]/90 backdrop-blur-xl rounded-2xl border-l-8 border-l-[#38bdf8] border-2 border-[#38bdf8] shadow-[0_12px_30px_rgba(100,100,255,0.15)] p-6 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.035] hover:shadow-[0_16px_48px_0_rgba(56,189,248,0.25)] hover:border-pink-400 animate-fade-slide-in`}
                                    style={{
                                      fontFamily: 'Inter, DM Sans, sans-serif',
                                      boxShadow: '0 2px 16px 0 rgba(56,189,248,0.10), 0 1.5px 0 0 #818cf8 inset',
                                      animationDelay: `${i * 0.12 + 0.2}s`,
                                      animationFillMode: 'backwards',
                                      perspective: 800,
                                    }}
                                  >
                                    {/* Glowing border on hover */}
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{boxShadow: '0 0 32px 8px #f472b6cc, 0 0 0 4px #38bdf8cc'}} />
                                    {/* Fund Name with Tooltip */}
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-pink-400 text-lg cursor-pointer relative" style={{ fontWeight: 700 }}>
                                        <span className="underline decoration-dotted decoration-2" tabIndex={0}>{fund.name}</span>
                                        <span className="absolute left-1/2 -translate-x-1/2 top-8 z-20 hidden group-hover:block group-focus:block min-w-[200px] bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-[#818cf8] transition-all duration-150">
                                          {tooltip}
                                        </span>
                                      </span>
                                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${riskColors[fund.risk_level] || 'bg-gray-500 text-white'}`} style={{ letterSpacing: '0.04em' }}>{riskIcon[fund.risk_level] || '🟡'} {fund.risk_level}</span>
                            </div>
                                    {/* Vertical Progress bar for allocation and sparkline */}
                                    <div className="flex items-center gap-4 mb-2">
                                      <div className="flex flex-col items-center justify-center h-16 w-6 mr-2">
                                        <div className="relative h-full w-2 bg-[#23263a] rounded-full overflow-hidden">
                                          <div className="absolute bottom-0 left-0 w-2 rounded-full bg-gradient-to-t from-[#38bdf8] to-[#818cf8]" style={{ height: `${allocationPercent}%` }}></div>
                              </div>
                                      <span className="text-xs font-bold text-blue-400 mt-1">{fund.allocation}</span>
                              </div>
                                      {/* Mini sparkline (gradient, filled area) */}
                                      <div className="flex-1">
                                        <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <defs>
                                            <linearGradient id={`sparkline-gradient-${i}`} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                                              <stop stopColor="#38bdf8" />
                                              <stop offset="1" stopColor="#f472b6" />
                                            </linearGradient>
                                          </defs>
                                          <polygon points="0,28 0,20 20,10 40,14 60,6 80,12 100,4 100,28" fill={`url(#sparkline-gradient-${i})`} fillOpacity="0.18" />
                                          <polyline points="0,20 20,10 40,14 60,6 80,12 100,4" stroke={`url(#sparkline-gradient-${i})`} strokeWidth="2.5" fill="none" />
                                          <circle cx="100" cy="4" r="2.5" fill="#f472b6" />
                                        </svg>
                            </div>
                          </div>
                                  {/* Metrics row */}
                                  <div className="flex flex-wrap gap-4 mb-2">
                                    <div className="flex items-center gap-1 text-blue-400 font-semibold"><span>📈</span> <span>Return:</span> <span className="font-bold ml-1" style={{ fontWeight: 600 }}>{fund.expected_return}</span></div>
                                    <div className="flex items-center gap-1 text-pink-400 font-semibold"><span>💼</span> <span>Min:</span> <span className="font-bold ml-1" style={{ fontWeight: 600 }}>₹{fund.min_investment}</span></div>
                                    <div className="flex items-center gap-1 text-blue-400 font-semibold"><span>💧</span> <span>Liquidity:</span> <span className="font-bold ml-1" style={{ fontWeight: 600 }}>{fund.liquidity}</span></div>
                            </div>
                                  {/* Inflation Analysis */}
                                  {(fund.expected_nominal_return || fund.inflation_rate || fund.real_return || fund.nominal_future_value || fund.inflation_adjusted_value) && (
                                    <div className="rounded-xl bg-background-glass/70 border border-fuchsia-400/10 shadow-inner p-4 text-fuchsia-100 text-xs flex flex-col gap-1 mt-1">
                                      <div className="flex flex-wrap gap-4">
                                        {fund.expected_nominal_return && <span><span className="font-semibold text-blue-300">Nominal Return:</span> {fund.expected_nominal_return}</span>}
                                        {fund.inflation_rate && <span><span className="font-semibold text-pink-300">Inflation Rate:</span> {fund.inflation_rate}</span>}
                                        {fund.real_return && <span><span className="font-semibold text-green-300">Real Return:</span> {fund.real_return}</span>}
                            </div>
                                      <div className="flex flex-wrap gap-4">
                                        {fund.nominal_future_value && <span><span className="font-semibold text-indigo-300">Future Value:</span> {fund.nominal_future_value}</span>}
                                        {fund.inflation_adjusted_value && <span><span className="font-semibold text-emerald-300">Inflation-Adjusted:</span> {fund.inflation_adjusted_value}</span>}
                          </div>
                                      {fund.what_this_means && <div className="mt-1 text-fuchsia-200 italic">{fund.what_this_means}</div>}
                              </div>
                                  )}
                                  {/* Short blurb/description */}
                                  <div className="text-sm text-gray-200 leading-relaxed space-y-1" style={{ lineHeight: 1.6, fontWeight: 400 }}>
                                    {fund.reasoning && fund.reasoning.split('. ').map((blurb, idx) => (
                                      <div key={idx}><span className="font-bold text-pink-400">{blurb.split(':')[0]}</span>{blurb.includes(':') ? ':' : ''} {blurb.split(':').slice(1).join(':')}</div>
                                    ))}
                            </div>
                          </div>
                              );
                            })}
                        </div>
                          {/* Why this portfolio? and Save buttons */}
                          <div className="flex flex-wrap gap-4 items-center justify-center mt-6 mb-8">
                            <button
                              onClick={handleExplainPortfolio}
                              className="ai-reasoning-button flex items-center gap-2 px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-150 border-none outline-none focus:ring-2 focus:ring-fuchsia-400/40 focus:ring-offset-2 animate-ai-reasoning-glow"
                            >
                              <FaRobot className="text-xl text-fuchsia-200 animate-ai-reasoning-robot" />
                              <span>Show FinPilot's Logic</span>
                            </button>
                      <button
                        onClick={handleSaveRecommendation}
                              className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-[#f472b6] to-[#818cf8] text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-150 border-none outline-none"
                              disabled={saveStatus === 'saving'}
                          >
                              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error! Try Again' : 'Save to Library'}
                      </button>
                          </div>
                          {/* Modal for portfolio explanation */}
                          {showPortfolioExplanation && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                              <div className="bg-background-glass/95 rounded-2xl p-8 max-w-lg w-full shadow-2xl border-2 border-fuchsia-400/30 relative animate-fade-in backdrop-blur-xl" style={{boxShadow: '0 8px 32px 0 #a21caf44, 0 0 0 2px #d946ef33 inset'}}>
                                <button
                                  onClick={() => setShowPortfolioExplanation(false)}
                                  className="absolute top-3 right-4 text-2xl text-pink-400 hover:text-blue-400 font-bold focus:outline-none"
                                  title="Close"
                                >
                                  ×
                                </button>
                                <div className="flex items-center gap-3 mb-4">
                                  <FaRobot className="text-2xl text-fuchsia-300 animate-ai-reasoning-robot" />
                                  <h3 className="text-xl font-bold text-blue-400">FinPilot's Logic</h3>
                                </div>
                                {portfolioExplanationLoading && <div className="text-[#818cf8]">Loading explanation...</div>}
                                {portfolioExplanationError && <div className="text-red-400">{portfolioExplanationError}</div>}
                                {portfolioExplanation && (
                                  <div className="prose prose-invert max-w-none text-[#e0e7ef] ai-reasoning-typewriter">
                                    <ReactMarkdown>{portfolioExplanation.explanation || JSON.stringify(portfolioExplanation, null, 2)}</ReactMarkdown>
                                  </div>
                                )}
                                <style>{`
                                  .ai-reasoning-button {
                                    box-shadow: 0 0 16px 2px #a21caf44, 0 0 0 2px #d946ef33 inset;
                                  }
                                  .animate-ai-reasoning-glow {
                                    animation: aiReasoningGlow 2.2s infinite alternate;
                                  }
                                  @keyframes aiReasoningGlow {
                                    0% { box-shadow: 0 0 16px 2px #a21caf44, 0 0 0 2px #d946ef33 inset; }
                                    100% { box-shadow: 0 0 32px 8px #f472b6cc, 0 0 0 4px #38bdf8cc; }
                                  }
                                  .animate-ai-reasoning-robot {
                                    animation: aiReasoningRobot 1.2s infinite alternate;
                                  }
                                  @keyframes aiReasoningRobot {
                                    0% { filter: drop-shadow(0 0 2px #fbbf24); }
                                    100% { filter: drop-shadow(0 0 8px #f472b6); }
                                  }
                                  .ai-reasoning-typewriter {
                                    animation: aiTypewriterFadeIn 1.2s cubic-bezier(.4,0,.2,1);
                                  }
                                  @keyframes aiTypewriterFadeIn {
                                    from { opacity: 0; transform: translateY(16px); }
                                    to { opacity: 1; transform: none; }
                                  }
                                `}</style>
                    </div>
                  </div>
                          )}
                        </>
                      )}
                  {/* Micro-Investment Plan */}
                      {recommendations.micro_investment_plan && (
                        <>
                          <div ref={sectionRefs.micro} />
                          <div className="section-glow-divider" />
                          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] bg-clip-text text-transparent mb-4 mt-8">
                      Micro-Investment Plan
                          </div>
                          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {Object.entries(recommendations.micro_investment_plan)
                              .filter(([k]) => ['weekly_investment', 'weeks_to_goal', 'total_contribution'].includes(k))
                              .map(([k, v]) => (
                                <div
                                  key={k}
                                  className="relative group bg-gradient-to-br from-[#232046]/90 to-[#181c2f]/90 backdrop-blur-xl rounded-2xl border-l-8 border-l-[#38bdf8] border-2 border-[#38bdf8] shadow-[0_12px_30px_rgba(100,100,255,0.15)] p-6 flex flex-col items-center gap-2"
                                  style={{ fontFamily: 'Inter, DM Sans, sans-serif', boxShadow: '0 2px 16px 0 rgba(56,189,248,0.10), 0 1.5px 0 0 #818cf8 inset' }}
                                >
                                  <span className="font-bold text-pink-400 text-base underline decoration-dotted decoration-2 mb-1 text-center" style={{ fontWeight: 700 }}>
                                    {k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  <span className="text-2xl font-bold text-blue-400 text-center" style={{ fontWeight: 700 }}>
                                    {k === 'weeks_to_goal' ? (
                                      <AnimatedNumber value={Number(v)} duration={1200} />
                                    ) : k === 'weekly_investment' || k === 'total_contribution' ? (
                                      <AnimatedNumber value={Number(v)} duration={1200} prefix="₹" decimals={0} />
                                    ) : (
                                      Array.isArray(v) ? v.join(', ') : v
                                    )}
                                  </span>
                        </div>
                          ))}
                        </div>
                        </>
                      )}
                  {/* Growth Simulations */}
                      {recommendations.growth_simulations && (() => {
                        const scenarios = [
                          { key: 'normal', label: 'Normal', icon: '📈', color: 'text-blue-400' },
                          { key: 'crash', label: 'Crash', icon: '💥', color: 'text-red-400' },
                          { key: 'boom', label: 'Boom', icon: '🚀', color: 'text-green-400' },
                        ];
                        function parseScenarioValue(v) {
                          if (typeof v === 'string') {
                            // e.g. '13.1% growth'
                            const match = v.match(/([\d.]+)%/);
                            return match ? parseFloat(match[1]) : 0;
                          } else if (typeof v === 'number') {
                            return v;
                          } else if (Array.isArray(v)) {
                            return v.length ? Number(v[v.length - 1]) : 0;
                          } else if (typeof v === 'object' && v !== null) {
                            if ('mean' in v) return Number(v.mean);
                            const vals = Object.values(v);
                            return vals.length ? Number(vals[vals.length - 1]) : 0;
                          }
                          return 0;
                        }
                        return (
                          <>
                            <div ref={sectionRefs.growth} />
                            <div className="section-glow-divider" />
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] bg-clip-text text-transparent mb-4 mt-8">
                              Growth Simulations
                          </div>
                            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                              {scenarios.map(({ key, label, icon, color }) => {
                                const v = recommendations.growth_simulations[key];
                                const value = parseScenarioValue(v);
                                return (
                                  <div key={key} className="relative group bg-gradient-to-br from-[#232046]/90 to-[#181c2f]/90 backdrop-blur-xl rounded-2xl border-l-8 border-l-[#38bdf8] border-2 border-[#38bdf8] shadow-[0_12px_30px_rgba(100,100,255,0.15)] p-6 flex flex-col items-center gap-2" style={{ fontFamily: 'Inter, DM Sans, sans-serif', boxShadow: '0 2px 16px 0 rgba(56,189,248,0.10), 0 1.5px 0 0 #818cf8 inset' }}>
                                    <span className={`font-bold text-base underline decoration-dotted decoration-2 mb-1 text-center ${color}`} style={{ fontWeight: 700 }}>
                                      {icon} {label}
                                    </span>
                                    <span className="text-2xl font-bold text-blue-400 text-center" style={{ fontWeight: 700 }}>
                                      <AnimatedNumber value={value} duration={1200} suffix="%" decimals={1} />
                                    </span>
                      </div>
                                );
                              })}
                          </div>
                          </>
                        );
                      })()}
                  {/* Risk Analysis */}
                      {recommendations.risk_analysis && (
                        <>
                          <div ref={sectionRefs.risk} />
                          <div className="section-glow-divider" />
                          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] bg-clip-text text-transparent mb-4 mt-8">
                      Risk Analysis
                          </div>
                          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {Object.entries(recommendations.risk_analysis)
                              .filter(([k]) => ['portfolio_risk', 'diversification_score', 'liquidity_score'].includes(k))
                              .map(([k, v]) => (
                                <div
                                  key={k}
                                  className="relative group bg-gradient-to-br from-[#232046]/90 to-[#181c2f]/90 backdrop-blur-xl rounded-2xl border-l-8 border-l-[#38bdf8] border-2 border-[#38bdf8] shadow-[0_12px_30px_rgba(100,100,255,0.15)] p-6 flex flex-col items-center gap-2"
                                  style={{ fontFamily: 'Inter, DM Sans, sans-serif', boxShadow: '0 2px 16px 0 rgba(56,189,248,0.10), 0 1.5px 0 0 #818cf8 inset' }}
                                >
                                  <span className="font-bold text-pink-400 text-base underline decoration-dotted decoration-2 mb-1 text-center" style={{ fontWeight: 700 }}>
                                    {k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  <span className="text-2xl font-bold text-blue-400 text-center" style={{ fontWeight: 700 }}>
                                    {Array.isArray(v) ? v.join(', ') : v}
                                  </span>
                      </div>
                              ))}
                      </div>
                        </>
                        )}
                      {/* Investment Tips */}
                      {recommendations.investment_tips && (
                        <>
                          <div ref={sectionRefs.tips} />
                          <div className="section-glow-divider" />
                          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] bg-clip-text text-transparent mb-4 mt-8">
                            Investment Tips
                    </div>
                          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {recommendations.investment_tips.map((tip, i) => (
                              <div
                                key={i}
                                className="relative group bg-gradient-to-br from-[#232046]/90 to-[#181c2f]/90 backdrop-blur-xl rounded-2xl border-l-8 border-l-[#38bdf8] border-2 border-[#38bdf8] shadow-[0_12px_30px_rgba(100,100,255,0.15)] p-6 flex flex-col items-center gap-2"
                                style={{ fontFamily: 'Inter, DM Sans, sans-serif', boxShadow: '0 2px 16px 0 rgba(56,189,248,0.10), 0 1.5px 0 0 #818cf8 inset' }}
                              >
                                <span className="font-bold text-pink-400 text-base underline decoration-dotted decoration-2 mb-1 text-center" style={{ fontWeight: 700 }}>
                                  Tip {i + 1}
                                </span>
                                <span className="text-[#e0e7ef] text-center">{tip}</span>
                  </div>
                          ))}
                        </div>
                        </>
                      )}
                      {/* Nudge */}
                  {recommendations.nudge && (
                        <>
                          <div className="section-glow-divider" />
                          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] bg-clip-text text-transparent mb-4 mt-8">
                            Nudge
                      </div>
                          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div
                              className="relative group bg-gradient-to-br from-[#232046]/90 to-[#181c2f]/90 backdrop-blur-xl rounded-2xl border-l-8 border-l-[#38bdf8] border-2 border-[#38bdf8] shadow-[0_12px_30px_rgba(100,100,255,0.15)] p-6 flex flex-col items-center gap-2"
                              style={{ fontFamily: 'Inter, DM Sans, sans-serif', boxShadow: '0 2px 16px 0 rgba(56,189,248,0.10), 0 1.5px 0 0 #818cf8 inset' }}
                            >
                              <span className="font-bold text-pink-400 text-base underline decoration-dotted decoration-2 mb-1 text-center" style={{ fontWeight: 700 }}>
                                Nudge
                              </span>
                              <span className="text-[#e0e7ef] text-center">{recommendations.nudge}</span>
                    </div>
                          </div>
                        </>
                      )}
                      {/* Gamification */}
                      {recommendations.gamification && (() => {
                        // Example: count completed actions (simulate for now)
                        const totalActions = 5;
                        const completedActions = Math.min(3, totalActions); // Replace with real logic if available
                        const progressPercent = (completedActions / totalActions) * 100;
                        const challenges = [
                          { icon: '🎯', label: 'Set 1 more goal', done: false },
                          { icon: '📚', label: 'Read 2 investment tips', done: true },
                          { icon: '🧮', label: 'Try the inflation simulator', done: false },
                          { icon: '💾', label: 'Save a recommendation', done: true },
                          { icon: '🔍', label: 'Explore risk analysis', done: false },
                        ];
                        return (
                          <div className="w-full flex flex-col items-center">
                            <div className="w-full bg-gradient-to-br from-[#232046]/90 to-[#181c2f]/90 backdrop-blur-xl rounded-2xl border-2 border-fuchsia-400/30 shadow-xl p-6 flex flex-col items-center gap-4 relative" style={{boxShadow: '0 2px 16px 0 #a21caf22, 0 1.5px 0 0 #818cf8 inset'}}>
                              <div className="w-full flex items-center justify-between mb-2">
                                <span className="text-lg font-bold text-fuchsia-200">Progress</span>
                                <span className="text-sm text-fuchsia-300 font-semibold">{completedActions}/{totalActions} actions completed</span>
                        </div>
                              <div className="w-full h-4 bg-fuchsia-900/30 rounded-full overflow-hidden mb-2 border border-fuchsia-400/20 relative">
                                <div className="h-full bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-blue-400 rounded-full shadow-lg animate-gamify-progress" style={{width: `${progressPercent}%`, transition: 'width 0.7s cubic-bezier(.4,0,.2,1)'}} />
                    </div>
                              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                {challenges.map((c, idx) => (
                                  <div key={idx} className={`flex items-center gap-3 px-4 py-2 rounded-xl ${c.done ? 'bg-fuchsia-800/30 border border-fuchsia-400/30 text-fuchsia-200' : 'bg-background-glass/60 border border-fuchsia-400/10 text-fuchsia-100'} shadow-inner transition-all duration-200`}>
                                    <span className="text-xl md:text-2xl">{c.icon}</span>
                                    <span className="text-sm md:text-base font-medium flex-1">{c.label}</span>
                                    {c.done && <span className="ml-2 text-green-400 font-bold">✓</span>}
                  </div>
                                ))}
                    </div>
                              <style>{`
                                .animate-gamify-progress {
                                  animation: gamifyProgressGlow 2.2s infinite alternate;
                                }
                                @keyframes gamifyProgressGlow {
                                  0% { box-shadow: 0 0 8px 2px #f472b6cc; }
                                  100% { box-shadow: 0 0 24px 8px #38bdf8cc; }
                                }
                              `}</style>
                  </div>
                          </div>
                        );
                      })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
      {/* Floating navigation bubble */}
      {recommendations && (
        <div className="fixed right-6 top-1/2 z-40 -translate-y-1/2 flex flex-col gap-3 bg-background-glass/80 rounded-2xl shadow-xl border border-fuchsia-400/20 px-2 py-4 backdrop-blur-xl animate-fade-in" style={{boxShadow: '0 2px 16px 0 #a21caf22'}}>
          {sectionList.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 ${activeSection === key ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white scale-110 shadow-lg' : 'text-fuchsia-200 hover:bg-fuchsia-900/30'}`}
              onClick={() => scrollToSection(key)}
              title={label}
            >
              <span className="text-lg md:text-xl">{icon}</span>
              <span className="text-[0.7rem] font-semibold tracking-wide" style={{letterSpacing: '0.01em'}}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentRecommender; 

<style>{`
  .section-glow-divider {
    width: 100%;
    height: 12px;
    margin: 36px 0 24px 0;
    border-radius: 8px;
    background: linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #f472b6 100%);
    filter: blur(6px) brightness(1.2);
    opacity: 0.7;
    animation: sectionGlowShift 8s linear infinite;
  }
  @keyframes sectionGlowShift {
    0% { filter: blur(6px) brightness(1.2) hue-rotate(0deg); }
    100% { filter: blur(6px) brightness(1.2) hue-rotate(360deg); }
  }
`}</style> 
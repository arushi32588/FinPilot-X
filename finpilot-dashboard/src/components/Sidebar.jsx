import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaChartPie, FaPiggyBank, FaBook, FaUser, FaSignInAlt, FaSignOutAlt, FaLightbulb, FaBullseye, FaChartLine, FaWallet, FaRocket, FaBars } from 'react-icons/fa';

const navItems = [
  { to: '/', label: 'Home', icon: <FaHome /> },
  { to: '/income/summary', label: 'Income', icon: <FaWallet />, dropdown: [
    { to: '/income/analyzer', label: 'Income Analyzer' }
  ] },
  { to: '/transactions', label: 'Transactions', icon: <FaChartPie />, dropdown: [
    { to: '/transactions/classifier', label: 'Spending Classifier' }
  ] },
<<<<<<< HEAD
  { to: '/goals', label: 'Goals', icon: <FaBullseye />, dropdown: [
    { to: '/goals', label: 'Goal Planner' }
  ] },
=======
  { to: '/goals', label: 'Goals', icon: <FaBullseye /> },
>>>>>>> origin/master
  { to: '/investments', label: 'Investments', icon: <FaPiggyBank /> },
  { to: '/library', label: 'Library', icon: <FaBook /> },
  { to: '/explainer', label: 'Explainer', icon: <FaLightbulb /> },
];

function getActiveIndex(path, items) {
  return items.findIndex(item => path.startsWith(item.to));
}

const TopNav = () => {
  const [iconOnly, setIconOnly] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const path = window.location.pathname;
  const activeIdx = getActiveIndex(path, navItems);

  return (
    <>
      {/* Ambient SVG Layer */}
      <div className="fixed top-0 left-0 w-full h-32 z-40 pointer-events-none select-none">
        <svg className="absolute w-full h-full" viewBox="0 0 1440 100"><polyline points="0,80 400,40 800,90 1200,20 1440,60" fill="none" stroke="#a21caf" strokeWidth="6" strokeDasharray="12 8" opacity="0.12" /></svg>
        <svg className="absolute w-full h-full" viewBox="0 0 1440 100"><polyline points="0,60 300,20 700,80 1100,30 1440,90" fill="none" stroke="#818cf8" strokeWidth="6" strokeDasharray="10 10" opacity="0.08" /></svg>
      </div>
      {/* Floating, pill-shaped, glassy nav bar */}
      <nav className="fixed top-6 left-1/2 z-50" style={{transform: 'translateX(-50%)', pointerEvents: 'none', width: '100%', maxWidth: 900}}>
        <div className="relative flex items-center justify-center px-4 py-0 w-full" style={{pointerEvents: 'auto'}}>
          <div className="absolute left-0 right-0 top-0 h-full z-0 rounded-full bg-gradient-to-r from-indigo-900/80 via-fuchsia-900/80 to-indigo-900/80 border border-fuchsia-500/30 shadow-2xl backdrop-blur-2xl" style={{height: 68, filter: 'blur(2px)', borderBottom: '3px solid #d946ef', borderTop: 'none'}} />
          <div className="relative flex items-center justify-center w-full h-[68px] px-6" style={{borderRadius: 40, minWidth: 0}}>
            {/* Icon-only mode toggle */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background-glass/80 border border-white/10 shadow-md rounded-full p-2 flex items-center justify-center hover:scale-110 transition-all"
              title={iconOnly ? 'Show labels' : 'Icon-only mode'}
              onClick={() => setIconOnly(v => !v)}
              style={{backdropFilter: 'blur(8px)'}}
            >
              <FaBars className="text-fuchsia-400 text-lg" />
            </button>
            {/* Nav Items */}
            <div className={`relative flex items-center justify-center mx-auto gap-0`} style={{minWidth: 0}}>
              {/* Smart highlight indicator (glowing blob) */}
              <div
                className="absolute top-1/2 left-0 h-12 w-20 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 blur-lg opacity-60 transition-all duration-300"
                style={{
                  transform: `translateY(-50%) translateX(${activeIdx * (iconOnly ? 48 : 110)}px) scaleX(${iconOnly ? 0.7 : 1})`,
                  zIndex: 1,
                  boxShadow: '0 0 24px 8px #d946ef66',
                  transition: 'transform 0.4s cubic-bezier(.4,0,.2,1), width 0.3s',
                  width: iconOnly ? 48 : 110
                }}
              />
<<<<<<< HEAD
              {navItems.map((item) => (
=======
              {navItems.map((item, idx) => (
>>>>>>> origin/master
                <div key={item.to} className="relative group/navitem">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `relative flex items-center gap-1 px-3 py-2 rounded-full font-medium transition-all duration-150 text-gray-200 hover:text-fuchsia-400 hover:scale-110 focus:outline-none ${
                        isActive ? 'text-fuchsia-400' : ''
                      } ${iconOnly ? 'justify-center' : ''}`
                    }
                    end
                    style={{minWidth: iconOnly ? 48 : 110, justifyContent: 'center'}}
                  >
                    <span
                      className={
                        iconOnly
                          ? 'text-lg md:text-xl'
                          : 'text-sm md:text-base'
                      }
                      style={{
                        filter: 'drop-shadow(0 0 4px #a21caf88)',
                        fontSize: iconOnly ? '1.15rem' : '0.9rem',
                        transition: 'font-size 0.2s',
                      }}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`relative font-semibold transition-all duration-300 ${iconOnly ? 'max-w-0 opacity-0 group-hover/navitem:max-w-[60px] group-hover/navitem:opacity-100 group-hover/navitem:pl-1 overflow-hidden' : ''}`}
                      style={{
                        fontSize: iconOnly ? '0.01rem' : '0.62rem',
                        letterSpacing: '0.01em',
                        paddingLeft: iconOnly ? 0 : 2,
                        transition: 'font-size 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                      <span className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </span>
                    {/* Animated underline on hover/active */}
                    <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full transition-all duration-300 scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100" />
                  </NavLink>
                  {/* Tooltip always visible on hover */}
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 rounded-lg bg-background-glass/90 text-xs text-fuchsia-200 shadow-lg border border-fuchsia-400/30 opacity-0 group-hover/navitem:opacity-100 transition-all duration-200 z-50 whitespace-nowrap" style={{backdropFilter: 'blur(8px)'}}>
                    {item.label}
                  </span>
                  {/* Dropdown for Income */}
                  {item.dropdown && (
                    <div className="absolute left-0 top-full mt-2 min-w-[160px] z-50 opacity-0 group-hover/navitem:opacity-100 group-hover/navitem:translate-y-0 pointer-events-none group-hover/navitem:pointer-events-auto transition-all duration-300 translate-y-2">
                      <div className="rounded-xl bg-background-glass/90 border border-fuchsia-400/30 shadow-xl backdrop-blur-xl py-2 px-3 flex flex-col gap-1 animate-dropdown-glass">
                        {item.dropdown.map((drop) => (
                          <NavLink
                            key={drop.to}
                            to={drop.to}
                            className={({ isActive }) =>
                              `block px-3 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-150 text-gray-200 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 focus:outline-none ${
                                isActive ? 'text-fuchsia-400 bg-fuchsia-500/10' : ''
                              }`
                            }
                          >
                            {drop.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* AI Pilot Button */}
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-tr from-fuchsia-500 to-indigo-500 shadow-lg rounded-full p-2 flex items-center justify-center animate-pilot-pulse border-2 border-fuchsia-400/40 hover:scale-110 transition-all"
              title="Ask FinPilot AI"
              onClick={() => setAiOpen(true)}
              style={{backdropFilter: 'blur(8px)'}}
            >
              <FaRocket className="text-white text-lg" />
              <span className="sr-only">Ask FinPilot AI</span>
            </button>
          </div>
        </div>
      </nav>
      {/* AI Modal Placeholder */}
      {aiOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60" onClick={() => setAiOpen(false)}>
          <div className="bg-background-glass/90 rounded-2xl p-8 shadow-2xl border border-fuchsia-400/30 max-w-md w-full text-center relative" onClick={e => e.stopPropagation()}>
            <FaRocket className="mx-auto text-fuchsia-400 text-4xl mb-4 animate-pilot-pulse" />
            <h2 className="text-xl font-bold mb-2 text-fuchsia-200">FinPilot AI</h2>
            <p className="text-gray-300 mb-4">AI insights and search coming soon!</p>
            <button className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-500 text-white font-semibold shadow-lg border border-fuchsia-400/40 hover:scale-105 transition-all duration-200" onClick={() => setAiOpen(false)}>Close</button>
          </div>
        </div>
      )}
      <style>{`
        .animate-dropdown-glass {
          box-shadow: 0 8px 32px 0 #a21caf44, 0 0 0 2px #d946ef33 inset;
          border: 1.5px solid #a21caf33;
          animation: dropdown-fade 0.3s cubic-bezier(.4,0,.2,1);
        }
        @keyframes dropdown-fade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }
        .animate-pilot-pulse {
          animation: pilot-pulse 1.6s infinite alternate;
        }
        @keyframes pilot-pulse {
          0% { box-shadow: 0 0 0 0 #d946ef55, 0 0 16px 4px #a21caf22; }
          100% { box-shadow: 0 0 24px 8px #a21caf66, 0 0 48px 16px #d946ef33; }
        }
      `}</style>
    </>
  );
};

export default TopNav;
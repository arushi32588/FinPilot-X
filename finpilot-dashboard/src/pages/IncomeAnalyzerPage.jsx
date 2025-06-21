import React from 'react';
import IncomeAnalyzer from '../components/IncomeAnalyzer';

const IncomeAnalyzerPage = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#18181b]">
      {/* Fluid Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-fluid-bg" style={{background: 'linear-gradient(120deg, #18181b 0%, #2e1065 50%, #818cf8 100%)', backgroundSize: '200% 200%'}} />
      {/* Ambient SVG Layer */}
      <svg className="absolute top-0 left-0 w-full h-32 opacity-20 pointer-events-none select-none" viewBox="0 0 1440 100"><polyline points="0,80 400,40 800,90 1200,20 1440,60" fill="none" stroke="#a21caf" strokeWidth="6" strokeDasharray="12 8" /></svg>
      <div className="relative z-10 w-full max-w-4xl px-4 py-10 flex flex-col items-center">
        <IncomeAnalyzer />
      </div>
      <style>{`
        @keyframes fluid-bg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fluid-bg {
          animation: fluid-bg 16s ease-in-out infinite;
        }
        @keyframes logo-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-logo-gradient {
          background-size: 200% 200%;
          animation: logo-gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default IncomeAnalyzerPage; 
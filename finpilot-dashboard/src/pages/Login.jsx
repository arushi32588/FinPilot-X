import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#18181b]">
      {/* Fluid Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-fluid-bg" style={{background: 'linear-gradient(120deg, #18181b 0%, #2e1065 50%, #818cf8 100%)', backgroundSize: '200% 200%'}} />
      {/* Ambient SVG Layer */}
      <svg className="absolute top-0 left-0 w-full h-32 opacity-20 pointer-events-none select-none" viewBox="0 0 1440 100"><polyline points="0,80 400,40 800,90 1200,20 1440,60" fill="none" stroke="#a21caf" strokeWidth="6" strokeDasharray="12 8" /></svg>
      {/* Glassmorphic Card */}
      <form onSubmit={handleSubmit} className="relative z-10 bg-background-glass/90 border-2 border-fuchsia-500/40 shadow-2xl backdrop-blur-2xl px-8 py-10 w-full max-w-md flex flex-col items-center" style={{
        borderRadius: '2.5rem 1.5rem 2.5rem 1.5rem / 2rem 2.5rem 1.5rem 2.5rem',
        boxShadow: '0 8px 32px 0 #a21caf44, 0 0 0 2px #d946ef33 inset',
        background: 'rgba(36,33,44,0.92)',
      }}>
        {/* Logo/Heading */}
        <span className="text-3xl font-extrabold tracking-wide animate-logo-gradient bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6 select-none" style={{
          textShadow: '0 0 12px #d946ef, 0 0 32px #a21caf',
          letterSpacing: '0.04em',
          backgroundSize: '200% 200%',
          animation: 'logo-gradient 3s linear infinite',
        }}>
          FinPilot X
        </span>
        <h2 className="text-xl font-bold mb-2 text-fuchsia-200">Sign in to your account</h2>
        {/* Email Input */}
        <div className="w-full mb-4 relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3 rounded-full bg-background-glass/70 border border-fuchsia-400/20 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-base shadow-inner placeholder:text-fuchsia-200/60"
            style={{backdropFilter: 'blur(8px)'}}
          />
        </div>
        {/* Password Input */}
        <div className="w-full mb-4 relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3 rounded-full bg-background-glass/70 border border-fuchsia-400/20 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-base shadow-inner placeholder:text-fuchsia-200/60"
            style={{backdropFilter: 'blur(8px)'}}
          />
        </div>
        {/* Error Message */}
        {error && <div className="w-full mb-2 text-center text-fuchsia-300 bg-fuchsia-900/30 rounded-xl py-2 px-4 animate-fadein" style={{fontSize: '0.95rem'}}>{error}</div>}
        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-fuchsia-600 to-indigo-500 border-2 border-fuchsia-400/40 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 text-white focus:outline-none focus:ring-4 focus:ring-fuchsia-400/50 animate-pulse-glow"
          style={{letterSpacing: '0.03em'}}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="w-full text-center mt-4 text-fuchsia-200">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="underline hover:text-fuchsia-400 transition-all">Register</Link>
        </div>
      </form>
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
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2.2s infinite;
        }
        .animate-fadein {
          animation: fadein 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

export default Login; 
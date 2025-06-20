import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const ORBIT_PARTICLE_COUNT = 12;
const ORBIT_RADIUS = 80; // px
const ORBIT_DURATION = 4; // seconds

const GalaxyLoader = ({ overlay = false }) => {
  // Particle options for a galaxy/starfield effect
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const options = {
    background: {
      color: {
        value: '#0b0c10',
      },
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          area: 900,
        },
      },
      color: {
        value: ['#a78bfa', '#38bdf8', '#818cf8', '#f472b6', '#6366f1'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: true,
          speed: 0.3,
          opacity_min: 0.2,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: 2.5 },
        random: true,
        anim: {
          enable: true,
          speed: 1.2,
          size_min: 0.5,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 0.3,
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'out',
        },
        attract: {
          enable: true,
          rotateX: 800,
          rotateY: 1600,
        },
      },
      links: {
        enable: false,
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: false,
        },
        onClick: {
          enable: false,
        },
        resize: true,
      },
    },
    detectRetina: true,
  };

  // Orbiting particles (custom, not tsParticles)
  const orbitParticles = Array.from({ length: ORBIT_PARTICLE_COUNT }).map((_, i) => {
    const angle = (2 * Math.PI * i) / ORBIT_PARTICLE_COUNT;
    const delay = (ORBIT_DURATION * i) / ORBIT_PARTICLE_COUNT;
    return (
      <div
        key={i}
        className="absolute left-1/2 top-1/2"
        style={{
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          transform: `rotate(${(angle * 180) / Math.PI}deg) translateY(-${ORBIT_RADIUS}px)`,
          animation: `orbit ${ORBIT_DURATION}s linear infinite`,
          animationDelay: `-${delay}s`,
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 via-fuchsia-400 to-indigo-400 opacity-80 shadow-lg" />
      </div>
    );
  });

  // Use absolute overlay if overlay prop is true, else fixed full screen
  const containerClass = overlay
    ? 'absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0b0c10cc] rounded-3xl'
    : 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0c10]';

  return (
    <div className={containerClass}>
      <Particles
        id="galaxy-loader"
        init={particlesInit}
        options={options}
        className="absolute inset-0 w-full h-full z-0 rounded-3xl"
      />
      {/* Glowing, animated orb with orbiting particles */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        {/* Animated orb */}
        <div className="relative flex items-center justify-center">
          <div className="w-36 h-36 rounded-full animate-orb-pulse bg-gradient-to-br from-fuchsia-400 via-blue-400 to-indigo-400 animate-gradient-shift shadow-2xl opacity-90" style={{ filter: 'blur(16px)' }} />
          <div className="w-20 h-20 rounded-full bg-white/80 blur-xl opacity-60 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-orb-inner-pulse" />
          {/* Orbiting particles */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {orbitParticles}
          </div>
        </div>
      </div>
      <div className="relative z-20 flex flex-col items-center mt-64">
        <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent animate-gradient-text mb-2">Launching your investment multiverse...</span>
        <span className="text-lg text-fuchsia-200 font-medium tracking-wide animate-fade-in-slow">Our AI is clustering the best opportunities for you</span>
      </div>
      {/* Custom keyframes for orb and orbit */}
      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg) translateY(-${ORBIT_RADIUS}px) rotate(0deg); }
          100% { transform: rotate(360deg) translateY(-${ORBIT_RADIUS}px) rotate(-360deg); }
        }
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes orb-inner-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        @keyframes gradient-shift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .animate-orb-pulse {
          animation: orb-pulse 2.2s ease-in-out infinite;
        }
        .animate-orb-inner-pulse {
          animation: orb-inner-pulse 2.2s ease-in-out infinite;
        }
        .animate-gradient-shift {
          animation: gradient-shift 6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GalaxyLoader; 
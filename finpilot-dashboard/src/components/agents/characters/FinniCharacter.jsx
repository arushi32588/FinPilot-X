import { motion } from "framer-motion";

const FinniCharacter = () => (
  <motion.svg 
    viewBox="0 0 120 120" 
    width={120} 
    height={120} 
    initial={{ scale: 0.95 }} 
    animate={{ scale: 1 }} 
    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
  >
    <defs>
      <linearGradient id="finniGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A34DFF" />
        <stop offset="100%" stopColor="#FF69C6" />
      </linearGradient>
      <radialGradient id="finniGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#FFB6C1" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Soft glow behind */}
    <circle cx="60" cy="60" r="55" fill="url(#finniGlow)" opacity="0.6" />
    
    {/* Main body - cute rounded shape */}
    <ellipse cx="60" cy="65" rx="45" ry="50" fill="url(#finniGrad)" stroke="#8B5CF6" strokeWidth="2" />
    
    {/* Tiny house hat */}
    <path d="M40 25 L60 10 L80 25 L75 35 L45 35 Z" fill="#5D2CFF" stroke="#4C1D95" strokeWidth="1" />
    <rect x="50" y="30" width="20" height="8" fill="#5D2CFF" stroke="#4C1D95" strokeWidth="1" />
    <rect x="55" y="32" width="10" height="6" fill="#A78BFA" />
    <circle cx="60" y="35" r="2" fill="#FFD700" />
    
    {/* Big adorable eyes */}
    <circle cx="45" cy="55" r="8" fill="white" stroke="#8B5CF6" strokeWidth="1" />
    <circle cx="75" cy="55" r="8" fill="white" stroke="#8B5CF6" strokeWidth="1" />
    <circle cx="45" cy="55" r="5" fill="#1F2937" />
    <circle cx="75" cy="55" r="5" fill="#1F2937" />
    <circle cx="43" cy="53" r="2" fill="white" />
    <circle cx="73" cy="53" r="2" fill="white" />
    
    {/* Cute blush */}
    <circle cx="35" cy="60" r="4" fill="#FFB6C1" opacity="0.7" />
    <circle cx="85" cy="60" r="4" fill="#FFB6C1" opacity="0.7" />
    
    {/* Sweet smile */}
    <path d="M40 75 Q60 85 80 75" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
    
    {/* Arms */}
    <ellipse cx="25" cy="70" rx="6" ry="12" fill="url(#finniGrad)" transform="rotate(-25 25 70)" />
    <ellipse cx="95" cy="70" rx="6" ry="12" fill="url(#finniGrad)" transform="rotate(25 95 70)" />
    
    {/* Hands */}
    <circle cx="18" cy="65" r="4" fill="#C4B5FD" />
    <circle cx="102" cy="65" r="4" fill="#C4B5FD" />
    
    {/* Legs */}
    <ellipse cx="45" cy="108" rx="4" ry="8" fill="url(#finniGrad)" />
    <ellipse cx="75" cy="108" rx="4" ry="8" fill="url(#finniGrad)" />
    
    {/* Feet */}
    <ellipse cx="45" cy="115" rx="5" ry="2.5" fill="#C4B5FD" />
    <ellipse cx="75" cy="115" rx="5" ry="2.5" fill="#C4B5FD" />
    
    {/* Sparkles */}
    <motion.circle 
      cx="20" cy="30" r="2" fill="#FFD700" 
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle 
      cx="100" cy="25" r="1.5" fill="#FFD700" 
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
  </motion.svg>
);

export default FinniCharacter; 
import { motion } from "framer-motion";

const GoaliCharacter = () => (
  <motion.svg 
    viewBox="0 0 120 120" 
    width={120} 
    height={120} 
    animate={{ rotate: [0, 1, -1, 0] }} 
    transition={{ duration: 2, repeat: Infinity }}
  >
    <defs>
      <radialGradient id="goaliGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#98FB98" />
        <stop offset="100%" stopColor="#90EE90" />
      </radialGradient>
      <radialGradient id="goaliGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#98FB98" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#98FB98" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Soft glow behind */}
    <circle cx="60" cy="60" r="55" fill="url(#goaliGlow)" opacity="0.5" />
    
    {/* Main body - super cute round shape */}
    <circle cx="60" cy="70" r="40" fill="url(#goaliGrad)" stroke="#7CB342" strokeWidth="2" />
    
    {/* Cute little head */}
    <circle cx="60" cy="45" r="25" fill="url(#goaliGrad)" stroke="#7CB342" strokeWidth="2" />
    
    {/* Adorable headband with bow */}
    <rect x="40" y="25" width="40" height="6" fill="#4CAF50" stroke="#388E3C" strokeWidth="1" rx="3" />
    <circle cx="45" y="28" r="1.5" fill="#66BB6A" />
    <circle cx="55" y="28" r="1.5" fill="#66BB6A" />
    <circle cx="65" y="28" r="1.5" fill="#66BB6A" />
    <circle cx="75" y="28" r="1.5" fill="#66BB6A" />
    
    {/* Cute bow on headband */}
    <ellipse cx="60" y="22" rx="8" ry="4" fill="#FF6B9D" />
    <circle cx="56" y="20" r="2" fill="#FF6B9D" />
    <circle cx="64" y="20" r="2" fill="#FF6B9D" />
    
    {/* Big sparkly eyes */}
    <circle cx="50" cy="40" r="6" fill="white" stroke="#7CB342" strokeWidth="1" />
    <circle cx="70" cy="40" r="6" fill="white" stroke="#7CB342" strokeWidth="1" />
    <circle cx="50" cy="40" r="3" fill="#1F2937" />
    <circle cx="70" cy="40" r="3" fill="#1F2937" />
    <circle cx="48" cy="38" r="1.5" fill="white" />
    <circle cx="68" cy="38" r="1.5" fill="white" />
    
    {/* Cute blush */}
    <circle cx="40" cy="45" r="3" fill="#FFB6C1" opacity="0.8" />
    <circle cx="80" cy="45" r="3" fill="#FFB6C1" opacity="0.8" />
    
    {/* Sweet smile */}
    <path d="M45 50 Q60 58 75 50" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
    
    {/* Arms */}
    <ellipse cx="25" cy="75" rx="4" ry="8" fill="url(#goaliGrad)" transform="rotate(-30 25 75)" />
    <ellipse cx="95" cy="75" rx="4" ry="8" fill="url(#goaliGrad)" transform="rotate(30 95 75)" />
    
    {/* Hands */}
    <circle cx="18" cy="70" r="2.5" fill="#A5D6A7" />
    <circle cx="102" cy="70" r="2.5" fill="#A5D6A7" />
    
    {/* Legs */}
    <ellipse cx="50" cy="108" rx="3" ry="6" fill="url(#goaliGrad)" />
    <ellipse cx="70" cy="108" rx="3" ry="6" fill="url(#goaliGrad)" />
    
    {/* Feet */}
    <ellipse cx="50" cy="115" rx="4" ry="2" fill="#A5D6A7" />
    <ellipse cx="70" cy="115" rx="4" ry="2" fill="#A5D6A7" />
    
    {/* Tiny goal target on belly */}
    <circle cx="60" cy="70" r="15" fill="white" stroke="#1F2937" strokeWidth="1" />
    <circle cx="60" cy="70" r="10" fill="#FF6B9D" stroke="#1F2937" strokeWidth="1" />
    <circle cx="60" cy="70" r="5" fill="white" stroke="#1F2937" strokeWidth="1" />
    <circle cx="60" cy="70" r="2" fill="#4CAF50" />
    
    {/* Floating sparkles */}
    <motion.circle 
      cx="25" cy="20" r="2" fill="#FFD700" 
      animate={{ y: [0, -8, 0], scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle 
      cx="95" cy="15" r="1.5" fill="#FF6B9D" 
      animate={{ y: [0, -6, 0], scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
    <motion.circle 
      cx="20" cy="35" r="1" fill="#4CAF50" 
      animate={{ y: [0, -4, 0], scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
    />
  </motion.svg>
);

export default GoaliCharacter; 
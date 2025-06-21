import { motion } from "framer-motion";

const InvestoCharacter = () => (
  <motion.svg 
    viewBox="0 0 120 120" 
    width={120} 
    height={120} 
    animate={{ rotate: [0, 1, -1, 0] }} 
    transition={{ duration: 2, repeat: Infinity }}
  >
    <defs>
      <linearGradient id="investoGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <radialGradient id="investoGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Soft glow behind */}
    <circle cx="60" cy="60" r="55" fill="url(#investoGlow)" opacity="0.5" />
    
    {/* Main body - professional round shape */}
    <circle cx="60" cy="65" r="45" fill="url(#investoGrad)" stroke="#4F46E5" strokeWidth="2" />
    
    {/* Cute business hat */}
    <rect x="35" y="25" width="50" height="12" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1" rx="6" />
    <rect x="40" y="20" width="40" height="8" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1" rx="4" />
    <circle cx="60" y="24" r="2" fill="#FBBF24" />
    
    {/* Smart glasses */}
    <circle cx="45" cy="55" r="8" fill="white" stroke="#4F46E5" strokeWidth="1" />
    <circle cx="75" cy="55" r="8" fill="white" stroke="#4F46E5" strokeWidth="1" />
    <rect x="53" y="55" width="14" height="2" fill="#4F46E5" />
    <circle cx="45" cy="55" r="4" fill="#1F2937" />
    <circle cx="75" cy="55" r="4" fill="#1F2937" />
    <circle cx="43" cy="53" r="1.5" fill="white" />
    <circle cx="73" cy="53" r="1.5" fill="white" />
    
    {/* Confident smile */}
    <path d="M45 75 Q60 85 75 75" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    
    {/* Arms */}
    <ellipse cx="25" cy="70" rx="5" ry="10" fill="url(#investoGrad)" transform="rotate(-20 25 70)" />
    <ellipse cx="95" cy="70" rx="5" ry="10" fill="url(#investoGrad)" transform="rotate(20 95 70)" />
    
    {/* Hands */}
    <circle cx="18" cy="65" r="3" fill="#93C5FD" />
    <circle cx="102" cy="65" r="3" fill="#93C5FD" />
    
    {/* Legs */}
    <ellipse cx="45" cy="108" rx="4" ry="8" fill="url(#investoGrad)" />
    <ellipse cx="75" cy="108" rx="4" ry="8" fill="url(#investoGrad)" />
    
    {/* Feet */}
    <ellipse cx="45" cy="115" rx="5" ry="2.5" fill="#93C5FD" />
    <ellipse cx="75" cy="115" rx="5" ry="2.5" fill="#93C5FD" />
    
    {/* Stock chart on belly */}
    <rect x="45" y="60" width="30" height="15" fill="white" stroke="#1F2937" strokeWidth="1" rx="2" />
    <path d="M45 70 L50 65 L55 68 L60 62 L65 66 L70 64 L75 67" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="50" cy="65" r="1" fill="#10B981" />
    <circle cx="55" cy="68" r="1" fill="#10B981" />
    <circle cx="60" cy="62" r="1" fill="#10B981" />
    <circle cx="65" cy="66" r="1" fill="#10B981" />
    <circle cx="70" cy="64" r="1" fill="#10B981" />
    <circle cx="75" cy="67" r="1" fill="#10B981" />
    
    {/* Floating coins */}
    <motion.circle 
      cx="20" cy="30" r="3" fill="#FBBF24" 
      animate={{ y: [0, -5, 0], rotate: [0, 180, 360] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle 
      cx="100" cy="25" r="2.5" fill="#FBBF24" 
      animate={{ y: [0, -4, 0], rotate: [0, 180, 360] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
    <motion.circle 
      cx="15" cy="45" r="2" fill="#FBBF24" 
      animate={{ y: [0, -3, 0], rotate: [0, 180, 360] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
    />
  </motion.svg>
);

export default InvestoCharacter; 
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FinniCharacter from "./characters/FinniCharacter";
import GoaliCharacter from "./characters/GoaliCharacter";
import InvestoCharacter from "./characters/InvestoCharacter";

const agents = [
  {
    id: "finni",
    name: "Finni",
    role: "Home Agent",
    mascot: <FinniCharacter />, // SVG mascot with built-in breathing animation
    color: "from-purple-400 to-pink-500",
    message:
      "Hi there! I'm Finni 🏠 — your guide through FinPilot X. Let me introduce you to my friends!",
  },
  {
    id: "goali",
    name: "Goali",
    role: "Goal Agent",
    mascot: <GoaliCharacter />, // SVG mascot with built-in rotation animation
    color: "from-teal-300 to-cyan-400",
    message:
      "Hi! I'm Goali 🎯 — here to help you set and achieve your financial goals!",
  },
  {
    id: "investo",
    name: "Investo",
    role: "Investment Agent",
    mascot: <InvestoCharacter />, // SVG mascot with built-in floating animation
    color: "from-indigo-300 to-blue-500",
    message:
      "Hello! I'm Investo 📈 — ready to craft your ideal portfolio.",
  },
];

const Agent = ({ agent, onClick, isActive }) => {
  return (
    <motion.div
      className={`rounded-full bg-gradient-to-br ${agent.color} shadow-lg p-2 w-24 h-24 flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition-all border-4 ${isActive ? "border-white/80" : "border-transparent"}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 0.8, delay: agent.id === "finni" ? 0 : agent.id === "goali" ? 0.2 : 0.4 }}
      onClick={() => onClick(agent)}
      style={{ boxShadow: isActive ? "0 0 32px 0 rgba(203,94,255,0.25)" : undefined }}
    >
      <div className="w-14 h-14 flex items-center justify-center mb-1">
        {agent.mascot}
      </div>
      <div className="text-xs text-white font-bold drop-shadow-lg">{agent.name}</div>
    </motion.div>
  );
};

export default function AgentDock() {
  const [activeAgent, setActiveAgent] = useState(agents[0]);
  const [showSpeech, setShowSpeech] = useState(true);

  useEffect(() => {
    setShowSpeech(true);
    const timeout = setTimeout(() => setShowSpeech(false), 8000);
    return () => clearTimeout(timeout);
  }, [activeAgent]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-4">
      {showSpeech && (
        <motion.div
          className="bg-white/20 text-white backdrop-blur-md p-4 rounded-2xl max-w-xs shadow-2xl border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium drop-shadow-lg">{activeAgent.message}</p>
        </motion.div>
      )}

      <div className="flex gap-4">
        {agents.map((agent) => (
          <Agent key={agent.id} agent={agent} onClick={setActiveAgent} isActive={activeAgent.id === agent.id} />
        ))}
      </div>
    </div>
  );
} 
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import FinniCharacter from "./FinniCharacter";
import GoaliCharacter from "./GoaliCharacter";
import InvestoCharacter from "./InvestoCharacter";

const agentData = [
  {
    id: "finni",
    name: "Finni",
    role: "Home Agent",
    color: "bg-gradient-to-br from-purple-400 to-pink-500",
    message:
      "Hi there! I'm Finni 🏠 — your guide through FinPilot X. Let me introduce you to my friends!",
    animation: {
      scale: [1, 1.05, 0.98, 1],
      rotate: [0, 2, -2, 0],
      y: [0, -12, 0],
    },
    character: FinniCharacter,
  },
  {
    id: "goali",
    name: "Goali",
    role: "Goal Agent",
    color: "bg-gradient-to-br from-green-300 to-emerald-400",
    message:
      "Hi! I'm Goali 🎯 — here to help you set and achieve your financial goals!",
    animation: {
      y: [0, -15, 0],
      scale: [1, 1.08, 0.95, 1],
      rotate: [0, 1, -1, 0],
    },
    character: GoaliCharacter,
  },
  {
    id: "investo",
    name: "Investo",
    role: "Investment Agent",
    color: "bg-gradient-to-br from-indigo-300 to-blue-500",
    message:
      "Hello! I'm Investo 📈 — ready to craft your ideal portfolio.",
    animation: {
      x: [0, 3, -3, 0],
      rotate: [0, 1, -1, 0],
      y: [0, -10, 0],
    },
    character: InvestoCharacter,
  },
];

const AgentFigurine = ({ agent, onClick, isActive, isWaving, currentMessage, introStep, hasIntroduced }) => {
  const CharacterComponent = agent.character;
  
  // Debug logging
  console.log(`Agent ${agent.id}:`, {
    isActive,
    isWaving,
    introStep,
    hasIntroduced,
    currentMessage
  });
  
  const handleClick = () => {
    console.log(`Agent ${agent.id} clicked!`);
    onClick(agent);
  };
  
  return (
    <motion.div
      className={`w-12 h-12 flex items-center justify-center cursor-pointer relative`} 
      animate={{
        y: [0, -2, 0],
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      onClick={handleClick}
      whileHover={{ 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Waving Hand - appears when agent is waving */}
      {isWaving && (
        <motion.div
          className="absolute top-0 right-0 text-sm z-50 bg-yellow-400 rounded-full p-0.5 shadow-md"
          initial={{ opacity: 0, scale: 0, x: 10 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: 0,
            rotate: [0, 15, -15, 0]
          }}
          transition={{ 
            duration: 0.6,
            repeat: 3,
            repeatType: "reverse"
          }}
        >
          👋
        </motion.div>
      )}
      
      {CharacterComponent ? (
        <div className="z-10 scale-75">
          <CharacterComponent />
        </div>
      ) : (
        <div className="z-10 text-xs">
          {agent.name}
        </div>
      )}
    </motion.div>
  );
};

export default function PixarStyleAgents() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeAgent, setActiveAgent] = useState("finni");
  const [wavingAgent, setWavingAgent] = useState("finni");
  const [currentMessage, setCurrentMessage] = useState("Hi there! I'm Finni 🏠 — your guide through FinPilot X. Let me introduce you to my friends!");
  const [introStep, setIntroStep] = useState(0);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const [pageAgent, setPageAgent] = useState(null);
  const [guidanceStep, setGuidanceStep] = useState(0);

  // Define showNextButton in the main component scope
  const showNextButton = !hasIntroduced && introStep < 3;

  // Guidance messages for each agent
  const goaliGuidance = [
    "Welcome to Goals! 🎯 I'm here to help you set and achieve your financial goals. Let's start by creating your first goal!",
    "Step 1: Think about what you want to achieve. Common goals include saving for a house, emergency fund, or retirement. What's your priority?",
    "Step 2: Set a specific amount and timeline. For example: 'Save $10,000 for emergency fund in 12 months.' Be specific and realistic!",
    "Step 3: Break it down into monthly targets. If you need $10,000 in 12 months, that's about $833 per month. Can you commit to this?",
    "Step 4: Track your progress regularly! I'll help you monitor your goal and adjust if needed. Ready to create your first goal?"
  ];

  const investoGuidance = [
    "Welcome to Investments! 📈 I'm here to help you build your ideal portfolio. Let's analyze your risk profile and create a personalized investment plan!",
    "Step 1: Let's understand your risk tolerance. Are you comfortable with market fluctuations, or do you prefer more stable investments?",
    "Step 2: Consider your investment timeline. Short-term (1-3 years) or long-term (5+ years)? This affects your strategy significantly.",
    "Step 3: Think about your investment amount. Start small and increase gradually. Even $100/month can grow significantly over time!",
    "Step 4: Diversification is key! We'll help you spread your investments across different asset classes to reduce risk. Ready to start?"
  ];

  // Check current page and set page-specific agent
  useEffect(() => {
    if (location.pathname === "/goals") {
      setPageAgent("goali");
      setGuidanceStep(0);
      setCurrentMessage(goaliGuidance[0]);
    } else if (location.pathname === "/investments") {
      setPageAgent("investo");
      setGuidanceStep(0);
      setCurrentMessage(investoGuidance[0]);
    } else {
      setPageAgent(null);
      setGuidanceStep(0);
    }
  }, [location.pathname]);

  // Debug logging for main component
  console.log("Main Component State:", {
    activeAgent,
    wavingAgent,
    currentMessage,
    introStep,
    hasIntroduced,
    showNextButton,
    pageAgent,
    guidanceStep,
    currentPath: location.pathname
  });

  const messages = [
    "Hi there! I'm Finni 🏠 — your guide through FinPilot X. Let me introduce you to my friends!",
    "Hi! I'm Goali 🎯 — here to help you set and achieve your financial goals!",
    "Hello! I'm Investo 📈 — ready to craft your ideal portfolio.",
    "To get started with your goal or investment planning, just click on Goali or Investo!"
  ];

  const introAgents = ["finni", "goali", "investo", "finni"];

  const handleNext = () => {
    console.log("handleNext called, current step:", introStep);
    const nextStep = introStep + 1;
    
    if (nextStep < 3) {
      console.log("Moving to next step:", nextStep);
      setIntroStep(nextStep);
      setActiveAgent(introAgents[nextStep]);
      setWavingAgent(introAgents[nextStep]);
      setCurrentMessage(messages[nextStep]);
    } else {
      console.log("Ending introduction");
      // End introduction
      setWavingAgent(null);
      setActiveAgent(null);
      setCurrentMessage("");
      setHasIntroduced(true);
    }
  };

  const handleGuidanceNext = () => {
    const currentGuidance = pageAgent === "goali" ? goaliGuidance : investoGuidance;
    const nextStep = guidanceStep + 1;
    
    if (nextStep < currentGuidance.length) {
      setGuidanceStep(nextStep);
      setCurrentMessage(currentGuidance[nextStep]);
    }
  };

  const handleGuidancePrev = () => {
    const prevStep = guidanceStep - 1;
    if (prevStep >= 0) {
      setGuidanceStep(prevStep);
      const currentGuidance = pageAgent === "goali" ? goaliGuidance : investoGuidance;
      setCurrentMessage(currentGuidance[prevStep]);
    }
  };

  const handleAgentClick = (agentId) => {
    console.log("Agent clicked:", agentId);
    console.log("Has introduced:", hasIntroduced);
    
    if (hasIntroduced) {
      // Navigation after introduction is complete
      console.log("Attempting navigation for agent:", agentId);
      if (agentId === "goali") {
        console.log("Navigating to /goals");
        navigate("/goals");
      } else if (agentId === "investo") {
        console.log("Navigating to /investments");
        navigate("/investments");
      } else {
        console.log("No navigation for agent:", agentId);
      }
    } else {
      // During introduction, just set as active agent
      console.log("Setting active agent during introduction:", agentId);
      setActiveAgent(agentId);
    }
  };

  // If we're on a specific page, show only that agent with guidance
  if (pageAgent) {
    const agent = agentData.find(a => a.id === pageAgent);
    const currentGuidance = pageAgent === "goali" ? goaliGuidance : investoGuidance;
    const showPrevButton = guidanceStep > 0;
    const showNextButton = guidanceStep < currentGuidance.length - 1;
    
    return (
      <div className="fixed bottom-5 right-2 z-50 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            {/* Page-specific guidance message */}
            <div className="bg-white/20 backdrop-blur-md rounded-lg max-w-48 shadow-lg border border-white/30 p-3">
              <p className="text-white text-xs leading-tight">{currentMessage}</p>
              
              {/* Guidance Navigation Buttons */}
              <div className="flex gap-1 mt-2">
                {showPrevButton && (
                  <button
                    onClick={handleGuidancePrev}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-xs font-bold py-1 px-1.5 rounded transition-all duration-200 border border-white/30 shadow hover:shadow-md transform hover:scale-105"
                  >
                    ← Prev
                  </button>
                )}
                {showNextButton && (
                  <button
                    onClick={handleGuidanceNext}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-bold py-1 px-1.5 rounded transition-all duration-200 border border-white/30 shadow hover:shadow-md transform hover:scale-105"
                  >
                    Next →
                  </button>
                )}
              </div>
              
              {/* Step indicator */}
              <div className="text-center mt-1">
                <span className="text-white/50 text-xs">
                  Step {guidanceStep + 1} of {currentGuidance.length}
                </span>
              </div>
            </div>
            
            {/* Speech Bubble Tail */}
            <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
              <div className="w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-white/20"></div>
            </div>
          </div>
          
          {/* Single Agent Figurine */}
          <AgentFigurine
            agent={agent}
            isActive={true}
            isWaving={true}
            currentMessage={currentMessage}
            onClick={() => {}} // No click action on page-specific agent
            introStep={introStep}
            hasIntroduced={hasIntroduced}
          />
        </div>
      </div>
    );
  }

  // Show all agents for introduction and other pages
  return (
    <div className="fixed bottom-5 right-2 z-50 flex flex-col items-end gap-2">
      {/* Agent Figurines with Dialogue Box */}
      <div className="flex items-center gap-2">
        {agentData.map((agent) => (
          <div key={agent.id} className="flex items-center gap-2">
            {/* Dialogue Box - only show for the active agent */}
            {!hasIntroduced && agent.id === activeAgent && (
              <div className="relative">
                {/* Speech Bubble */}
                <div className="bg-white/20 backdrop-blur-md rounded-lg max-w-32 shadow-lg border border-white/30 p-2">
                  <p className="text-white text-xs leading-tight">{currentMessage}</p>
                  
                  {/* Next Button */}
                  {showNextButton && (
                    <button
                      onClick={handleNext}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-bold py-1 px-1.5 rounded transition-all duration-200 border border-white/30 shadow hover:shadow-md transform hover:scale-105 mt-1.5"
                    >
                      Next →
                    </button>
                  )}
                </div>
                
                {/* Speech Bubble Tail - points to the agent */}
                <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
                  <div className="w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-white/20"></div>
                </div>
              </div>
            )}
            
            {/* Agent Figurine - always visible */}
            <AgentFigurine
              agent={agent}
              isActive={agent.id === activeAgent}
              isWaving={agent.id === wavingAgent}
              currentMessage={currentMessage}
              onClick={() => handleAgentClick(agent.id)}
              introStep={introStep}
              hasIntroduced={hasIntroduced}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 
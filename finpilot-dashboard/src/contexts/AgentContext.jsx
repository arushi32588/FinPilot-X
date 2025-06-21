import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AgentContext = createContext();

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
};

export const AgentProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeAgent, setActiveAgent] = useState('finni');
  const [isIntroducingFriends, setIsIntroducingFriends] = useState(false);
  const [agentStates, setAgentStates] = useState({
    finni: { isVisible: false, isWaving: false },
    goali: { isVisible: false, isWaving: false },
    investo: { isVisible: false, isWaving: false }
  });

  // Determine active agent based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') {
      setActiveAgent('finni');
      setAgentStates(prev => ({
        ...prev,
        finni: { ...prev.finni, isVisible: true },
        goali: { ...prev.goali, isVisible: false },
        investo: { ...prev.investo, isVisible: false }
      }));
    } else if (path === '/goals' || path.includes('goal')) {
      setActiveAgent('goali');
      setAgentStates(prev => ({
        ...prev,
        finni: { ...prev.finni, isVisible: false },
        goali: { ...prev.goali, isVisible: true },
        investo: { ...prev.investo, isVisible: false }
      }));
    } else if (path === '/investments' || path.includes('investment')) {
      setActiveAgent('investo');
      setAgentStates(prev => ({
        ...prev,
        finni: { ...prev.finni, isVisible: false },
        goali: { ...prev.goali, isVisible: false },
        investo: { ...prev.investo, isVisible: true }
      }));
    }
  }, [location.pathname]);

  // Home page introduction sequence
  useEffect(() => {
    if (location.pathname === '/' && !isIntroducingFriends) {
      const timer = setTimeout(() => {
        setIsIntroducingFriends(true);
        // Show Goali and Investo temporarily
        setAgentStates(prev => ({
          ...prev,
          goali: { ...prev.goali, isVisible: true, isWaving: true },
          investo: { ...prev.investo, isVisible: true, isWaving: true }
        }));
        
        // Hide them after 5 seconds
        setTimeout(() => {
          setAgentStates(prev => ({
            ...prev,
            goali: { ...prev.goali, isVisible: false, isWaving: false },
            investo: { ...prev.investo, isVisible: false, isWaving: false }
          }));
          setIsIntroducingFriends(false);
        }, 5000);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isIntroducingFriends]);

  const navigateToAgentPage = (agentName) => {
    const routes = {
      goali: '/goals',
      investo: '/investments',
      finni: '/'
    };
    
    if (routes[agentName]) {
      navigate(routes[agentName]);
    }
  };

  const triggerAgentReaction = (agentName, reaction) => {
    setAgentStates(prev => ({
      ...prev,
      [agentName]: { ...prev[agentName], [reaction]: true }
    }));
    
    // Reset reaction after animation
    setTimeout(() => {
      setAgentStates(prev => ({
        ...prev,
        [agentName]: { ...prev[agentName], [reaction]: false }
      }));
    }, 2000);
  };

  const value = {
    activeAgent,
    agentStates,
    isIntroducingFriends,
    navigateToAgentPage,
    triggerAgentReaction,
    setAgentStates
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}; 
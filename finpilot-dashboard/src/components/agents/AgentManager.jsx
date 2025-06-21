import React, { useState, useEffect } from 'react';
import HomeAgent from './HomeAgent';
import GoalAgent from './GoalAgent';
import InvestmentAgent from './InvestmentAgent';

const AgentManager = ({ currentPage = 'home' }) => {
  const [homeAgentVisible, setHomeAgentVisible] = useState(false);
  const [goalAgentVisible, setGoalAgentVisible] = useState(false);
  const [investmentAgentVisible, setInvestmentAgentVisible] = useState(false);
  const [goalAgentWaving, setGoalAgentWaving] = useState(false);
  const [investmentAgentWaving, setInvestmentAgentWaving] = useState(false);
  const [isIntroducingFriends, setIsIntroducingFriends] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false);

  // Show appropriate agent based on current page
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset all agents first
      setHomeAgentVisible(false);
      setGoalAgentVisible(false);
      setInvestmentAgentVisible(false);
      setGoalAgentWaving(false);
      setInvestmentAgentWaving(false);
      setIsIntroducingFriends(false);

      switch (currentPage) {
        case 'home':
          setHomeAgentVisible(true);
          // Auto-introduce friends if this is the first time
          if (!hasIntroduced) {
            setTimeout(() => {
              handleIntroduceFriends();
              setHasIntroduced(true);
            }, 2000);
          }
          break;
        case 'goals':
          setGoalAgentVisible(true);
          break;
        case 'investments':
          setInvestmentAgentVisible(true);
          break;
        default:
          setHomeAgentVisible(true);
      }
    }, 1000); // Delay to let page load

    return () => clearTimeout(timer);
  }, [currentPage, hasIntroduced]);

  // Handle home agent introducing friends
  const handleIntroduceFriends = () => {
    setIsIntroducingFriends(true);
    
    // Show goal agent with wave (briefly)
    setTimeout(() => {
      setGoalAgentVisible(true);
      setGoalAgentWaving(true);
    }, 500);

    // Show investment agent with wave (briefly)
    setTimeout(() => {
      setInvestmentAgentVisible(true);
      setInvestmentAgentWaving(true);
    }, 1500);

    // Stop waving and hide other agents after 3 seconds
    setTimeout(() => {
      setGoalAgentWaving(false);
      setInvestmentAgentWaving(false);
      setIsIntroducingFriends(false);
      
      // Hide other agents after introduction
      setTimeout(() => {
        setGoalAgentVisible(false);
        setInvestmentAgentVisible(false);
      }, 1000);
    }, 3500);
  };

  // Handle agent calls
  const handleHomeAgentCall = () => {
    // Home agent can call other agents for introduction
    if (currentPage === 'home') {
      handleIntroduceFriends();
    }
  };

  const handleGoalAgentCall = () => {
    // Goal agent can call home agent
    if (currentPage === 'goals') {
      setHomeAgentVisible(true);
    }
  };

  const handleInvestmentAgentCall = () => {
    // Investment agent can call home agent
    if (currentPage === 'investments') {
      setHomeAgentVisible(true);
    }
  };

  return (
    <>
      <HomeAgent
        isVisible={homeAgentVisible}
        onCall={handleHomeAgentCall}
        isCalling={false}
        onIntroduceFriends={isIntroducingFriends}
      />
      
      <GoalAgent
        isVisible={goalAgentVisible}
        onCall={handleGoalAgentCall}
        isCalling={false}
        isWaving={goalAgentWaving}
      />
      
      <InvestmentAgent
        isVisible={investmentAgentVisible}
        onCall={handleInvestmentAgentCall}
        isCalling={false}
        isWaving={investmentAgentWaving}
      />
    </>
  );
};

export default AgentManager; 
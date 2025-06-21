import React from 'react';
import { FaHandPaper } from 'react-icons/fa';
import Agent from './Agent';
import InvestoCharacter from './characters/InvestoCharacter';

const InvestmentAgent = ({ isVisible, messages, onCall, isCalling, isWaving = false }) => {
  const defaultMessages = [
    "Let's craft your perfect portfolio. I ran a few simulations already! 📊",
    "Hey there! I'm Investo! Your investment guru and portfolio optimization expert!",
    "I love analyzing markets, finding great opportunities, and helping you build wealth for the future!",
    "From stocks and bonds to crypto and real estate - I can help you make informed investment decisions! 💰",
    "Ready to grow your money smartly? Let's explore your investment options together! 🚀"
  ];

  return (
    <Agent
      name="Investo"
      character={<InvestoCharacter isTyping={isVisible && !isWaving} />}
      color="bg-gradient-to-br from-blue-500 to-yellow-500"
      messages={messages || defaultMessages}
      isVisible={isVisible}
      onCall={onCall}
      isCalling={isCalling}
      position="center-right"
    >
      {/* Wave animation when being introduced */}
      {isWaving && (
        <div className="absolute -top-4 -right-4 animate-bounce">
          <FaHandPaper className="text-yellow-400 text-xl" />
        </div>
      )}
    </Agent>
  );
};

export default InvestmentAgent; 
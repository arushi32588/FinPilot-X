import React from 'react';
import { FaChartLine, FaHandWave } from 'react-icons/fa';
import Agent from './Agent';

const InvestmentAgent = ({ isVisible, messages, onCall, isCalling, isWaving = false }) => {
  const defaultMessages = [
    "Hey there! I'm Max! 📈 Your investment guru and portfolio optimization expert!",
    "I love analyzing markets, finding great opportunities, and helping you build wealth for the future!",
    "From stocks and bonds to crypto and real estate - I can help you make informed investment decisions! 💰",
    "Ready to grow your money smartly? Let's explore your investment options together! 🚀"
  ];

  return (
    <Agent
      name="Max"
      avatar={<FaChartLine />}
      color="bg-gradient-to-br from-green-500 to-emerald-600"
      messages={messages || defaultMessages}
      isVisible={isVisible}
      onCall={onCall}
      isCalling={isCalling}
      position="bottom-left"
    >
      {/* Wave animation when being introduced */}
      {isWaving && (
        <div className="absolute -top-4 -right-4 animate-bounce">
          <FaHandWave className="text-yellow-400 text-xl" />
        </div>
      )}
    </Agent>
  );
};

export default InvestmentAgent; 
import React from 'react';
import { FaHandPaper } from 'react-icons/fa';
import Agent from './Agent';
import GoaliCharacter from './characters/GoaliCharacter';

const GoalAgent = ({ isVisible, messages, onCall, isCalling, isWaving = false }) => {
  const defaultMessages = [
    "Let's set some fun and realistic goals today, shall we? 🎯",
    "I'm Goali, your goal-setting specialist! I love helping people achieve their dreams!",
    "Whether it's saving for a house, planning a vacation, or building an emergency fund - I've got you covered!",
    "I can help you create SMART goals, track your progress, and celebrate your wins along the way! 🎉",
    "Ready to turn your dreams into achievable goals? Let's get started! 💪"
  ];

  return (
    <Agent
      name="Goali"
      character={<GoaliCharacter isJumping={isVisible && !isWaving} />}
      color="bg-gradient-to-br from-cyan-400 to-emerald-500"
      messages={messages || defaultMessages}
      isVisible={isVisible}
      onCall={onCall}
      isCalling={isCalling}
      position="bottom-left"
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

export default GoalAgent; 
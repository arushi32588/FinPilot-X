import React from 'react';
import { FaBullseye, FaHandWave } from 'react-icons/fa';
import Agent from './Agent';

const GoalAgent = ({ isVisible, messages, onCall, isCalling, isWaving = false }) => {
  const defaultMessages = [
    "Hi! I'm Penny! 🎯 I'm your goal-setting specialist and I love helping people achieve their dreams!",
    "Whether it's saving for a house, planning a vacation, or building an emergency fund - I've got you covered!",
    "I can help you create SMART goals, track your progress, and celebrate your wins along the way! 🎉",
    "Ready to turn your dreams into achievable goals? Let's get started! 💪"
  ];

  return (
    <Agent
      name="Penny"
      avatar={<FaBullseye />}
      color="bg-gradient-to-br from-pink-500 to-red-500"
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

export default GoalAgent; 
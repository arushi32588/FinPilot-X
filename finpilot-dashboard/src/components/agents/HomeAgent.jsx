import React from 'react';
import { FaHome, FaHandWave } from 'react-icons/fa';
import Agent from './Agent';

const HomeAgent = ({ isVisible, messages, onCall, isCalling, onIntroduceFriends }) => {
  const defaultMessages = [
    "Hi there! 👋 I'm Finny, your friendly home assistant! I'm here to help you navigate your financial journey.",
    "Let me introduce you to my amazing friends - they're experts in their fields and can't wait to help you!",
    "Meet Penny the Goal Agent and Max the Investment Agent! They'll pop up to say hello! 👋",
    "To get started with goal planning, just click on Penny (the Goal Agent). For investment advice, click on Max (the Investment Agent)!",
    "We're all here to make your financial journey fun and successful! 🚀"
  ];

  return (
    <Agent
      name="Finny"
      avatar={<FaHome />}
      color="bg-gradient-to-br from-blue-500 to-purple-600"
      messages={messages || defaultMessages}
      isVisible={isVisible}
      onCall={onCall}
      isCalling={isCalling}
      position="bottom-right"
    >
      {/* Wave animation when introducing friends */}
      {onIntroduceFriends && (
        <div className="absolute -top-4 -left-4 animate-bounce">
          <FaHandWave className="text-yellow-400 text-xl" />
        </div>
      )}
    </Agent>
  );
};

export default HomeAgent; 
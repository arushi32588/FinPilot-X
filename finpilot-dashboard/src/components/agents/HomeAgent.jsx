import React from 'react';
import { FaHandPaper } from 'react-icons/fa';
import Agent from './Agent';
import FinniCharacter from './characters/FinniCharacter';

const HomeAgent = ({ isVisible, messages, onCall, isCalling, onIntroduceFriends }) => {
  const defaultMessages = [
    "Hi there! I'm Finni, your finance co-pilot! 👋",
    "Let me introduce you to my awesome friends!",
    "Meet Goali the Goal Agent and Investo the Investment Agent! They'll wave hello! 👋",
    "Just click on either of them to start setting up your goals or planning investments!",
    "We're all here to make your financial journey fun and successful! 🚀"
  ];

  return (
    <Agent
      name="Finni"
      character={<FinniCharacter />}
      color="bg-gradient-to-br from-purple-400 to-blue-500"
      messages={messages || defaultMessages}
      isVisible={isVisible}
      onCall={onCall}
      isCalling={isCalling}
      position="bottom-right"
    >
      {/* Wave animation when introducing friends */}
      {onIntroduceFriends && (
        <div className="absolute -top-4 -left-4 animate-bounce">
          <FaHandPaper className="text-yellow-400 text-xl" />
        </div>
      )}
    </Agent>
  );
};

export default HomeAgent; 
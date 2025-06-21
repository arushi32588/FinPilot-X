import React, { useState, useEffect } from 'react';
import { FaComments, FaTimes, FaPhone, FaPhoneSlash, FaEllipsisH } from 'react-icons/fa';

const Agent = ({ 
  name, 
  character, 
  color, 
  messages, 
  isVisible, 
  onCall, 
  isCalling = false,
  position = 'bottom-right',
  children 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isVisible && messages.length > 0) {
      setShowMessage(true);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
  }, [isVisible, messages]);

  const handleNextMessage = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1500);
    } else {
      setShowMessage(false);
      setCurrentMessageIndex(0);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      case 'center-right':
        return 'top-1/2 right-6 transform -translate-y-1/2';
      case 'center-left':
        return 'top-1/2 left-6 transform -translate-y-1/2';
      default:
        return 'bottom-6 right-6';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 agent-enter`}>
      {/* Agent Figurine */}
      <div className="relative">
        <div 
          className="w-20 h-24 cursor-pointer agent-hover animate-float"
          onClick={() => setShowMessage(true)}
        >
          {/* Agent Body with enhanced glow */}
          <div className={`relative w-full h-full ${color} rounded-full shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25`}>
            {/* Character SVG */}
            <div className="absolute inset-0 flex items-center justify-center">
              {character}
            </div>
            
            {/* Enhanced glow effect on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 blur-xl opacity-0 hover:opacity-100 transition-all duration-500 scale-110"></div>
            
            {/* Pulse animation when calling */}
            {isCalling && (
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
            )}
            
            {/* Call indicator */}
            {isCalling && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <FaPhone className="text-white text-xs" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Message Bubble */}
      {showMessage && (
        <div className="absolute bottom-28 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200/50 speech-bubble-enter">
          {/* Enhanced glow border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-sm -z-10 animate-pulse"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${color} animate-glow`}>
                {name.charAt(0)}
              </div>
              <span className="font-semibold text-gray-800">{name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110">
                <FaEllipsisH />
              </button>
              <button
                onClick={() => setShowMessage(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Message Content */}
          <div className="mb-3">
            {isTyping ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed">
                {messages[currentMessageIndex]}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {onCall && (
                <button
                  onClick={onCall}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                    isCalling 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isCalling ? <FaPhoneSlash /> : <FaPhone />}
                </button>
              )}
            </div>
            
            {currentMessageIndex < messages.length - 1 && (
              <button
                onClick={handleNextMessage}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors hover:scale-105"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Children for additional content */}
      {children}
    </div>
  );
};

export default Agent; 
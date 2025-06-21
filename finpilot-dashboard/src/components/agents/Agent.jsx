import React, { useState, useEffect } from 'react';
import { FaComments, FaTimes, FaPhone, FaPhoneSlash } from 'react-icons/fa';

const Agent = ({ 
  name, 
  avatar, 
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
      default:
        return 'bottom-6 right-6';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Agent Avatar */}
      <div className="relative">
        <div 
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-200 ${color}`}
          onClick={() => setShowMessage(true)}
        >
          {avatar}
        </div>
        
        {/* Pulse animation when calling */}
        {isCalling && (
          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
        )}
        
        {/* Call indicator */}
        {isCalling && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <FaPhone className="text-white text-xs" />
          </div>
        )}
      </div>

      {/* Message Bubble */}
      {showMessage && (
        <div className="absolute bottom-20 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200/50 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${color}`}>
                {avatar}
              </div>
              <span className="font-semibold text-gray-800">{name}</span>
            </div>
            <button
              onClick={() => setShowMessage(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isCalling 
                      ? 'bg-red-500 text-white' 
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
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
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
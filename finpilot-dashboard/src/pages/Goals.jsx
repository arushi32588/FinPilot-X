import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import GoalPlanner from '../components/GoalPlanner';
import GoalTracker from '../components/GoalTracker';
import { FaBullseye, FaPlus, FaList, FaArrowLeft } from 'react-icons/fa';

const Goals = () => {
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('main'); // 'main', 'planner', 'tracker'

  const handleCreateGoal = () => {
    setActiveView('planner');
  };

  const handleTrackProgress = () => {
    setActiveView('tracker');
  };

  const handleBackToMain = () => {
    setActiveView('main');
  };

  if (activeView === 'planner') {
    return (
      <div className="min-h-screen p-6" style={{
        color: isDarkMode ? '#e5e7eb' : '#1f2937'
      }}>
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToMain}
            className="mb-6 flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
          >
            <FaArrowLeft />
            Back to Goals
          </button>
          
          <GoalPlanner />
        </div>
      </div>
    );
  }

  if (activeView === 'tracker') {
    return (
      <div className="min-h-screen p-6" style={{
        color: isDarkMode ? '#e5e7eb' : '#1f2937'
      }}>
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToMain}
            className="mb-6 flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
          >
            <FaArrowLeft />
            Back to Goals
          </button>
          
          <GoalTracker />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            <FaBullseye className="inline mr-3" />
            Financial Goals
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Set, track, and achieve your financial goals with AI-powered planning and personalized insights
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleCreateGoal}
            className="bg-background-glass/80 border border-fuchsia-400/30 rounded-2xl p-6 backdrop-blur-xl hover:bg-background-glass/90 hover:border-fuchsia-400/50 transition-all duration-200 transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full flex items-center justify-center">
                <FaPlus className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create New Goal</h3>
                <p className="text-gray-300">Plan your next financial milestone</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Use our AI-powered goal planner to create personalized savings plans for any financial objective.
            </p>
          </button>

          <button
            onClick={handleTrackProgress}
            className="bg-background-glass/80 border border-indigo-400/30 rounded-2xl p-6 backdrop-blur-xl hover:bg-background-glass/90 hover:border-indigo-400/50 transition-all duration-200 transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                <FaList className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Track Progress</h3>
                <p className="text-gray-300">Monitor your goal achievements</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              View your active goals, track progress, and get insights on how to stay on target.
            </p>
          </button>
        </div>

        {/* Recent Goals Preview */}
        <div className="bg-background-glass/80 border border-gray-400/30 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Goals</h2>
          <p className="text-gray-400">
            Create your first goal to get started! Click "Create New Goal" above to begin planning your financial future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Goals;
  
import React, { useState } from 'react';
import { FaBullseye, FaCalendarAlt, FaMoneyBillWave, FaLightbulb, FaRocket, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const GoalPlanner = () => {
  const [userInput, setUserInput] = useState('');
  const [goalPlan, setGoalPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError('Please enter your financial goal');
      return;
    }

    setIsLoading(true);
    setError('');
    setGoalPlan(null);

    try {
      const response = await fetch('http://localhost:8000/api/goal-planner/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create goal plan');
      }

      const data = await response.json();
      setGoalPlan(data);
      
      // Save the goal to localStorage for tracking
      saveGoalToStorage(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoalToStorage = (goalData) => {
    try {
      const existingGoals = JSON.parse(localStorage.getItem('finpilot_goals') || '[]');
      const newGoal = {
        id: Date.now(),
        goal: goalData.goal,
        goal_type: goalData.goal_type,
        target_amount: goalData.target_amount,
        current_amount: 0, // Start with 0 progress
        deadline: goalData.deadline,
        monthly_plan: goalData.monthly_plan,
        months_remaining: goalData.months_remaining,
        created_at: new Date().toISOString().split('T')[0],
        status: "active"
      };
      
      const updatedGoals = [...existingGoals, newGoal];
      localStorage.setItem('finpilot_goals', JSON.stringify(updatedGoals));
      
      // Show success message
      setTimeout(() => {
        alert('Goal saved! You can track your progress in the Goal Tracker.');
      }, 1000);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const getGoalTypeColor = (goalType) => {
    const colors = {
      travel: 'from-blue-500 to-cyan-500',
      education: 'from-green-500 to-emerald-500',
      emergency: 'from-red-500 to-pink-500',
      luxury: 'from-purple-500 to-fuchsia-500',
      health: 'from-orange-500 to-red-500',
      other: 'from-gray-500 to-slate-500'
    };
    return colors[goalType] || colors.other;
  };

  const getGoalTypeIcon = (goalType) => {
    const icons = {
      travel: '✈️',
      education: '📚',
      emergency: '🆘',
      luxury: '💎',
      health: '🏥',
      other: '🎯'
    };
    return icons[goalType] || icons.other;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          <FaBullseye className="inline mr-3" />
          Goal Planner
        </h2>
        <p className="text-gray-300 text-lg">
          Tell us about your financial goal and we'll create a personalized savings plan
        </p>
      </div>

      {/* Goal Input Form */}
      <div className="bg-background-glass/80 border border-fuchsia-400/30 rounded-2xl p-8 mb-8 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-fuchsia-300 font-semibold mb-3 text-lg">
              Describe Your Financial Goal
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="e.g., I want to save ₹50,000 for a Goa trip by December, or I need ₹100,000 for emergency fund by next June..."
              className="w-full h-32 p-4 rounded-xl bg-background-glass/70 border border-fuchsia-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all resize-none"
              style={{ backdropFilter: 'blur(8px)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Your Plan...
              </>
            ) : (
              <>
                <FaRocket />
                Create Goal Plan
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Goal Plan Results */}
      {goalPlan && (
        <div className="space-y-6">
          {/* Goal Summary Card */}
          <div className="bg-background-glass/80 border border-fuchsia-400/30 rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className={`text-4xl ${getGoalTypeIcon(goalPlan.goal_type)}`}></div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{goalPlan.goal}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getGoalTypeColor(goalPlan.goal_type)} text-white`}>
                  {goalPlan.goal_type.charAt(0).toUpperCase() + goalPlan.goal_type.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <FaMoneyBillWave className="text-3xl text-fuchsia-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">₹{goalPlan.target_amount.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Target Amount</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <FaCalendarAlt className="text-3xl text-indigo-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{goalPlan.months_remaining}</div>
                <div className="text-gray-300 text-sm">Months Remaining</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <FaCheckCircle className="text-3xl text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">₹{goalPlan.monthly_plan.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Monthly Savings</div>
              </div>
            </div>

            {goalPlan.deadline && goalPlan.deadline !== "Not specified" && (
              <div className="mt-6 p-4 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
                <div className="flex items-center gap-2 text-indigo-300">
                  <FaCalendarAlt />
                  <span className="font-semibold">Deadline:</span> {goalPlan.deadline}
                </div>
              </div>
            )}
          </div>

          {/* Suggested Actions */}
          <div className="bg-background-glass/80 border border-fuchsia-400/30 rounded-2xl p-8 backdrop-blur-xl">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <FaLightbulb className="text-yellow-400" />
              Suggested Actions
            </h4>
            <div className="space-y-4">
              {goalPlan.suggested_actions.map((action, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white/10 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="text-gray-200">{action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivation Quote */}
          <div className="bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 border border-fuchsia-400/30 rounded-2xl p-8 backdrop-blur-xl">
            <div className="text-center">
              <div className="text-4xl mb-4">💪</div>
              <blockquote className="text-xl text-white italic mb-4">
                "{goalPlan.motivation_quote}"
              </blockquote>
              <div className="text-fuchsia-300 font-semibold">Keep going! You've got this!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalPlanner; 
import React, { useState, useEffect } from 'react';
import { FaBullseye, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaPlus, FaEdit, FaTrash, FaChartLine } from 'react-icons/fa';

const GoalTracker = () => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Mock data for demonstration - in a real app, this would come from a database
  useEffect(() => {
    // Load goals from localStorage or API
    const savedGoals = localStorage.getItem('finpilot_goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Sample goals for demonstration
      const sampleGoals = [
        {
          id: 1,
          goal: "Goa Trip Fund",
          goal_type: "travel",
          target_amount: 50000,
          current_amount: 15000,
          deadline: "December 2024",
          monthly_plan: 16666.67,
          months_remaining: 3,
          created_at: "2024-09-01",
          status: "active"
        },
        {
          id: 2,
          goal: "Emergency Fund",
          goal_type: "emergency",
          target_amount: 100000,
          current_amount: 75000,
          deadline: "March 2025",
          monthly_plan: 8333.33,
          months_remaining: 6,
          created_at: "2024-08-15",
          status: "active"
        }
      ];
      setGoals(sampleGoals);
      localStorage.setItem('finpilot_goals', JSON.stringify(sampleGoals));
    }
  }, []);

  const saveGoals = (updatedGoals) => {
    setGoals(updatedGoals);
    localStorage.setItem('finpilot_goals', JSON.stringify(updatedGoals));
  };

  const addGoal = (newGoal) => {
    const goalWithId = {
      ...newGoal,
      id: Date.now(),
      created_at: new Date().toISOString().split('T')[0],
      status: "active"
    };
    const updatedGoals = [...goals, goalWithId];
    saveGoals(updatedGoals);
    setShowAddGoal(false);
  };

  const updateGoalProgress = (goalId, newAmount) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, current_amount: Math.min(newAmount, goal.target_amount) }
        : goal
    );
    saveGoals(updatedGoals);
  };

  const deleteGoal = (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
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

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-4">
          <FaChartLine className="inline mr-3" />
          Goal Tracker
        </h2>
        <p className="text-gray-300 text-lg">
          Monitor your progress and stay on track with your financial goals
        </p>
      </div>

      {/* Add Goal Button */}
      <div className="mb-8 text-center">
        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
        >
          <FaPlus />
          Add New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.current_amount, goal.target_amount);
          const remaining = goal.target_amount - goal.current_amount;
          
          return (
            <div key={goal.id} className="bg-background-glass/80 border border-indigo-400/30 rounded-2xl p-6 backdrop-blur-xl">
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl ${getGoalTypeIcon(goal.goal_type)}`}></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{goal.goal}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getGoalTypeColor(goal.goal_type)} text-white`}>
                      {goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Goal"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progress: {progress.toFixed(1)}%</span>
                  <span>₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <FaMoneyBillWave className="text-2xl text-indigo-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">₹{remaining.toLocaleString()}</div>
                  <div className="text-xs text-gray-300">Remaining</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <FaCalendarAlt className="text-2xl text-blue-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{goal.months_remaining}</div>
                  <div className="text-xs text-gray-300">Months Left</div>
                </div>
              </div>

              {/* Monthly Plan */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-400/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-indigo-300">
                  <FaCheckCircle />
                  <span className="font-semibold">Monthly Target:</span> ₹{goal.monthly_plan.toLocaleString()}
                </div>
              </div>

              {/* Update Progress */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Update amount"
                  className="flex-1 bg-white/10 border border-indigo-400/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const newAmount = parseFloat(e.target.value) + goal.current_amount;
                      updateGoalProgress(goal.id, newAmount);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    const newAmount = parseFloat(input.value) + goal.current_amount;
                    updateGoalProgress(goal.id, newAmount);
                    input.value = '';
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-12">
          <FaBullseye className="text-6xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Goals Yet</h3>
          <p className="text-gray-400 mb-6">Start by creating your first financial goal!</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-background-glass/95 border border-indigo-400/30 rounded-2xl p-8 max-w-md w-full mx-4 backdrop-blur-xl">
            <h3 className="text-2xl font-bold text-white mb-6">Add New Goal</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addGoal({
                goal: formData.get('goal'),
                goal_type: formData.get('goal_type'),
                target_amount: parseFloat(formData.get('target_amount')),
                current_amount: parseFloat(formData.get('current_amount') || 0),
                deadline: formData.get('deadline'),
                monthly_plan: parseFloat(formData.get('monthly_plan')),
                months_remaining: parseInt(formData.get('months_remaining'))
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-indigo-300 font-semibold mb-2">Goal Name</label>
                  <input
                    name="goal"
                    type="text"
                    required
                    className="w-full bg-white/10 border border-indigo-400/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="e.g., Goa Trip Fund"
                  />
                </div>
                <div>
                  <label className="block text-indigo-300 font-semibold mb-2">Goal Type</label>
                  <select
                    name="goal_type"
                    required
                    className="w-full bg-white/10 border border-indigo-400/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                  >
                    <option value="travel">Travel</option>
                    <option value="education">Education</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="luxury">Luxury</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-indigo-300 font-semibold mb-2">Target Amount (₹)</label>
                  <input
                    name="target_amount"
                    type="number"
                    required
                    className="w-full bg-white/10 border border-indigo-400/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-indigo-300 font-semibold mb-2">Current Amount (₹)</label>
                  <input
                    name="current_amount"
                    type="number"
                    className="w-full bg-white/10 border border-indigo-400/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-indigo-300 font-semibold mb-2">Deadline</label>
                  <input
                    name="deadline"
                    type="text"
                    className="w-full bg-white/10 border border-indigo-400/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="e.g., December 2024"
                  />
                </div>
                <div>
                  <label className="block text-indigo-300 font-semibold mb-2">Monthly Plan (₹)</label>
                  <input
                    name="monthly_plan"
                    type="number"
                    required
                    className="w-full bg-white/10 border border-indigo-400/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="16666.67"
                  />
                </div>
                <div>
                  <label className="block text-indigo-300 font-semibold mb-2">Months Remaining</label>
                  <input
                    name="months_remaining"
                    type="number"
                    required
                    className="w-full bg-white/10 border border-indigo-400/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="3"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Add Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracker; 
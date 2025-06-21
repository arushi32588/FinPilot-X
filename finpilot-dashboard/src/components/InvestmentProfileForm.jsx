import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaBullseye, FaMoneyBillWave, FaChartLine, FaHourglassHalf, FaUserTie, FaRupeeSign, FaInfoCircle } from 'react-icons/fa';

const InvestmentProfileForm = ({ onSubmit, initialValues = {} }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    goal: initialValues.goal || 'Wealth Growth',
    risk_tolerance: initialValues.risk_tolerance || 'Medium',
    time_horizon_months: initialValues.time_horizon_months || 60,
    wants_micro_invest: initialValues.wants_micro_invest || true,
    target_amount: initialValues.target_amount || '',
    monthly_investment: initialValues.monthly_investment || '',
    current_investments: initialValues.current_investments || '',
    income_range: initialValues.income_range || '5-10L',
    investment_experience: initialValues.investment_experience || 'Beginner',
    inflation_rate: initialValues.inflation_rate || 6.0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields and handle empty values
    const processedData = {
      ...formData,
      time_horizon_months: parseInt(formData.time_horizon_months) || 60,
      target_amount: formData.target_amount ? parseFloat(formData.target_amount) : undefined,
      monthly_investment: formData.monthly_investment ? parseFloat(formData.monthly_investment) : undefined,
      current_investments: formData.current_investments ? parseFloat(formData.current_investments) : undefined
    };
    
    onSubmit(processedData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 gap-8" style={{color: '#fff'}}>
      {/* Investment Goal */}
      <div className="relative flex flex-col gap-2">
        <label className="flex items-center gap-2 text-fuchsia-300 font-semibold text-sm mb-1">
          <FaBullseye className="text-fuchsia-400" /> Investment Goal
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-fuchsia-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-fuchsia-400 transition-all duration-150 w-48">What is your main investment objective?</span>
          </span>
        </label>
        <select name="goal" value={formData.goal} onChange={handleChange} className="rounded-full bg-background-glass/70 border border-fuchsia-400/20 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-base shadow-inner px-4 py-3" style={{backdropFilter: 'blur(8px)'}}>
          <option value="Wealth Growth">Wealth Growth</option>
          <option value="Retirement">Retirement</option>
          <option value="Tax Saving">Tax Saving</option>
          <option value="Travel">Travel</option>
          <option value="Education">Education</option>
          <option value="Home Purchase">Home Purchase</option>
        </select>
      </div>
      {/* Target Amount */}
      <div className="relative flex flex-col gap-2">
        <label className="flex items-center gap-2 text-pink-300 font-semibold text-sm mb-1">
          <FaMoneyBillWave className="text-pink-400" /> Target Amount (₹)
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-pink-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-pink-400 transition-all duration-150 w-48">How much do you want to accumulate?</span>
          </span>
        </label>
        <input type="number" name="target_amount" value={formData.target_amount} onChange={handleChange} placeholder="Enter your target amount" className="rounded-full bg-background-glass/70 border border-pink-400/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400/60 transition-all text-base shadow-inner px-4 py-3 placeholder:text-pink-200/60" style={{backdropFilter: 'blur(8px)'}} />
      </div>
      {/* Monthly Investment Capacity */}
      <div className="relative flex flex-col gap-2">
        <label className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-1">
          <FaRupeeSign className="text-indigo-400" /> Monthly Investment (₹)
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-indigo-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-indigo-400 transition-all duration-150 w-48">How much can you invest monthly?</span>
          </span>
        </label>
        <input type="number" name="monthly_investment" value={formData.monthly_investment} onChange={handleChange} placeholder="Enter your monthly investment" className="rounded-full bg-background-glass/70 border border-indigo-400/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60 transition-all text-base shadow-inner px-4 py-3 placeholder:text-indigo-200/60" style={{backdropFilter: 'blur(8px)'}} />
      </div>
      {/* Current Investments */}
      <div className="relative flex flex-col gap-2">
        <label className="flex items-center gap-2 text-blue-300 font-semibold text-sm mb-1">
          <FaMoneyBillWave className="text-blue-400" /> Current Investments (₹)
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-blue-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-blue-400 transition-all duration-150 w-48">What is your current investment portfolio value?</span>
          </span>
        </label>
        <input type="number" name="current_investments" value={formData.current_investments} onChange={handleChange} placeholder="Enter your current investments" className="rounded-full bg-background-glass/70 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition-all text-base shadow-inner px-4 py-3 placeholder:text-blue-200/60" style={{backdropFilter: 'blur(8px)'}} />
      </div>
      {/* Annual Income Range */}
      <div className="relative flex flex-col gap-2">
        <label className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1">
          <FaRupeeSign className="text-emerald-400" /> Annual Income
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-emerald-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-emerald-400 transition-all duration-150 w-48">Your annual income range.</span>
          </span>
        </label>
        <select name="income_range" value={formData.income_range} onChange={handleChange} className="rounded-full bg-background-glass/70 border border-emerald-400/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/60 transition-all text-base shadow-inner px-4 py-3" style={{backdropFilter: 'blur(8px)'}}>
          <option value="0-5L">Less than ₹5 Lakhs</option>
          <option value="5-10L">₹5-10 Lakhs</option>
          <option value="10-20L">₹10-20 Lakhs</option>
          <option value="20-50L">₹20-50 Lakhs</option>
          <option value="50L+">More than ₹50 Lakhs</option>
        </select>
      </div>
      {/* Risk Tolerance */}
      <div className="relative flex flex-col gap-2">
        <label className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-1">
          <FaChartLine className="text-purple-400" /> Risk Tolerance
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-purple-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-purple-400 transition-all duration-150 w-48">How much risk are you comfortable with?</span>
          </span>
        </label>
        <select name="risk_tolerance" value={formData.risk_tolerance} onChange={handleChange} className="rounded-full bg-background-glass/70 border border-purple-400/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400/60 transition-all text-base shadow-inner px-4 py-3" style={{backdropFilter: 'blur(8px)'}}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      {/* Time Horizon */}
      <div className="relative flex flex-col gap-2">
        <label className="flex items-center gap-2 text-cyan-300 font-semibold text-sm mb-1">
          <FaHourglassHalf className="text-cyan-400" /> Time Horizon (months)
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-cyan-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-cyan-400 transition-all duration-150 w-48">How long do you plan to invest?</span>
          </span>
        </label>
        <input type="number" name="time_horizon_months" value={formData.time_horizon_months} onChange={handleChange} placeholder="e.g. 60" className="rounded-full bg-background-glass/70 border border-cyan-400/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60 transition-all text-base shadow-inner px-4 py-3 placeholder:text-cyan-200/60" style={{backdropFilter: 'blur(8px)'}} />
      </div>
      {/* Investment Experience */}
      <div className="relative flex flex-col gap-2">
        <label className="flex items-center gap-2 text-yellow-300 font-semibold text-sm mb-1">
          <FaUserTie className="text-yellow-400" /> Experience
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-yellow-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-yellow-400 transition-all duration-150 w-48">Your investment experience level.</span>
          </span>
        </label>
        <select name="investment_experience" value={formData.investment_experience} onChange={handleChange} className="rounded-full bg-background-glass/70 border border-yellow-400/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition-all text-base shadow-inner px-4 py-3" style={{backdropFilter: 'blur(8px)'}}>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      {/* Inflation Rate Slider */}
      <div className="relative flex flex-col gap-2 col-span-1 md:col-span-2">
        <label className="flex items-center gap-2 text-cyan-300 font-semibold text-sm mb-1">
          <FaChartLine className="text-cyan-400" /> Inflation Rate
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-cyan-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-cyan-400 transition-all duration-150 w-56">Expected average annual inflation rate. Impacts your real returns and goal projections.</span>
          </span>
          <span className="ml-2 text-cyan-200 font-bold text-base">{formData.inflation_rate}%</span>
        </label>
        <input
          type="range"
          name="inflation_rate"
          min={6}
          max={20}
          step={0.1}
          value={formData.inflation_rate}
          onChange={handleChange}
          className="w-full accent-cyan-400 h-2 rounded-full bg-background-glass/60 border border-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          style={{backdropFilter: 'blur(8px)'}}
        />
        <div className="flex justify-between text-xs text-cyan-300 mt-1">
          <span>6%</span>
          <span>20%</span>
        </div>
      </div>
      {/* Enable Micro-Investments */}
      <div className="relative flex flex-col gap-2 col-span-1 md:col-span-2">
        <label className="flex items-center gap-2 text-fuchsia-300 font-semibold text-sm mb-1">
          <input type="checkbox" name="wants_micro_invest" checked={formData.wants_micro_invest} onChange={handleChange} className="accent-fuchsia-500 w-5 h-5 rounded-full border-2 border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/60 transition-all" />
          Enable Micro-Investments
          <span className="ml-1 cursor-pointer group relative">
            <FaInfoCircle className="text-xs text-fuchsia-400" />
            <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-[#23263a] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-fuchsia-400 transition-all duration-150 w-48">Invest small amounts automatically to reach your goal faster.</span>
          </span>
        </label>
        {formData.wants_micro_invest && (
          <div className="mt-2 px-4 py-3 rounded-2xl bg-fuchsia-900/30 border border-fuchsia-400/30 text-fuchsia-200 text-sm animate-fadein shadow-inner">
            Tip: Micro-investments help you build wealth by investing spare change or small amounts regularly. Try it for a smarter, AI-powered savings boost!
          </div>
        )}
      </div>
      {/* Submit Button */}
      <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
        <button type="submit" className="relative px-8 py-4 rounded-[2rem] font-bold text-lg bg-gradient-to-r from-fuchsia-600 to-indigo-500 shadow-xl border-2 border-fuchsia-400/40 focus:outline-none focus:ring-4 focus:ring-fuchsia-400/50 transition-all duration-200 text-white group overflow-hidden hover:scale-105">
          <span className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-fuchsia-400/30 to-indigo-400/30 blur-lg opacity-60 group-hover:opacity-90 animate-pulse-glow" />
          <span className="relative z-10">Get Recommendations</span>
        </button>
      </div>
    </form>
  );
};

export default InvestmentProfileForm; 
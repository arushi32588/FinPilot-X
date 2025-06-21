import React, { useState } from 'react';
import { FaLightbulb, FaChartLine, FaShieldAlt, FaRocket, FaBrain, FaCheckCircle } from 'react-icons/fa';

const Explainer = () => {
  const [formData, setFormData] = useState({
    portfolio: [
      { name: 'Stocks', risk_level: 70, allocation: 60 },
      { name: 'Bonds', risk_level: 20, allocation: 30 },
      { name: 'Cash', risk_level: 5, allocation: 10 }
    ],
    user_profile: {
      goal: 'Wealth Growth',
      risk_tolerance: 'Medium',
      time_horizon: '5-10 years',
      investment_amount: 100000
    }
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('http://localhost:8000/api/decision-explainer/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze decision');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
      // Fallback to mock data if API fails
      setTimeout(() => {
        const mockAnalysis = {
          explanation: `Your portfolio allocation of ${formData.user_profile.investment_amount.toLocaleString()} with ${formData.user_profile.risk_tolerance} risk tolerance is well-suited for ${formData.user_profile.goal} over a ${formData.user_profile.time_horizon} timeframe. The 60% stock allocation provides growth potential while the 30% bond allocation offers stability.`,
          factors: {
            high_risk: 45,
            potential_growth: 75,
            diversification_score: 80,
            liquidity_score: 85
          },
          recommendations: [
            'Consider increasing international exposure for better diversification',
            'Review bond allocation based on interest rate environment',
            'Rebalance quarterly to maintain target allocations',
            'Consider adding alternative investments for further diversification'
          ],
          risk_assessment: {
            overall_risk: 'Moderate',
            volatility_expected: 'Medium',
            downside_protection: 'Good',
            growth_potential: 'High'
          }
        };
        setAnalysis(mockAnalysis);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolioItem = (index, field, value) => {
    const updatedPortfolio = [...formData.portfolio];
    updatedPortfolio[index] = { ...updatedPortfolio[index], [field]: value };
    setFormData({ ...formData, portfolio: updatedPortfolio });
  };

  const addPortfolioItem = () => {
    setFormData({
      ...formData,
      portfolio: [...formData.portfolio, { name: 'New Asset', risk_level: 50, allocation: 10 }]
    });
  };

  const removePortfolioItem = (index) => {
    const updatedPortfolio = formData.portfolio.filter((_, i) => i !== index);
    setFormData({ ...formData, portfolio: updatedPortfolio });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          <FaLightbulb className="inline mr-3" />
          Investment Decision Explainer
        </h2>
        <p className="text-gray-300 text-lg">
          Get AI-powered insights into your investment decisions and portfolio strategy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-background-glass/80 border border-fuchsia-400/30 rounded-2xl p-8 backdrop-blur-xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaBrain className="text-fuchsia-400" />
            Your Investment Profile
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Profile */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Profile Information</h4>
              
              <div>
                <label className="block text-fuchsia-300 font-semibold mb-2">Investment Goal</label>
                <select
                  value={formData.user_profile.goal}
                  onChange={(e) => setFormData({
                    ...formData,
                    user_profile: { ...formData.user_profile, goal: e.target.value }
                  })}
                  className="w-full bg-white/10 border border-fuchsia-400/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
                >
                  <option value="Wealth Growth">Wealth Growth</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Income Generation">Income Generation</option>
                  <option value="Capital Preservation">Capital Preservation</option>
                  <option value="Tax Optimization">Tax Optimization</option>
                </select>
              </div>

              <div>
                <label className="block text-fuchsia-300 font-semibold mb-2">Risk Tolerance</label>
                <select
                  value={formData.user_profile.risk_tolerance}
                  onChange={(e) => setFormData({
                    ...formData,
                    user_profile: { ...formData.user_profile, risk_tolerance: e.target.value }
                  })}
                  className="w-full bg-white/10 border border-fuchsia-400/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>

              <div>
                <label className="block text-fuchsia-300 font-semibold mb-2">Time Horizon</label>
                <select
                  value={formData.user_profile.time_horizon}
                  onChange={(e) => setFormData({
                    ...formData,
                    user_profile: { ...formData.user_profile, time_horizon: e.target.value }
                  })}
                  className="w-full bg-white/10 border border-fuchsia-400/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
                >
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-fuchsia-300 font-semibold mb-2">Investment Amount (₹)</label>
                <input
                  type="number"
                  value={formData.user_profile.investment_amount}
                  onChange={(e) => setFormData({
                    ...formData,
                    user_profile: { ...formData.user_profile, investment_amount: parseFloat(e.target.value) }
                  })}
                  className="w-full bg-white/10 border border-fuchsia-400/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
                  placeholder="100000"
                />
              </div>
            </div>

            {/* Portfolio Allocation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Portfolio Allocation</h4>
                <button
                  type="button"
                  onClick={addPortfolioItem}
                  className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
                >
                  + Add Asset
                </button>
              </div>

              {formData.portfolio.map((item, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updatePortfolioItem(index, 'name', e.target.value)}
                      className="bg-white/10 border border-fuchsia-400/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 flex-1 mr-3"
                      placeholder="Asset name"
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolioItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Risk Level (%)</label>
                      <input
                        type="number"
                        value={item.risk_level}
                        onChange={(e) => updatePortfolioItem(index, 'risk_level', parseInt(e.target.value))}
                        className="w-full bg-white/10 border border-fuchsia-400/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Allocation (%)</label>
                      <input
                        type="number"
                        value={item.allocation}
                        onChange={(e) => updatePortfolioItem(index, 'allocation', parseInt(e.target.value))}
                        className="w-full bg-white/10 border border-fuchsia-400/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <FaRocket />
                  Analyze Decision
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

        {/* Results */}
        <div className="space-y-6">
          {analysis ? (
            <>
              {/* Main Explanation */}
              <div className="bg-background-glass/80 border border-indigo-400/30 rounded-2xl p-8 backdrop-blur-xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaLightbulb className="text-indigo-400" />
                  AI Analysis
                </h3>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {analysis.explanation}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-400">{analysis.factors?.high_risk || 45}%</div>
                    <div className="text-gray-300 text-sm">Risk Level</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{analysis.factors?.potential_growth || 75}%</div>
                    <div className="text-gray-300 text-sm">Growth Potential</div>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              {analysis.risk_assessment && (
                <div className="bg-background-glass/80 border border-emerald-400/30 rounded-2xl p-8 backdrop-blur-xl">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <FaShieldAlt className="text-emerald-400" />
                    Risk Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-sm text-gray-300 mb-1">Overall Risk</div>
                      <div className="text-lg font-bold text-white">{analysis.risk_assessment.overall_risk}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-sm text-gray-300 mb-1">Volatility</div>
                      <div className="text-lg font-bold text-white">{analysis.risk_assessment.volatility_expected}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-sm text-gray-300 mb-1">Downside Protection</div>
                      <div className="text-lg font-bold text-white">{analysis.risk_assessment.downside_protection}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-sm text-gray-300 mb-1">Growth Potential</div>
                      <div className="text-lg font-bold text-white">{analysis.risk_assessment.growth_potential}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-background-glass/80 border border-fuchsia-400/30 rounded-2xl p-8 backdrop-blur-xl">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <FaChartLine className="text-fuchsia-400" />
                  Recommendations
                </h4>
                <div className="space-y-3">
                  {analysis.recommendations?.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                      <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-200">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-background-glass/80 border border-gray-400/30 rounded-2xl p-8 backdrop-blur-xl text-center">
              <FaLightbulb className="text-6xl text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">Ready to Analyze</h3>
              <p className="text-gray-400">
                Fill in your investment profile and portfolio details, then click "Analyze Decision" to get AI-powered insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explainer;
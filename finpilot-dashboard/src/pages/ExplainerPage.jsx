import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Explainer from '../components/Explainer';
import { FaLightbulb, FaChartLine, FaBrain, FaArrowLeft, FaRocket, FaShieldAlt } from 'react-icons/fa';

const ExplainerPage = () => {
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('main'); // 'main', 'explainer'

  const handleBackToMain = () => {
    setActiveView('main');
  };

  if (activeView === 'explainer') {
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
            Back to Explainer
          </button>
          
          <Explainer />
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
            <FaLightbulb className="inline mr-3" />
            AI Decision Explainer
      </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Get AI-powered insights into your investment decisions. Understand the reasoning, risks, and recommendations behind your financial choices.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-background-glass/80 border border-fuchsia-400/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full flex items-center justify-center">
                <FaBrain className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Smart Analysis</h3>
                <p className="text-gray-300">AI-powered decision breakdown</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Get detailed explanations of why an investment decision makes sense, including market context and risk factors.
            </p>
          </div>

          <div className="bg-background-glass/80 border border-indigo-400/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Risk Assessment</h3>
                <p className="text-gray-300">Comprehensive risk analysis</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Understand potential risks, volatility, and market conditions that could affect your investment.
            </p>
          </div>

          <div className="bg-background-glass/80 border border-emerald-400/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Actionable Insights</h3>
                <p className="text-gray-300">Practical recommendations</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Receive specific suggestions on how to optimize your investment strategy and improve outcomes.
            </p>
          </div>
        </div>

        {/* Main Action */}
        <div className="text-center mb-8">
          <button
            onClick={() => setActiveView('explainer')}
            className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            <FaRocket />
            Start Decision Analysis
          </button>
        </div>

        {/* How It Works */}
        <div className="bg-background-glass/80 border border-gray-400/30 rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Describe Your Decision</h3>
              <p className="text-gray-400 text-sm">
                Tell us about your investment decision, amount, risk tolerance, and expected returns.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
              <p className="text-gray-400 text-sm">
                Our AI analyzes your decision using market data, risk models, and financial principles.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Insights</h3>
              <p className="text-gray-400 text-sm">
                Receive detailed explanations, risk assessments, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Example Use Cases */}
        <div className="mt-8 bg-background-glass/80 border border-gray-400/30 rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Example Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Investment Decisions</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• "Should I invest 20% in Bitcoin ETF?"</li>
                <li>• "Is this the right time to buy Tesla stock?"</li>
                <li>• "Should I allocate 15% to emerging markets?"</li>
                <li>• "Is real estate a good investment now?"</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Portfolio Decisions</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• "Should I rebalance my portfolio?"</li>
                <li>• "Is my risk allocation appropriate?"</li>
                <li>• "Should I increase my bond allocation?"</li>
                <li>• "Is my diversification strategy sound?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainerPage; 
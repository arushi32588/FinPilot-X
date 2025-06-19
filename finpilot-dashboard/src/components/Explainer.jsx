import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Explainer = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    decision: '',
    risk: '',
    profit: '',
    timeframe: 'short-term',
    amount: ''
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateAnalysis = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockAnalysis = {
        decisionExplanation: `
          Investing ${formData.amount || '10%'} in ${formData.decision || 'this plan'} can be a ${formData.timeframe} strategy. 
          This allocation helps diversify your portfolio while maintaining liquidity for other opportunities.
        `,
        riskAnalysis: `
          At a ${formData.risk || '20%'} risk level, this investment carries moderate volatility. 
          Key risks include market fluctuations, liquidity constraints, and potential changes in 
          ${formData.decision.includes('crypto') ? 'crypto regulations' : 'sector-specific regulations'}.
        `,
        suggestions: [
          'Consider dollar-cost averaging to mitigate timing risk',
          'Rebalance quarterly to maintain your target allocation',
          formData.risk > 30 ? 'Allocate no more than 5% of total portfolio to high-risk investments' : '',
          'Review the investment thesis every 6 months'
        ].filter(Boolean)
      };
      
      setAnalysis(mockAnalysis);
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem'
    }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        marginBottom: '1rem',
        color: isDarkMode ? '#e5e7eb' : '#1f2937'
      }}>
        Investment Explainer
      </h2>

      <form onSubmit={generateAnalysis}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#e5e7eb' : '#4b5563'
            }}>
              Investment Decision
            </label>
            <input
              type="text"
              name="decision"
              value={formData.decision}
              onChange={handleChange}
              placeholder="e.g. Invest in Bitcoin ETF"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#e5e7eb' : '#1f2937'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#e5e7eb' : '#4b5563'
            }}>
              Amount/Percentage
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g. 10% or $5,000"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#e5e7eb' : '#1f2937'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#e5e7eb' : '#4b5563'
            }}>
              Risk Level (%)
            </label>
            <input
              type="number"
              name="risk"
              value={formData.risk}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="0-100"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#e5e7eb' : '#1f2937'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#e5e7eb' : '#4b5563'
            }}>
              Expected Profit (%)
            </label>
            <input
              type="number"
              name="profit"
              value={formData.profit}
              onChange={handleChange}
              placeholder="Expected return"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#e5e7eb' : '#1f2937'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#e5e7eb' : '#4b5563'
            }}>
              Timeframe
            </label>
            <select
              name="timeframe"
              value={formData.timeframe}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#e5e7eb' : '#1f2937'
              }}
            >
              <option value="short-term">Short-term (0-2 years)</option>
              <option value="medium-term">Medium-term (2-5 years)</option>
              <option value="long-term">Long-term (5+ years)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? (
            <>
              <span>Analyzing...</span>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                ⏳
              </span>
            </>
          ) : 'Generate Analysis'}
        </button>
      </form>

      {analysis && (
        <div style={{ 
          marginTop: '2rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: isDarkMode ? '#e5e7eb' : '#1f2937'
            }}>
              Decision Explanation
            </h3>
            <p style={{
              color: isDarkMode ? '#d1d5db' : '#4b5563',
              lineHeight: '1.6'
            }}>
              {analysis.decisionExplanation}
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: isDarkMode ? '#e5e7eb' : '#1f2937'
            }}>
              Risk Analysis
            </h3>
            <p style={{
              color: isDarkMode ? '#d1d5db' : '#4b5563',
              lineHeight: '1.6'
            }}>
              {analysis.riskAnalysis}
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
            borderRadius: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: isDarkMode ? '#e5e7eb' : '#1f2937'
            }}>
              Suggestions
            </h3>
            <ul style={{
              color: isDarkMode ? '#d1d5db' : '#4b5563',
              paddingLeft: '1.25rem',
              lineHeight: '1.6'
            }}>
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Explainer;
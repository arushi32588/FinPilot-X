import React, { useState, useEffect } from 'react';
import config from '../config';
import InvestmentProfileForm from './InvestmentProfileForm';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ReactMarkdown from 'react-markdown';

function formatCurrency(val) {
  console.log('formatCurrency input:', val);
  if (val === undefined || val === null || val === '') return 'N/A';
  const num = Number(val);
  if (isNaN(num)) return 'N/A';
  return `₹${num.toLocaleString()}`;
}

// Default micro-investment tips
const defaultMicroInvestmentTips = [
  'Start with small, regular contributions to build the habit.',
  'Automate your micro-investments to stay consistent.',
  'Round up your daily purchases and invest the spare change.',
  'Review your micro-investment plan every few months.',
  'Take advantage of employer or platform matching programs if available.',
  'Diversify your micro-investments across different asset classes.',
  'Avoid withdrawing from your micro-investment account prematurely.'
];

const InvestmentRecommender = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { isDarkMode } = useTheme();
  const [saveStatus, setSaveStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [showPortfolioExplanation, setShowPortfolioExplanation] = useState(false);
  const [portfolioExplanation, setPortfolioExplanation] = useState(null);
  const [portfolioExplanationLoading, setPortfolioExplanationLoading] = useState(false);
  const [portfolioExplanationError, setPortfolioExplanationError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleProfileSubmit = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      setUserProfile(profileData);

      const response = await fetch(`${config.API_BASE_URL}/api/investment-recommender/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save to Library handler
  const handleSaveRecommendation = async () => {
    if (!recommendations || !user) return;
    setSaveStatus('saving');
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/investment-recommender/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.uid,
          recommendation: recommendations
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save recommendation');
      }
      setSaveStatus('success');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handleExplainPortfolio = async () => {
    setShowPortfolioExplanation(true);
    setPortfolioExplanation(null);
    setPortfolioExplanationError(null);
    setPortfolioExplanationLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/decision-explainer/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio: recommendations.recommended_portfolio,
          user_profile: userProfile
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch explanation');
      }
      const data = await response.json();
      setPortfolioExplanation(data);
    } catch (err) {
      setPortfolioExplanationError(err.message);
    } finally {
      setPortfolioExplanationLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '2px solid',
            borderColor: isDarkMode ? '#3b82f6' : '#2563eb',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            marginTop: '1rem',
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            Analyzing your investment profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '64rem',
        margin: '0 auto',
        padding: '1.5rem'
      }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: isDarkMode ? '#991b1b' : '#fee2e2',
          borderRadius: '0.75rem',
          border: `1px solid ${isDarkMode ? '#7f1d1d' : '#fecaca'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{
              fontSize: '1.5rem',
              marginRight: '0.75rem',
              color: isDarkMode ? '#fecaca' : '#991b1b'
            }}>⚠️</span>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: isDarkMode ? '#fecaca' : '#991b1b'
            }}>
              Error Loading Recommendations
            </h3>
          </div>
          <p style={{
            color: isDarkMode ? '#fecaca' : '#991b1b',
            marginBottom: '1rem'
          }}>
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isDarkMode ? '#7f1d1d' : '#fecaca',
              color: isDarkMode ? '#fecaca' : '#991b1b',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations) {
    console.log('micro_investment_plan:', recommendations.micro_investment_plan);
  }

  // Calculate goal gap in frontend
  let computedGoalGap = null;
  if (recommendations && recommendations.central_summary) {
    const targetGoalFV = Number(recommendations.central_summary.target_goal_future_value);
    const inflationAdjustedCorpus = Number(recommendations.central_summary.inflation_adjusted_value);
    if (!isNaN(targetGoalFV) && !isNaN(inflationAdjustedCorpus)) {
      computedGoalGap = targetGoalFV - inflationAdjustedCorpus;
    }
  }

  return (
    <div style={{
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '2rem 1rem'
    }}>
      <div style={{
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <div>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Smart Investment Recommendations
              </h2>
              <p style={{
                color: isDarkMode ? '#9ca3af' : '#6b7280'
              }}>
                Personalized investment strategies based on your profile
              </p>
            </div>
            {userProfile && (
              <button
                onClick={() => setUserProfile(null)}
                style={{
                  padding: '0.5rem 1rem',
                  color: isDarkMode ? '#60a5fa' : '#2563eb',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {!userProfile ? (
            <div style={{
              maxWidth: '42rem',
              margin: '0 auto'
            }}>
              <div style={{
                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  color: isDarkMode ? '#f3f4f6' : '#1f2937'
                }}>
                  Tell us about your investment preferences
                </h3>
                <InvestmentProfileForm onSubmit={handleProfileSubmit} />
              </div>
            </div>
          ) : (
            <>
              {/* User Profile Summary */}
              <div style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: isDarkMode 
                  ? 'linear-gradient(to right, rgba(30, 58, 138, 0.2), rgba(79, 70, 229, 0.2))'
                  : 'linear-gradient(to right, #eff6ff, #eef2ff)',
                borderRadius: '0.75rem',
                border: `1px solid ${isDarkMode ? '#1e40af' : '#bfdbfe'}`
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: isDarkMode ? '#f3f4f6' : '#1f2937'
                }}>
                  Your Investment Profile
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {[
                    { label: 'Investment Goal', value: userProfile.goal },
                    { label: 'Risk Tolerance', value: userProfile.risk_tolerance },
                    { label: 'Time Horizon', value: `${Math.round(userProfile.time_horizon_months / 12)} years` },
                    { label: 'Micro-Investments', value: userProfile.wants_micro_invest ? 'Enabled' : 'Disabled' },
                    { label: 'Target Amount', value: userProfile.target_amount ? `₹${userProfile.target_amount.toLocaleString()}` : 'Not specified' },
                    { label: 'Monthly Investment', value: userProfile.monthly_investment ? `₹${userProfile.monthly_investment.toLocaleString()}` : 'Not specified' },
                    { label: 'Current Investments', value: userProfile.current_investments ? `₹${userProfile.current_investments.toLocaleString()}` : 'Not specified' },
                    { label: 'Annual Income', value: userProfile.income_range },
                    { label: 'Investment Experience', value: userProfile.investment_experience }
                  ].map((item, index) => (
                    <div key={index} style={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: isDarkMode ? '#f3f4f6' : '#1f2937'
                      }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {recommendations && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Central Summary Section */}
                  {recommendations.central_summary && (
                    <div style={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      marginBottom: '2rem'
                    }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem',
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{ marginRight: '0.5rem' }}>🧩</span>
                        Total Investment Outcome
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        {[{
                          label: 'Total Corpus (Nominal)',
                          value: recommendations.central_summary.total_corpus_nominal,
                          note: 'Based on projected returns without inflation'
                        }, {
                          label: 'Inflation-Adjusted Value',
                          value: recommendations.central_summary.inflation_adjusted_value,
                          note: 'Discounts nominal corpus using inflation'
                        }, {
                          label: 'Target Goal (Future Value)',
                          value: recommendations.central_summary.target_goal_future_value,
                          note: 'User goal grown by inflation'
                        }, {
                          label: 'Goal Gap',
                          value: computedGoalGap !== null ? computedGoalGap : recommendations.central_summary.goal_gap,
                          note: 'Shortfall or surplus',
                          color: computedGoalGap !== null ? (computedGoalGap >= 0 ? (isDarkMode ? '#22c55e' : '#16a34a') : (isDarkMode ? '#f87171' : '#dc2626')) : (recommendations.central_summary.goal_gap_status === 'Surplus' ? (isDarkMode ? '#22c55e' : '#16a34a') : (isDarkMode ? '#f87171' : '#dc2626'))
                        }].map((item, idx) => (
                          <div key={idx} style={{
                            background: isDarkMode ? '#374151' : '#f3f4f6',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                          }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '0.5rem' }}>{item.label}</h4>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: item.color || (isDarkMode ? '#60a5fa' : '#2563eb') }}>{item.value}</p>
                            <div style={{ fontSize: '0.8rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>{item.note}</div>
                          </div>
                        ))}
                      </div>
                      {/* What to do? section if Goal Gap is negative */}
                      {(computedGoalGap !== null ? computedGoalGap < 0 : (Number(recommendations.central_summary.goal_gap) < 0 || (recommendations.central_summary.goal_gap_status && recommendations.central_summary.goal_gap_status !== 'Surplus'))) ? (
                        <div style={{
                          marginTop: '1.5rem',
                          backgroundColor: isDarkMode ? '#f87171' : '#fee2e2',
                          borderRadius: '0.75rem',
                          padding: '1.25rem',
                          border: `1px solid ${isDarkMode ? '#7f1d1d' : '#fecaca'}`
                        }}>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: isDarkMode ? '#fecaca' : '#991b1b',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <span style={{ marginRight: '0.5rem' }}>❓</span>
                            What to do?
                          </h4>
                          <ul style={{
                            color: isDarkMode ? '#fecaca' : '#991b1b',
                            fontSize: '0.95rem',
                            marginLeft: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            <li>Increase your monthly investment</li>
                            <li>Extend your goal timeline</li>
                            <li>Reduce your target goal</li>
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}
                  {/* Recommended Portfolio */}
                  <div style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1.5rem',
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>📊</span>
                      Recommended Portfolio
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {recommendations.recommended_portfolio.map((fund, index) => (
                        <div key={index} style={{
                          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                          }}>
                            <div>
                              <h4 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                marginBottom: '0.25rem'
                              }}>
                                {fund.name}
                              </h4>
                              <p style={{
                                fontSize: '0.875rem',
                                color: isDarkMode ? '#9ca3af' : '#6b7280'
                              }}>
                                {fund.type}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: isDarkMode ? '#60a5fa' : '#2563eb'
                              }}>
                                {fund.allocation}
                              </div>
                              <div style={{
                                fontSize: '0.875rem',
                                color: isDarkMode ? '#9ca3af' : '#6b7280'
                              }}>
                                Allocation
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1.5rem',
                            fontSize: '0.875rem'
                          }}>
                            <div>
                              <p style={{ color: isDarkMode ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '500' }}>Risk Level:</span> {fund.risk_level}
                              </p>
                              <p style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
                                <span style={{ fontWeight: '500' }}>Expected Return:</span> {fund.expected_return}
                              </p>
                            </div>
                            <div>
                              <p style={{ color: isDarkMode ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '500' }}>Liquidity:</span> {fund.liquidity}
                              </p>
                              <p style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
                                <span style={{ fontWeight: '500' }}>Min Investment:</span> ₹{fund.min_investment}
                              </p>
                            </div>
                          </div>
                          {/* Per-Investment Inflation Details */}
                          <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                            borderRadius: '0.5rem',
                            border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                          }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: isDarkMode ? '#60a5fa' : '#2563eb' }}>
                              Inflation Analysis
                            </h5>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                              <div><span style={{ fontWeight: 500 }}>Expected Nominal Return:</span> {fund.expected_nominal_return}</div>
                              <div><span style={{ fontWeight: 500 }}>Inflation Rate:</span> {fund.inflation_rate}</div>
                              <div><span style={{ fontWeight: 500 }}>Real Return:</span> {fund.real_return}</div>
                              <div><span style={{ fontWeight: 500 }}>Nominal Future Value:</span> {fund.nominal_future_value}</div>
                              <div>
                                <span style={{ fontWeight: 500 }}>Inflation-Adjusted Value:</span> {fund.inflation_adjusted_value}
                                <span title={fund.what_this_means} style={{ marginLeft: 6, cursor: 'help', color: isDarkMode ? '#60a5fa' : '#2563eb' }}>ℹ️</span>
                              </div>
                            </div>
                          </div>
                          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
                            {fund.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Why this portfolio button */}
                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        onClick={handleExplainPortfolio}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: isDarkMode ? '#f59e42' : '#fbbf24',
                          color: isDarkMode ? '#1f2937' : '#1f2937',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '1rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Why this portfolio?
                      </button>
                      {/* Save to Library Button */}
                      <button
                        onClick={handleSaveRecommendation}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
                          color: '#fff',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '1rem',
                          fontWeight: '500',
                          cursor: user ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease',
                          opacity: saveStatus === 'saving' || !user ? 0.7 : 1
                        }}
                        disabled={saveStatus === 'saving' || !user}
                        title={!user ? 'Log in to save recommendations' : ''}
                      >
                        {saveStatus === 'saving' ? 'Saving...' : 'Save to Library'}
                      </button>
                      {saveStatus === 'success' && (
                        <span style={{ color: isDarkMode ? '#22c55e' : '#16a34a', fontWeight: 500 }}>Saved!</span>
                      )}
                      {saveStatus === 'error' && (
                        <span style={{ color: isDarkMode ? '#f87171' : '#dc2626', fontWeight: 500 }}>Error saving. Try again.</span>
                      )}
                      {!user && (
                        <span style={{ color: isDarkMode ? '#fbbf24' : '#b45309', fontWeight: 500 }}>Log in to save recommendations</span>
                      )}
                    </div>
                  </div>

                  {/* Modal for portfolio explanation */}
                  {showPortfolioExplanation && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'rgba(0,0,0,0.4)',
                      zIndex: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                      onClick={() => setShowPortfolioExplanation(false)}
                    >
                      <div style={{
                        background: isDarkMode ? '#1f2937' : '#fff',
                        borderRadius: '1rem',
                        padding: '1.2rem',
                        width: 500,
                        height: 450,
                        boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setShowPortfolioExplanation(false)}
                          style={{ position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: isDarkMode ? '#fbbf24' : '#f59e42' }}
                          title="Close"
                        >
                          ×
                        </button>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: isDarkMode ? '#fbbf24' : '#f59e42' }}>Why this portfolio?</h3>
                        <div style={{ flex: 1, overflowY: 'auto', background: isDarkMode ? '#23272e' : '#f8fafc', borderRadius: 8, padding: '0.75rem' }}>
                          {portfolioExplanationLoading && <div>Loading explanation...</div>}
                          {portfolioExplanationError && <div style={{ color: 'red' }}>{portfolioExplanationError}</div>}
                          {portfolioExplanation && (
                            <ReactMarkdown
                              children={portfolioExplanation.explanation || JSON.stringify(portfolioExplanation, null, 2)}
                              components={{
                                strong: (props) => <strong style={{color: isDarkMode ? '#fbbf24' : '#f59e42'}} {...props} />,
                                h4: (props) => <h4 style={{marginTop: '1rem', color: isDarkMode ? '#60a5fa' : '#2563eb'}} {...props} />,
                                li: (props) => <li style={{marginBottom: 4, paddingLeft: 2}} {...props} />,
                                ul: (props) => <ul style={{marginBottom: 12, paddingLeft: 18}} {...props} />,
                                ol: (props) => <ol style={{marginBottom: 12, paddingLeft: 18}} {...props} />,
                                hr: () => <hr style={{border: 0, borderTop: '1px solid #e5e7eb', margin: '1rem 0'}} />,
                                p: (props) => <p style={{marginBottom: 8, color: isDarkMode ? '#f3f4f6' : '#1f2937'}} {...props} />,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Micro-Investment Plan */}
                  <div style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1.5rem',
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>💰</span>
                      Micro-Investment Plan
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        {[
                          { label: 'Weekly Investment', value: formatCurrency(recommendations.micro_investment_plan?.weekly_investment) },
                          { label: 'Weeks to Goal', value: recommendations.micro_investment_plan?.weeks_to_goal ?? 'N/A' },
                          { label: 'Total Contribution', value: formatCurrency(recommendations.micro_investment_plan?.total_contribution) }
                        ].map((item, index) => (
                          <div key={index} style={{
                            background: isDarkMode 
                              ? 'linear-gradient(to bottom right, rgba(30, 58, 138, 0.2), rgba(79, 70, 229, 0.2))'
                              : 'linear-gradient(to bottom right, #eff6ff, #eef2ff)',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            border: `1px solid ${isDarkMode ? '#1e40af' : '#bfdbfe'}`
                          }}>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: isDarkMode ? '#9ca3af' : '#6b7280',
                              marginBottom: '0.5rem'
                            }}>
                              {item.label}
                            </h4>
                            <p style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: isDarkMode ? '#60a5fa' : '#2563eb'
                            }}>
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                      {Array.isArray(recommendations.micro_investment_plan?.tips) && recommendations.micro_investment_plan.tips.length > 0 ? (
                        <div style={{
                          backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff',
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `1px solid ${isDarkMode ? '#1e40af' : '#bfdbfe'}`
                        }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: isDarkMode ? '#93c5fd' : '#1e40af', marginBottom: '0.75rem' }}>
                            Micro-Investment Tips
                          </h4>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {recommendations.micro_investment_plan.tips.map((tip, index) => (
                              <li key={index} style={{ display: 'flex', flexDirection: 'column', fontSize: '0.875rem', color: isDarkMode ? '#93c5fd' : '#1e40af' }}>
                                <span style={{ fontWeight: 500 }}>{typeof tip === 'string' ? tip : tip.tip}</span>
                                {tip.description && (
                                  <span style={{ fontSize: '0.8rem', color: isDarkMode ? '#60a5fa' : '#2563eb', marginTop: 2 }}>{tip.description}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff',
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `1px solid ${isDarkMode ? '#1e40af' : '#bfdbfe'}`
                        }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: isDarkMode ? '#93c5fd' : '#1e40af',
                            marginBottom: '0.75rem'
                          }}>
                            Micro-Investment Tips
                          </h4>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {defaultMicroInvestmentTips.map((tip, index) => (
                              <li key={index} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                fontSize: '0.875rem',
                                color: isDarkMode ? '#93c5fd' : '#1e40af'
                              }}>
                                <span style={{ marginRight: '0.5rem' }}>•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Growth Simulations */}
                  <div style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1.5rem',
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>📈</span>
                      Growth Simulations
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        {[
                          { 
                            label: 'Normal Scenario',
                            value: recommendations.growth_simulations?.normal,
                            color: isDarkMode ? '#34d399' : '#059669'
                          },
                          {
                            label: 'Crash Scenario',
                            value: recommendations.growth_simulations?.crash,
                            color: isDarkMode ? '#f87171' : '#dc2626'
                          },
                          {
                            label: 'Boom Scenario',
                            value: recommendations.growth_simulations?.boom,
                            color: isDarkMode ? '#34d399' : '#059669'
                          }
                        ].map((item, index) => (
                          <div key={index} style={{
                            background: isDarkMode 
                              ? item.color === '#f87171'
                                ? 'linear-gradient(to bottom right, rgba(220, 38, 38, 0.2), rgba(239, 68, 68, 0.2))'
                                : 'linear-gradient(to bottom right, rgba(5, 150, 105, 0.2), rgba(16, 185, 129, 0.2))'
                              : item.color === '#dc2626'
                                ? 'linear-gradient(to bottom right, #fee2e2, #fecaca)'
                                : 'linear-gradient(to bottom right, #d1fae5, #a7f3d0)',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            border: `1px solid ${item.color === '#dc2626' ? '#fecaca' : '#a7f3d0'}`
                          }}>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: isDarkMode ? '#9ca3af' : '#6b7280',
                              marginBottom: '0.5rem'
                            }}>
                              {item.label}
                            </h4>
                            <p style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: item.color
                            }}>
                              {item.value !== undefined && item.value !== null ? JSON.stringify(item.value) : 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                      {recommendations.growth_simulations?.analysis ? (
                        <div style={{
                          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                        }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            marginBottom: '1rem'
                          }}>
                            Scenario Analysis
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                              { label: 'Best Case', value: recommendations.growth_simulations.analysis.best_case },
                              { label: 'Worst Case', value: recommendations.growth_simulations.analysis.worst_case },
                              { label: 'Expected Case', value: recommendations.growth_simulations.analysis.expected_case }
                            ].map((item, index) => (
                              <p key={index} style={{
                                fontSize: '0.875rem',
                                color: isDarkMode ? '#d1d5db' : '#4b5563'
                              }}>
                                <span style={{ fontWeight: '500' }}>{item.label}:</span> {item.value}
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                        }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            marginBottom: '1rem'
                          }}>
                            Scenario Analysis
                          </h4>
                          <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
                            No scenario analysis available.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Risk Analysis */}
                  <div style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1.5rem',
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>🛡️</span>
                      Risk Analysis
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        {[
                          { label: 'Portfolio Risk', value: recommendations.risk_analysis.portfolio_risk },
                          { label: 'Diversification', value: recommendations.risk_analysis.diversification_score },
                          { label: 'Liquidity', value: recommendations.risk_analysis.liquidity_score }
                        ].map((item, index) => (
                          <div key={index} style={{
                            background: isDarkMode 
                              ? 'linear-gradient(to bottom right, rgba(234, 179, 8, 0.2), rgba(217, 119, 6, 0.2))'
                              : 'linear-gradient(to bottom right, #fef3c7, #fde68a)',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            border: `1px solid ${isDarkMode ? '#92400e' : '#fcd34d'}`
                          }}>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: isDarkMode ? '#9ca3af' : '#6b7280',
                              marginBottom: '0.5rem'
                            }}>
                              {item.label}
                            </h4>
                            <p style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: isDarkMode ? '#fbbf24' : '#d97706'
                            }}>
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div style={{
                        backgroundColor: isDarkMode ? '#92400e' : '#fef3c7',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        border: `1px solid ${isDarkMode ? '#92400e' : '#fcd34d'}`
                      }}>
                        <h4 style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: isDarkMode ? '#fcd34d' : '#92400e',
                          marginBottom: '0.75rem'
                        }}>
                          Risk Management Tips
                        </h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {recommendations.risk_analysis.tips.map((tip, index) => (
                            <li key={index} style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              fontSize: '0.875rem',
                              color: isDarkMode ? '#fcd34d' : '#92400e'
                            }}>
                              <span style={{ marginRight: '0.5rem' }}>•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Investment Nudge */}
                  {recommendations.nudge && (
                    <div style={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem',
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{ marginRight: '0.5rem' }}>💡</span>
                        Investment Nudge
                      </h3>
                      <div style={{
                        backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        border: `1px solid ${isDarkMode ? '#1e40af' : '#bfdbfe'}`
                      }}>
                        <p style={{
                          color: isDarkMode ? '#93c5fd' : '#1e40af'
                        }}>
                          {recommendations.nudge}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Gamification Status */}
                  <div style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1.5rem',
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>🎮</span>
                      Gamification Status
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      {[
                        { label: 'Current Level', value: recommendations.gamification.level },
                        { label: 'XP Points', value: recommendations.gamification.xp },
                        { label: 'Current Streak', value: recommendations.gamification.streak },
                        { 
                          label: 'Next Level',
                          value: recommendations.gamification.next_level,
                          subtext: recommendations.gamification.xp_to_next
                        }
                      ].map((item, index) => (
                        <div key={index} style={{
                          background: isDarkMode 
                            ? 'linear-gradient(to bottom right, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.2))'
                            : 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `1px solid ${isDarkMode ? '#6d28d9' : '#ddd6fe'}`
                        }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                            marginBottom: '0.5rem'
                          }}>
                            {item.label}
                          </h4>
                          <p style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: isDarkMode ? '#a78bfa' : '#7c3aed'
                          }}>
                            {item.value}
                          </p>
                          {item.subtext && (
                            <p style={{
                              fontSize: '0.875rem',
                              color: isDarkMode ? '#9ca3af' : '#6b7280',
                              marginTop: '0.25rem'
                            }}>
                              {item.subtext}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Investment Tips */}
                  <div style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1.5rem',
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>💎</span>
                      Investment Tips
                    </h3>
                    <div style={{
                      backgroundColor: isDarkMode ? '#064e3b' : '#d1fae5',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      border: `1px solid ${isDarkMode ? '#065f46' : '#a7f3d0'}`
                    }}>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recommendations.investment_tips.map((tip, index) => (
                          <li key={index} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            fontSize: '0.875rem',
                            color: isDarkMode ? '#a7f3d0' : '#065f46'
                          }}>
                            <span style={{ marginRight: '0.5rem' }}>•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentRecommender; 
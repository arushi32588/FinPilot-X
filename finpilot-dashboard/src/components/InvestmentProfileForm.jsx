import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Investment Goal
        </label>
        <select
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <option value="Wealth Growth">Wealth Growth</option>
          <option value="Retirement">Retirement</option>
          <option value="Tax Saving">Tax Saving</option>
          <option value="Travel">Travel</option>
          <option value="Education">Education</option>
          <option value="Home Purchase">Home Purchase</option>
        </select>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Target Amount (₹)
        </label>
        <input
          type="number"
          name="target_amount"
          value={formData.target_amount}
          onChange={handleChange}
          placeholder="Enter your target amount"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
        />
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Monthly Investment Capacity (₹)
        </label>
        <input
          type="number"
          name="monthly_investment"
          value={formData.monthly_investment}
          onChange={handleChange}
          placeholder="Enter your monthly investment capacity"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
        />
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Current Investments (₹)
        </label>
        <input
          type="number"
          name="current_investments"
          value={formData.current_investments}
          onChange={handleChange}
          placeholder="Enter your current investment portfolio value"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
        />
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Annual Income Range
        </label>
        <select
          name="income_range"
          value={formData.income_range}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <option value="0-5L">Less than ₹5 Lakhs</option>
          <option value="5-10L">₹5-10 Lakhs</option>
          <option value="10-20L">₹10-20 Lakhs</option>
          <option value="20-50L">₹20-50 Lakhs</option>
          <option value="50L+">More than ₹50 Lakhs</option>
        </select>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Investment Experience
        </label>
        <select
          name="investment_experience"
          value={formData.investment_experience}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <option value="Beginner">Beginner (0-2 years)</option>
          <option value="Intermediate">Intermediate (2-5 years)</option>
          <option value="Advanced">Advanced (5+ years)</option>
        </select>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Risk Tolerance
        </label>
        <select
          name="risk_tolerance"
          value={formData.risk_tolerance}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <option value="Low">Low (Conservative)</option>
          <option value="Medium">Medium (Balanced)</option>
          <option value="High">High (Aggressive)</option>
        </select>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Investment Time Horizon (months)
        </label>
        <input
          type="number"
          name="time_horizon_months"
          value={formData.time_horizon_months}
          onChange={handleChange}
          min="1"
          max="360"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        borderRadius: '0.5rem',
        border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
      }}>
        <input
          type="checkbox"
          name="wants_micro_invest"
          checked={formData.wants_micro_invest}
          onChange={handleChange}
          style={{
            width: '1rem',
            height: '1rem',
            marginRight: '0.75rem',
            cursor: 'pointer'
          }}
        />
        <label style={{
          fontSize: '0.875rem',
          color: isDarkMode ? '#e5e7eb' : '#4b5563',
          cursor: 'pointer'
        }}>
          Enable Micro-Investments
        </label>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#111',
          marginBottom: '0.5rem'
        }}>
          Expected Inflation Rate
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="range"
            name="inflation_rate"
            min={3}
            max={10}
            step={0.1}
            value={formData.inflation_rate}
            onChange={handleChange}
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: 60, fontWeight: 500 }}>{formData.inflation_rate}%</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
          Adjust the expected average inflation rate for your plan (default: 6%).
        </div>
      </div>

      <button
        type="submit"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
          color: '#ffffff',
          borderRadius: '0.5rem',
          border: 'none',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          ':hover': {
            backgroundColor: isDarkMode ? '#2563eb' : '#1d4ed8'
          }
        }}
      >
        Get Recommendations
      </button>
    </form>
  );
};

export default InvestmentProfileForm; 
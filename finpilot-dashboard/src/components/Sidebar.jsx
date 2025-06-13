import { Link, useLocation } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(true);

  const navItem = (to, label, icon, isSubItem = false) => (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        marginBottom: '0.5rem',
        transition: 'all 0.2s ease',
        backgroundColor: pathname === to 
          ? (isDarkMode ? '#3b82f6' : '#1e40af')
          : 'transparent',
        color: pathname === to 
          ? 'white' 
          : (isDarkMode ? '#e5e7eb' : '#4b5563'),
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: pathname === to ? '500' : '400',
        marginLeft: isSubItem ? '1.5rem' : '0',
      }}
    >
      <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>{icon}</span>
      {label}
    </Link>
  );

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '16rem',
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderRight: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        padding: '1.5rem',
        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: isDarkMode ? '#60a5fa' : '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.75rem' }}>🚀</span>
            FinPilot X
          </h1>
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDarkMode ? '#e5e7eb' : '#4b5563',
              transition: 'all 0.2s ease'
            }}
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
      </div>
      
      <nav style={{ 
        padding: '0 1rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {navItem("/", "Dashboard", "📊")}
        <div>
          <button
            onClick={() => setIsTransactionsOpen(!isTransactionsOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem',
              transition: 'all 0.2s ease',
              backgroundColor: pathname.startsWith('/transactions')
                ? (isDarkMode ? '#3b82f6' : '#1e40af')
                : 'transparent',
              color: pathname.startsWith('/transactions')
                ? 'white'
                : (isDarkMode ? '#e5e7eb' : '#4b5563'),
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: pathname.startsWith('/transactions') ? '500' : '400',
            }}
          >
            <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>💳</span>
            Transactions
            <span style={{ 
              marginLeft: 'auto',
              transform: isTransactionsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </button>
          {isTransactionsOpen && (
            <div style={{ marginBottom: '0.5rem' }}>
              {navItem("/transactions", "All Transactions", "📝", true)}
              {navItem("/transactions/classifier", "Spending Classifier", "🏷️", true)}
            </div>
          )}
        </div>
        {navItem("/goals", "Financial Goals", "🎯")}
        {navItem("/insights", "Analytics", "📈")}
      </nav>

      <div style={{
        padding: '1.5rem',
        borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        marginTop: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          borderRadius: '0.5rem'
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            backgroundColor: isDarkMode ? '#3b82f6' : '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600'
          }}>
            👤
          </div>
          <div>
            <div style={{ 
              fontWeight: '500', 
              color: isDarkMode ? '#e5e7eb' : '#1f2937' 
            }}>
              User Name
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: isDarkMode ? '#9ca3af' : '#6b7280' 
            }}>
              Premium Plan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

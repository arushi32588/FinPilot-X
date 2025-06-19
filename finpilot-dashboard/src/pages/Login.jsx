import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDarkMode ? '#111827' : '#f9fafb',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: isDarkMode ? '#1f2937' : '#fff',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <h2 style={{
          color: isDarkMode ? '#e5e7eb' : '#1f2937',
          fontWeight: 700,
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
        }}>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
            background: isDarkMode ? '#111827' : '#f3f4f6',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '1rem',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
            background: isDarkMode ? '#111827' : '#f3f4f6',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '1rem',
          }}
        />
        {error && <div style={{ color: '#ef4444', fontSize: '0.95rem' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          padding: '0.75rem 1.5rem',
          background: isDarkMode ? '#3b82f6' : '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div style={{ fontSize: '0.95rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          Don&apos;t have an account? <Link to="/register" style={{ color: isDarkMode ? '#60a5fa' : '#2563eb' }}>Register</Link>
        </div>
      </form>
    </div>
  );
};

export default Login; 
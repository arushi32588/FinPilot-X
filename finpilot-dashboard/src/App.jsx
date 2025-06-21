import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import TopNav from './components/Sidebar';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import SpendingClassifierPage from './pages/SpendingClassifierPage';
import IncomeAnalyzerPage from './pages/IncomeAnalyzerPage';
import ExplainerPage from './pages/ExplainerPage';
import InvestmentRecommenderPage from './pages/InvestmentRecommenderPage';
import { ThemeProvider } from './context/ThemeContext';
import IncomeSummary from './pages/IncomeSummary';
import LibraryPage from './pages/LibraryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AgentDock from './components/agents/AgentDock';
import PixarStyleAgents from './components/agents/characters/AgentFigurines';
import './App.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

const AppContent = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-background font-sans text-gray-100 flex flex-col">
      {/* TopNav (hidden on login/register) */}
      {!hideNav && <TopNav />}
      {/* Main content area */}
      <div className="flex-1 w-full h-full">
        <main className="w-full h-full pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/income/summary" element={<PrivateRoute><IncomeSummary /></PrivateRoute>} />
            <Route path="/income/analyzer" element={<PrivateRoute><IncomeAnalyzerPage /></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
            <Route path="/transactions/classifier" element={<PrivateRoute><SpendingClassifierPage /></PrivateRoute>} />
            <Route path="/explainer" element={<PrivateRoute><ExplainerPage /></PrivateRoute>} />
            <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
            <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
            <Route path="/investments" element={<PrivateRoute><InvestmentRecommenderPage /></PrivateRoute>} />
            <Route path="/library" element={<PrivateRoute><LibraryPage /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
      
      {/* Agent Dock - only show on authenticated pages */}
      {!hideNav && <PixarStyleAgents />}
    </div>
  );
};

// PrivateRoute wrapper
function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);
  if (user === undefined) return null; // or a loading spinner
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

import Sidebar from './components/Sidebar';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import SpendingClassifierPage from './pages/SpendingClassifierPage';
import IncomeAnalyzerPage from './pages/IncomeAnalyzerPage';
import ExplainerPage from './pages/ExplainerPage';
import InvestmentRecommenderPage from './pages/InvestmentRecommenderPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import IncomeSummary from './pages/IncomeSummary';
import Library from './components/Library';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const AppContent = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const hideSidebar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container" style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
      display: 'flex',
      width: '100%'
    }}>
      {!hideSidebar && <Sidebar />}
      <div className="main-content" style={{ 
        flex: 1,
        marginLeft: hideSidebar ? 0 : '16rem',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <main style={{ 
          padding: '2rem',
          backgroundColor: isDarkMode ? '#111827' : '#f9fafb'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/income/summary" element={<IncomeSummary />} />
            <Route path="/income/analyzer" element={<IncomeAnalyzerPage />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/classifier" element={<SpendingClassifierPage />} />
            <Route path="/explainer" element={<ExplainerPage />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/investments" element={<InvestmentRecommenderPage />} />
            <Route path="/library" element={<Library />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

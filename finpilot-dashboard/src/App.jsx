import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import SpendingClassifierPage from './pages/SpendingClassifierPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent = () => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#111827' : '#f9fafb'
    }}>
      <Sidebar />
      <div style={{ marginLeft: '16rem' }}>
        <main style={{ 
          padding: '2rem',
          backgroundColor: isDarkMode ? '#111827' : '#f9fafb'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/classifier" element={<SpendingClassifierPage />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/insights" element={<Insights />} />
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

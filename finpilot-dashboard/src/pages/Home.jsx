import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: isDarkMode ? '#f3f4f6' : '#1f2937'
      }}>
        Welcome to FinPilot X
      </h2>
      <p style={{
        color: isDarkMode ? '#9ca3af' : '#4b5563'
      }}>
        Use the sidebar to navigate through your finance dashboard.
      </p>
    </div>
  );
};

export default Home;
  
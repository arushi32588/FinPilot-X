import { useTheme } from '../context/ThemeContext';

const Insights = () => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: isDarkMode ? '#f3f4f6' : '#1f2937'
      }}>
        Analytics & Insights
      </h1>
    </div>
  );
};

export default Insights;
  
import { useTheme } from '../context/ThemeContext';

const IncomeSummary = () => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      padding: '2rem',
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    }}>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: '700',
        marginBottom: '1.5rem',
        color: isDarkMode ? '#f3f4f6' : '#1f2937'
      }}>
        Income Summary
      </h1>
      {/* Add transactions list or other content here */}
    </div>
  );
};

export default IncomeSummary; 
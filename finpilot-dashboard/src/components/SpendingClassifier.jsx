import React, { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import Papa from 'papaparse';

const SpendingClassifier = () => {
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState([{ date: '', amount: '', description: '', merchant: '' }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const addTransaction = () => {
    setTransactions([...transactions, { date: '', amount: '', description: '', merchant: '' }]);
  };

  const removeTransaction = (index) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  const updateTransaction = (index, field, value) => {
    const newTransactions = [...transactions];
    newTransactions[index] = { ...newTransactions[index], [field]: value };
    setTransactions(newTransactions);
  };

  const handleCSVUpload = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedTransactions = results.data.map(row => ({
          date: row.date || '',
          amount: row.amount || '',
          description: row.description || '',
          merchant: row.merchant || ''
        }));
        setTransactions(parsedTransactions);
      },
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
      }
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleCSVUpload(file);
    } else {
      setError('Please upload a CSV file');
    }
  }, [handleCSVUpload]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleCSVUpload(file);
    }
  }, [handleCSVUpload]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Starting classification for transactions:', transactions);
      
      // Validate input
      const validTransactions = transactions.filter(t => t.description.trim());
      if (validTransactions.length === 0) {
        throw new Error('Please enter at least one transaction description');
      }
      
      console.log('Valid transactions to classify:', validTransactions);

      const response = await fetch('/api/classify-spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: validTransactions }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('JSON parse error:', e, 'Response text:', text);
        throw new Error('Invalid JSON response from server');
      }
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to classify transactions');
      }

      setResults(data);
      console.log('Classification results set:', data);
    } catch (err) {
      console.error('Classification error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem'
    }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        marginBottom: '1rem',
        color: isDarkMode ? '#e5e7eb' : '#1f2937'
      }}>
        Spending Classifier
      </h2>

      {/* CSV Upload Section */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          marginBottom: '1.5rem',
          padding: '2rem',
          border: `2px dashed ${isDragging ? (isDarkMode ? '#3b82f6' : '#2563eb') : (isDarkMode ? '#374151' : '#e5e7eb')}`,
          borderRadius: '0.5rem',
          backgroundColor: isDragging ? (isDarkMode ? '#1e3a8a' : '#dbeafe') : 'transparent',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          style={{
            cursor: 'pointer',
            color: isDarkMode ? '#e5e7eb' : '#4b5563'
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>📁</span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            Drag and drop your CSV file here, or click to browse
          </div>
          <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
            CSV should have columns: date, amount, description, merchant (optional)
          </div>
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        {transactions.map((transaction, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
            borderRadius: '0.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: isDarkMode ? '#e5e7eb' : '#4b5563'
              }}>
                Date
              </label>
              <input
                type="date"
                value={transaction.date}
                onChange={(e) => updateTransaction(index, 'date', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#e5e7eb' : '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: isDarkMode ? '#e5e7eb' : '#4b5563'
              }}>
                Amount
              </label>
              <input
                type="number"
                value={transaction.amount}
                onChange={(e) => updateTransaction(index, 'amount', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#e5e7eb' : '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: isDarkMode ? '#e5e7eb' : '#4b5563'
              }}>
                Description
              </label>
              <input
                type="text"
                value={transaction.description}
                onChange={(e) => updateTransaction(index, 'description', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#e5e7eb' : '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: isDarkMode ? '#e5e7eb' : '#4b5563'
              }}>
                Merchant (Optional)
              </label>
              <input
                type="text"
                value={transaction.merchant}
                onChange={(e) => updateTransaction(index, 'merchant', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#e5e7eb' : '#1f2937'
                }}
              />
            </div>
            {transactions.length > 1 && (
              <button
                type="button"
                onClick={() => removeTransaction(index)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: isDarkMode ? '#ef4444' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-end'
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={addTransaction}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
              color: isDarkMode ? '#e5e7eb' : '#4b5563',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Add Transaction
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Classifying...' : 'Classify Transactions'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: isDarkMode ? '#991b1b' : '#fee2e2',
          color: isDarkMode ? '#fecaca' : '#991b1b',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {results && (
        <div style={{
          padding: '1rem',
          backgroundColor: isDarkMode ? '#064e3b' : '#d1fae5',
          color: isDarkMode ? '#a7f3d0' : '#065f46',
          borderRadius: '0.375rem'
        }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Classification Results</h3>
          <div style={{
            overflowX: 'auto',
            backgroundColor: isDarkMode ? '#0f766e' : '#ecfdf5',
            borderRadius: '0.375rem',
            padding: '0.5rem'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    borderBottom: `2px solid ${isDarkMode ? '#134e4a' : '#059669'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Transaction</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    borderBottom: `2px solid ${isDarkMode ? '#134e4a' : '#059669'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Category</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((result) => (
                  <tr key={result.id} style={{
                    borderBottom: `1px solid ${isDarkMode ? '#134e4a' : '#059669'}`
                  }}>
                    <td style={{
                      padding: '0.75rem',
                      color: isDarkMode ? '#a7f3d0' : '#065f46'
                    }}>{result.description}</td>
                    <td style={{
                      padding: '0.75rem',
                      color: isDarkMode ? '#a7f3d0' : '#065f46'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: isDarkMode ? '#134e4a' : '#059669',
                        color: isDarkMode ? '#a7f3d0' : '#ffffff',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {result.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingClassifier; 
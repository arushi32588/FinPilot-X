import React, { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import Papa from 'papaparse';

const IncomeAnalyzer = () => {
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState([{ 
    date: '', 
    amount: '', 
    type: 'Credit', 
    description: '', 
    account: '' 
  }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const addTransaction = () => {
    setTransactions([...transactions, { 
      date: '', 
      amount: '', 
      type: 'Credit', 
      description: '', 
      account: '' 
    }]);
  };

  const removeTransaction = (index) => {
    if (transactions.length <= 1) {
      setError('You must have at least one transaction');
      return;
    }
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  const updateTransaction = (index, field, value) => {
    const newTransactions = [...transactions];
    newTransactions[index] = { ...newTransactions[index], [field]: value };
    
    // Auto-adjust amount sign when type changes
    if (field === 'type' && newTransactions[index].amount) {
      const amount = parseFloat(newTransactions[index].amount) || 0;
      newTransactions[index].amount = value === 'Debit' 
        ? (-Math.abs(amount)).toString() 
        : Math.abs(amount).toString();
    }
    
    // Ensure amount matches type when amount changes
    if (field === 'amount' && newTransactions[index].type) {
      const amount = parseFloat(value) || 0;
      newTransactions[index].amount = newTransactions[index].type === 'Debit' 
        ? (-Math.abs(amount)).toString() 
        : Math.abs(amount).toString();
    }
    
    setTransactions(newTransactions);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Try DD-MM-YYYY format
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2) {
        const [day, month, year] = parts;
        return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Try MM/DD/YYYY format
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2) {
        const [month, day, year] = parts;
        return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Return empty string if format is unrecognized
    return '';
  };

  const handleCSVUpload = useCallback((file) => {
    setError(null);
    setLoading(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setLoading(false);
        
        if (results.errors.length > 0) {
          setError(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
          return;
        }

        const parsedTransactions = results.data
          .map(row => {
            // Normalize date
            const dateField = row.Date || row.date || '';
            const normalizedDate = parseDate(dateField);
            
            // Normalize amount and type
            const amountField = row.Amount || row.amount || '0';
            let amount = parseFloat(amountField.toString().replace(/[^0-9.-]/g, '')) || 0;
            
            // Determine type from type field or amount sign
            const typeField = (row.Type || row.type || '').toString().toLowerCase();
            let type = 'Credit';
            
            if (typeField.includes('debit') || amount < 0) {
              type = 'Debit';
              amount = Math.abs(amount);
            }
            
            return {
              date: normalizedDate,
              amount: type === 'Debit' ? (-amount).toString() : amount.toString(),
              type: type,
              description: (row.Description || row.description || '').toString().trim(),
              account: (row.Account || row.account || '').toString().trim()
            };
          })
          .filter(txn => txn.description && !isNaN(parseFloat(txn.amount)));

        if (parsedTransactions.length === 0) {
          setError('No valid transactions found in CSV');
          return;
        }

        setTransactions(parsedTransactions);
      },
      error: (error) => {
        setLoading(false);
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
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      handleCSVUpload(file);
    } else {
      setError('Please upload a valid CSV file');
    }
  }, [handleCSVUpload]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      handleCSVUpload(file);
    } else {
      setError('Please upload a valid CSV file');
    }
    e.target.value = ''; // Reset input to allow re-uploading same file
  }, [handleCSVUpload]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Prepare transactions for submission
      const validTransactions = transactions
        .filter(t => t.description.trim() && !isNaN(parseFloat(t.amount)))
        .map(t => ({
          ...t,
          date: t.date || new Date().toISOString().split('T')[0], // Default to today
          amount: parseFloat(t.amount),
          type: t.type || (parseFloat(t.amount) < 0 ? 'Debit' : 'Credit')
        }));

      if (validTransactions.length === 0) {
        throw new Error('Please enter at least one valid transaction with description and amount');
      }

      const response = await fetch('/api/analyze-income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: validTransactions }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to analyze income');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmountDisplay = (amount) => {
    const num = parseFloat(amount) || 0;
    return num < 0 ? -Math.abs(num) : Math.abs(num);
  };

  const getAmountColor = (amount) => {
    const num = parseFloat(amount) || 0;
    return num < 0 ? (isDarkMode ? '#ef4444' : '#dc2626') : (isDarkMode ? '#10b981' : '#059669');
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
        Income Analyzer
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
            Supported columns: Date, Amount, Type (Credit/Debit), Description, Account
          </div>
          {loading && (
            <div style={{ marginTop: '0.5rem', color: isDarkMode ? '#3b82f6' : '#2563eb' }}>
              Processing CSV file...
            </div>
          )}
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
            borderRadius: '0.5rem',
            position: 'relative'
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
                step="0.01"
                value={formatAmountDisplay(transaction.amount)}
                onChange={(e) => updateTransaction(index, 'amount', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: getAmountColor(transaction.amount)
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: isDarkMode ? '#e5e7eb' : '#4b5563'
              }}>
                Type
              </label>
              <select
                value={transaction.type}
                onChange={(e) => updateTransaction(index, 'type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#e5e7eb' : '#1f2937'
                }}
              >
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
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
                Account
              </label>
              <input
                type="text"
                value={transaction.account}
                onChange={(e) => updateTransaction(index, 'account', e.target.value)}
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
            <button
              type="button"
              onClick={() => removeTransaction(index)}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                width: '1.5rem',
                height: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? '#ef4444' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: 0
              }}
              title="Remove transaction"
            >
              ×
            </button>
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
            disabled={loading || transactions.length === 0}
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
            {loading ? 'Analyzing...' : 'Analyze Income'}
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
          <h3 style={{ 
            marginBottom: '1rem', 
            fontWeight: '600',
            color: isDarkMode ? '#a7f3d0' : '#065f46'
          }}>
            Income Analysis Results
          </h3>
          
          {/* Summary Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: isDarkMode ? '#047857' : '#10b981',
              borderRadius: '0.375rem',
              color: 'white'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Income</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                ${results.totalIncome?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: isDarkMode ? '#047857' : '#10b981',
              borderRadius: '0.375rem',
              color: 'white'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Average Income</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                ${results.averageIncome?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: isDarkMode ? '#047857' : '#10b981',
              borderRadius: '0.375rem',
              color: 'white'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Transactions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                {results.transactionCount || '0'}
              </div>
            </div>
          </div>

          {/* Income Breakdown */}
          <div style={{
            overflowX: 'auto',
            backgroundColor: isDarkMode ? '#047857' : '#ecfdf5',
            borderRadius: '0.375rem',
            padding: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{
              marginBottom: '0.5rem',
              color: isDarkMode ? '#a7f3d0' : '#065f46'
            }}>
              Income by Type
            </h4>
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
                    borderBottom: `2px solid ${isDarkMode ? '#065f46' : '#10b981'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Type</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    borderBottom: `2px solid ${isDarkMode ? '#065f46' : '#10b981'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Amount</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    borderBottom: `2px solid ${isDarkMode ? '#065f46' : '#10b981'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.incomeByType?.map((item) => (
                  <tr key={item.type} style={{
                    borderBottom: `1px solid ${isDarkMode ? '#065f46' : '#10b981'}`
                  }}>
                    <td style={{
                      padding: '0.75rem',
                      color: isDarkMode ? '#a7f3d0' : '#065f46'
                    }}>{item.type || 'Unknown'}</td>
                    <td style={{
                      padding: '0.75rem',
                      textAlign: 'right',
                      color: item.amount < 0 
                        ? (isDarkMode ? '#ef4444' : '#dc2626') 
                        : (isDarkMode ? '#a7f3d0' : '#065f46')
                    }}>${item.amount?.toFixed(2)}</td>
                    <td style={{
                      padding: '0.75rem',
                      textAlign: 'right',
                      color: isDarkMode ? '#a7f3d0' : '#065f46'
                    }}>{item.percentage?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transaction Details */}
          <div style={{
            overflowX: 'auto',
            backgroundColor: isDarkMode ? '#047857' : '#ecfdf5',
            borderRadius: '0.375rem',
            padding: '0.5rem'
          }}>
            <h4 style={{
              marginBottom: '0.5rem',
              color: isDarkMode ? '#a7f3d0' : '#065f46'
            }}>
              Transaction Details
            </h4>
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
                    borderBottom: `2px solid ${isDarkMode ? '#065f46' : '#10b981'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Date</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    borderBottom: `2px solid ${isDarkMode ? '#065f46' : '#10b981'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Amount</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    borderBottom: `2px solid ${isDarkMode ? '#065f46' : '#10b981'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Type</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    borderBottom: `2px solid ${isDarkMode ? '#065f46' : '#10b981'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Description</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    borderBottom: `2px solid ${isDarkMode ? '#065f46' : '#10b981'}`,
                    color: isDarkMode ? '#a7f3d0' : '#065f46'
                  }}>Account</th>
                </tr>
              </thead>
              <tbody>
                {results.transactions?.map((txn, index) => (
                  <tr key={index} style={{
                    borderBottom: `1px solid ${isDarkMode ? '#065f46' : '#10b981'}`
                  }}>
                    <td style={{
                      padding: '0.75rem',
                      color: isDarkMode ? '#a7f3d0' : '#065f46'
                    }}>{txn.date}</td>
                    <td style={{
                      padding: '0.75rem',
                      color: txn.amount < 0 
                        ? (isDarkMode ? '#ef4444' : '#dc2626') 
                        : (isDarkMode ? '#a7f3d0' : '#065f46')
                    }}>${txn.amount?.toFixed(2)}</td>
                    <td style={{
                      padding: '0.75rem',
                      color: isDarkMode ? '#a7f3d0' : '#065f46'
                    }}>{txn.type}</td>
                    <td style={{
                      padding: '0.75rem',
                      color: isDarkMode ? '#a7f3d0' : '#065f46'
                    }}>{txn.description}</td>
                    <td style={{
                      padding: '0.75rem',
                      color: isDarkMode ? '#a7f3d0' : '#065f46'
                    }}>{txn.account}</td>
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

export default IncomeAnalyzer;
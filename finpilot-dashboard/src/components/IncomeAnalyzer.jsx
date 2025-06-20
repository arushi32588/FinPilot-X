import React, { useState, useCallback } from 'react';
import { FaCalendarAlt, FaRupeeSign, FaExchangeAlt, FaFileCsv, FaRegFileAlt, FaTrashAlt, FaUser, FaWallet } from 'react-icons/fa';
import Papa from 'papaparse';

const IncomeAnalyzer = () => {
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
  const [success, setSuccess] = useState(null);

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
    if (field === 'type' && newTransactions[index].amount) {
      const amount = parseFloat(newTransactions[index].amount) || 0;
      newTransactions[index].amount = value === 'Debit' 
        ? (-Math.abs(amount)).toString() 
        : Math.abs(amount).toString();
    }
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
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2) {
        const [day, month, year] = parts;
        return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2) {
        const [month, day, year] = parts;
        return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
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
            const dateField = row.Date || row.date || '';
            const normalizedDate = parseDate(dateField);
            const amountField = row.Amount || row.amount || '0';
            let amount = parseFloat(amountField.toString().replace(/[^0-9.-]/g, '')) || 0;
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
        setSuccess('CSV uploaded and parsed successfully!');
        setTimeout(() => setSuccess(null), 2000);
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
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))){
      handleCSVUpload(file);
    } else {
      setError('Please upload a valid CSV file');
    }
  }, [handleCSVUpload]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))){
      handleCSVUpload(file);
    } else {
      setError('Please upload a valid CSV file');
    }
    e.target.value = '';
  }, [handleCSVUpload]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const validTransactions = transactions
        .filter(t => t.description.trim() && !isNaN(parseFloat(t.amount)))
        .map(t => ({
          ...t,
          date: t.date || new Date().toISOString().split('T')[0],
          amount: parseFloat(t.amount),
          type: t.type || (parseFloat(t.amount) < 0 ? 'Debit' : 'Credit')
        }));
      if (validTransactions.length === 0) {
        throw new Error('Please enter at least one valid transaction with description and amount');
      }
      const response = await fetch('/api/analyze-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Glassy Card & Heading */}
      <div className="mb-8 rounded-2xl bg-background-glass/90 border-2 border-fuchsia-500/40 shadow-2xl px-8 py-8 flex flex-col items-center" style={{
        borderRadius: '2.5rem 1.5rem 2.5rem 1.5rem / 2rem 2.5rem 1.5rem 2.5rem',
        boxShadow: '0 8px 32px 0 #a21caf44, 0 0 0 2px #d946ef33 inset',
        background: 'rgba(36,33,44,0.92)',
      }}>
        <span className="text-3xl font-extrabold tracking-wide animate-logo-gradient bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 select-none" style={{
          textShadow: '0 0 12px #d946ef, 0 0 32px #a21caf',
          letterSpacing: '0.04em',
          backgroundSize: '200% 200%',
          animation: 'logo-gradient 3s linear infinite',
        }}>
          <FaWallet className="inline-block mr-2 text-fuchsia-400" /> Income Analyzer
        </span>
        <h2 className="text-lg font-bold mb-2 text-fuchsia-200">Analyze your income and see a breakdown by type</h2>
      </div>
      {/* CSV Upload Section */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`transition-all duration-300 mb-8 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-background-glass/70 shadow-xl relative cursor-pointer ${isDragging ? 'border-fuchsia-400 bg-fuchsia-900/20 animate-pulse-glow' : 'border-fuchsia-500/30'}`}
        style={{ minHeight: 140 }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer py-6">
          <FaFileCsv className="text-4xl mb-2 text-fuchsia-400 drop-shadow-glow" />
          <span className="font-semibold text-fuchsia-200 mb-1">Drag and drop your CSV file here, or click to browse</span>
          <span className="text-xs text-fuchsia-200/70">Supported: Date, Amount, Type, Description, Account</span>
          {loading && <span className="mt-2 text-fuchsia-400 animate-pulse">Processing CSV file...</span>}
        </label>
        {success && <div className="absolute top-2 right-2 bg-emerald-700/80 text-emerald-100 px-3 py-1 rounded-full text-xs animate-fadein shadow-lg">{success}</div>}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 w-full text-center text-fuchsia-300 bg-fuchsia-900/30 rounded-xl py-2 px-4 animate-fadein shadow-lg" style={{fontSize: '0.95rem'}}>{error}</div>
      )}

      {/* Transaction Form */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 mb-6">
          {transactions.map((transaction, index) => (
            <div key={index} className="relative flex flex-col gap-4 bg-background-glass/80 border-2 border-fuchsia-500/20 rounded-2xl shadow-lg px-6 py-6 backdrop-blur-xl transition-all group">
              {/* First row: Date, Amount, Type */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Date */}
                <div className="relative flex-1 min-w-[180px] flex flex-col gap-1">
                  <label className="text-fuchsia-200 text-sm font-semibold mb-1 ml-2" htmlFor={`date-${index}`}>Date</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
                    <input
                      id={`date-${index}`}
                      type="date"
                      value={transaction.date}
                      onChange={(e) => updateTransaction(index, 'date', e.target.value)}
                      className="w-full pl-10 pr-2 py-3 rounded-full bg-background-glass/60 border border-fuchsia-400/20 text-fuchsia-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-base shadow-inner placeholder:text-fuchsia-200/60"
                      style={{backdropFilter: 'blur(8px)'}}
                    />
                  </div>
                </div>
                {/* Amount */}
                <div className="relative flex-1 min-w-[180px] flex flex-col gap-1">
                  <label className="text-fuchsia-200 text-sm font-semibold mb-1 ml-2" htmlFor={`amount-${index}`}>Amount</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
                    <input
                      id={`amount-${index}`}
                      type="number"
                      step="0.01"
                      value={formatAmountDisplay(transaction.amount)}
                      onChange={(e) => updateTransaction(index, 'amount', e.target.value)}
                      required
                      placeholder="e.g. 5000"
                      className="w-full pl-10 pr-2 py-4 rounded-full bg-background-glass/60 border border-fuchsia-400/20 text-fuchsia-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-lg shadow-inner placeholder:text-fuchsia-200/60"
                      style={{backdropFilter: 'blur(8px)'}}
                    />
                  </div>
                </div>
                {/* Type */}
                <div className="relative flex-1 min-w-[180px] flex flex-col gap-1">
                  <label className="text-fuchsia-200 text-sm font-semibold mb-1 ml-2" htmlFor={`type-${index}`}>Type</label>
                  <div className="relative">
                    <FaExchangeAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
                    <select
                      id={`type-${index}`}
                      value={transaction.type}
                      onChange={(e) => updateTransaction(index, 'type', e.target.value)}
                      className="w-full pl-10 pr-2 py-3 rounded-full bg-background-glass/60 border border-fuchsia-400/20 text-fuchsia-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-base shadow-inner"
                      style={{backdropFilter: 'blur(8px)'}}
                    >
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Second row: Description, Account */}
              <div className="flex flex-col md:flex-row gap-4 w-full mt-2">
                {/* Description */}
                <div className="relative flex-1 min-w-[220px] flex flex-col gap-1">
                  <label className="text-fuchsia-200 text-sm font-semibold mb-1 ml-2" htmlFor={`desc-${index}`}>Description</label>
                  <div className="relative">
                    <FaRegFileAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
                    <input
                      id={`desc-${index}`}
                      type="text"
                      value={transaction.description}
                      onChange={(e) => updateTransaction(index, 'description', e.target.value)}
                      required
                      placeholder="e.g. Salary, Gift"
                      className="w-full pl-10 pr-2 py-4 rounded-full bg-background-glass/60 border border-fuchsia-400/20 text-fuchsia-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-lg shadow-inner placeholder:text-fuchsia-200/60"
                      style={{backdropFilter: 'blur(8px)'}}
                    />
                  </div>
                </div>
                {/* Account */}
                <div className="relative flex-1 min-w-[220px] flex flex-col gap-1">
                  <label className="text-fuchsia-200 text-sm font-semibold mb-1 ml-2" htmlFor={`acct-${index}`}>Account</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
                    <input
                      id={`acct-${index}`}
                      type="text"
                      value={transaction.account}
                      onChange={(e) => updateTransaction(index, 'account', e.target.value)}
                      placeholder="e.g. Bank, Wallet"
                      className="w-full pl-10 pr-2 py-4 rounded-full bg-background-glass/60 border border-fuchsia-400/20 text-fuchsia-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-lg shadow-inner placeholder:text-fuchsia-200/60"
                      style={{backdropFilter: 'blur(8px)'}}
                    />
                  </div>
                </div>
              </div>
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeTransaction(index)}
                className="absolute -top-2 -right-2 bg-fuchsia-700 hover:bg-fuchsia-900 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg transition-all border-2 border-fuchsia-300/40"
                title="Remove transaction"
              >
                <FaTrashAlt className="text-xs" />
              </button>
            </div>
          ))}
        </div>
        {/* Add/Analyze Buttons */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            type="button"
            onClick={addTransaction}
            className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-fuchsia-600 to-indigo-500 border-2 border-fuchsia-400/40 text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all animate-pulse-glow"
            style={{letterSpacing: '0.03em'}}
          >
            Add Transaction
          </button>
          <button
            type="submit"
            disabled={loading || transactions.length === 0}
            className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-fuchsia-600 to-indigo-500 border-2 border-fuchsia-400/40 text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed"
            style={{letterSpacing: '0.03em'}}
          >
            {loading ? 'Analyzing...' : 'Analyze Income'}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {results && (
        <div className="mt-8 animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl bg-gradient-to-br from-fuchsia-700/80 to-indigo-800/80 p-6 text-white shadow-xl flex flex-col items-center">
              <div className="text-xs mb-1">Total Income</div>
              <div className="text-2xl font-bold drop-shadow-glow">₹{results.totalIncome?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-fuchsia-700/80 to-indigo-800/80 p-6 text-white shadow-xl flex flex-col items-center">
              <div className="text-xs mb-1">Average Income</div>
              <div className="text-2xl font-bold drop-shadow-glow">₹{results.averageIncome?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-fuchsia-700/80 to-indigo-800/80 p-6 text-white shadow-xl flex flex-col items-center">
              <div className="text-xs mb-1">Transactions</div>
              <div className="text-2xl font-bold drop-shadow-glow">{results.transactionCount || '0'}</div>
            </div>
          </div>
          {/* Income Breakdown Table */}
          <div className="overflow-x-auto rounded-2xl bg-background-glass/80 shadow-xl mb-8 p-4">
            <h4 className="mb-2 text-fuchsia-200 font-semibold">Income by Type</h4>
            <table className="w-full text-sm text-fuchsia-100">
              <thead>
                <tr className="border-b border-fuchsia-400/30">
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.incomeByType?.map((item) => (
                  <tr key={item.type} className="border-b border-fuchsia-400/10">
                    <td className="py-2">{item.type || 'Unknown'}</td>
                    <td className={`py-2 text-right ${item.amount < 0 ? 'text-fuchsia-400' : 'text-emerald-300'}`}>₹{item.amount?.toFixed(2)}</td>
                    <td className="py-2 text-right">{item.percentage?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Transaction Details Table */}
          <div className="overflow-x-auto rounded-2xl bg-background-glass/80 shadow-xl p-4">
            <h4 className="mb-2 text-fuchsia-200 font-semibold">Transaction Details</h4>
            <table className="w-full text-sm text-fuchsia-100">
              <thead>
                <tr className="border-b border-fuchsia-400/30">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-left">Account</th>
                </tr>
              </thead>
              <tbody>
                {results.transactions?.map((txn, index) => (
                  <tr key={index} className="border-b border-fuchsia-400/10">
                    <td className="py-2">{txn.date}</td>
                    <td className={`py-2 ${txn.amount < 0 ? 'text-fuchsia-400' : 'text-emerald-300'}`}>₹{txn.amount?.toFixed(2)}</td>
                    <td className="py-2">{txn.type}</td>
                    <td className="py-2">{txn.description}</td>
                    <td className="py-2">{txn.account}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <style>{`
        .drop-shadow-glow {
          text-shadow: 0 0 8px #d946ef, 0 0 16px #a21caf;
        }
        .bg-background-glass { background: rgba(36,33,44,0.92); }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2.2s infinite;
        }
        .animate-fadein {
          animation: fadein 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

export default IncomeAnalyzer;
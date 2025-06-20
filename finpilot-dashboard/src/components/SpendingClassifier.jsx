import React, { useState, useCallback } from 'react';
import { FaCalendarAlt, FaRupeeSign, FaRegFileAlt, FaBuilding, FaFileCsv, FaTrashAlt, FaChartPie } from 'react-icons/fa';
import Papa from 'papaparse';

const SpendingClassifier = () => {
  const [transactions, setTransactions] = useState([{ date: '', amount: '', description: '', merchant: '' }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [success, setSuccess] = useState(null);

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
    setError(null);
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setLoading(false);
        const parsedTransactions = results.data.map(row => ({
          date: row.date || '',
          amount: row.amount || '',
          description: row.description || '',
          merchant: row.merchant || ''
        }));
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
    // Simulate classification result for demo
    setTimeout(() => {
      setResults({
        classified: transactions.map((t, i) => ({
          ...t,
          category: ['Food', 'Shopping', 'Bills', 'Other'][i % 4],
          amount: parseFloat(t.amount) || 0
        }))
      });
      setLoading(false);
    }, 1200);
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
          <FaChartPie className="inline-block mr-2 text-fuchsia-400" /> Spending Classifier
        </span>
        <h2 className="text-lg font-bold mb-2 text-fuchsia-200">Classify your spending by category</h2>
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
          <span className="text-xs text-fuchsia-200/70">Supported: Date, Amount, Description, Merchant</span>
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
              {/* First row: Date, Amount */}
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
                      placeholder="e.g. 500"
                      className="w-full pl-10 pr-2 py-4 rounded-full bg-background-glass/60 border border-fuchsia-400/20 text-fuchsia-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-lg shadow-inner placeholder:text-fuchsia-200/60"
                      style={{backdropFilter: 'blur(8px)'}}
                    />
                  </div>
                </div>
              </div>
              {/* Second row: Description, Merchant */}
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
                      placeholder="e.g. Food, Shopping"
                      className="w-full pl-10 pr-2 py-4 rounded-full bg-background-glass/60 border border-fuchsia-400/20 text-fuchsia-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-400/60 transition-all text-lg shadow-inner placeholder:text-fuchsia-200/60"
                      style={{backdropFilter: 'blur(8px)'}}
                    />
                  </div>
                </div>
                {/* Merchant */}
                <div className="relative flex-1 min-w-[220px] flex flex-col gap-1">
                  <label className="text-fuchsia-200 text-sm font-semibold mb-1 ml-2" htmlFor={`merchant-${index}`}>Merchant</label>
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
                    <input
                      id={`merchant-${index}`}
                      type="text"
                      value={transaction.merchant}
                      onChange={(e) => updateTransaction(index, 'merchant', e.target.value)}
                      placeholder="e.g. Swiggy, Amazon"
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
            style={{letterSpacing: '0.03em'}}>
            Add Transaction
          </button>
          <button
            type="submit"
            disabled={loading || transactions.length === 0}
            className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-fuchsia-600 to-indigo-500 border-2 border-fuchsia-400/40 text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed"
            style={{letterSpacing: '0.03em'}}>
            {loading ? 'Classifying...' : 'Classify Spending'}
          </button>
        </div>
      </form>
      {/* Results Section */}
      {results && (
        <div className="mt-8 animate-fadein">
          <div className="overflow-x-auto rounded-2xl bg-background-glass/80 shadow-xl p-4">
            <h4 className="mb-2 text-fuchsia-200 font-semibold">Classified Transactions</h4>
            <table className="w-full text-sm text-fuchsia-100">
              <thead>
                <tr className="border-b border-fuchsia-400/30">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-left">Merchant</th>
                  <th className="py-2 text-left">Category</th>
                </tr>
              </thead>
              <tbody>
                {results.classified.map((txn, index) => (
                  <tr key={index} className="border-b border-fuchsia-400/10">
                    <td className="py-2">{txn.date}</td>
                    <td className="py-2">₹{txn.amount?.toFixed(2)}</td>
                    <td className="py-2">{txn.description}</td>
                    <td className="py-2">{txn.merchant}</td>
                    <td className="py-2">{txn.category}</td>
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
        @keyframes logo-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-logo-gradient {
          background-size: 200% 200%;
          animation: logo-gradient 3s linear infinite;
        }
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

export default SpendingClassifier; 
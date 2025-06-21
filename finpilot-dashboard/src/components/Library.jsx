import React, { useEffect, useState } from 'react';
import config from '../config';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Library = () => {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchLibrary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/investment-recommender/library?user_id=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch library');
        }
        const data = await response.json();
        setRawData(data);
        if (Array.isArray(data)) {
          setLibrary(data);
        } else {
          setError('Unexpected data format from backend.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [user]);

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Please log in to view your library.</div>;
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your library...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>{error}
    {rawData && <pre style={{textAlign:'left',margin:'1rem auto',maxWidth:600,overflow:'auto',background:'#f3f4f6',padding:'1rem',borderRadius:8}}>{JSON.stringify(rawData, null, 2)}</pre>}
  </div>;

  if (library.length > 0 && (!library[0].recommendation || !library[0].timestamp)) {
    return <div style={{ padding: '2rem', color: 'orange', textAlign: 'center' }}>
      Unexpected data structure from backend. Please show this to your developer.<br/>
      <pre style={{textAlign:'left',margin:'1rem auto',maxWidth:600,overflow:'auto',background:'#f3f4f6',padding:'1rem',borderRadius:8}}>{JSON.stringify(library, null, 2)}</pre>
    </div>;
  }

  return (
    <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>My Saved Recommendations</h2>
      {library.length === 0 ? (
        <div style={{ fontSize: '1.25rem', color: '#6b7280', textAlign: 'center' }}>
          You have not saved any recommendations yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {library.map((entry, idx) => {
            const rec = entry.recommendation || {};
            return (
              <div key={idx} style={{
                background: '#f3f4f6',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
              }}>
                <div style={{ marginBottom: '0.5rem', color: '#2563eb', fontWeight: 500 }}>
                  Saved on: {new Date(entry.timestamp).toLocaleString()}
                </div>
                {/* Central Summary */}
                {rec.central_summary && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Summary:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {Object.entries(rec.central_summary).map(([k, v]) => (
                        <li key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Portfolio */}
                {rec.recommended_portfolio && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Portfolio:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {rec.recommended_portfolio.map((fund, i) => (
                        <li key={i}>
                          {fund.name} ({fund.type}) - {fund.allocation} | Risk: {fund.risk_level} | Return: {fund.expected_return}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Micro-Investment Plan */}
                {rec.micro_investment_plan && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Micro-Investment Plan:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {Object.entries(rec.micro_investment_plan).map(([k, v]) => (
                        <li key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {Array.isArray(v) ? v.map((tip, j) => <div key={j}>{typeof tip === 'string' ? tip : tip.tip + (tip.description ? ` - ${tip.description}` : '')}</div>) : v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Growth Simulations */}
                {rec.growth_simulations && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Growth Simulations:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {Object.entries(rec.growth_simulations).map(([k, v]) => (
                        <li key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {typeof v === 'object' ? JSON.stringify(v) : v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Risk Analysis */}
                {rec.risk_analysis && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Risk Analysis:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {Object.entries(rec.risk_analysis).map(([k, v]) => (
                        <li key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {Array.isArray(v) ? v.join(', ') : v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Investment Tips */}
                {rec.investment_tips && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Investment Tips:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {rec.investment_tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Nudge */}
                {rec.nudge && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Nudge:</strong> {rec.nudge}
                  </div>
                )}
                {/* Gamification */}
                {rec.gamification && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Gamification:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {Object.entries(rec.gamification).map(([k, v]) => (
                        <li key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Library; 
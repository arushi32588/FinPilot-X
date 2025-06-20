import React, { useState, useEffect } from 'react';
import SavedRecommendationCard from '../components/SavedRecommendationCard';
import config from '../config';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const TABS = [
  { key: 'recommendations', label: 'Saved Recommendations', icon: '📊' },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        if (Array.isArray(data)) {
          setRecommendations(data);
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

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#0b0c10] via-[#18181b] to-[#2e1065]">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-background-glass/80 border-r border-fuchsia-400/20 shadow-xl backdrop-blur-xl flex flex-col py-8 px-4">
        <h2 className="text-2xl font-extrabold text-fuchsia-300 mb-8 tracking-wide">Library</h2>
        <nav className="flex flex-col gap-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl font-semibold text-lg transition-all duration-200 ${activeTab === tab.key ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-lg scale-105' : 'text-fuchsia-200 hover:bg-fuchsia-900/30'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-12 px-8 bg-transparent">
        {activeTab === 'recommendations' && (
          <div className="w-full max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-fuchsia-200 mb-6 flex items-center gap-2"><span>📊</span>Saved Recommendations</h3>
            {loading ? (
              <div className="rounded-2xl bg-background-glass/80 border border-fuchsia-400/10 shadow-lg p-8 text-fuchsia-100 text-lg text-center">Loading your saved recommendations...</div>
            ) : error ? (
              <div className="rounded-2xl bg-background-glass/80 border border-pink-400/20 shadow-lg p-8 text-pink-200 text-lg text-center">{error}</div>
            ) : !user ? (
              <div className="rounded-2xl bg-background-glass/80 border border-fuchsia-400/10 shadow-lg p-8 text-fuchsia-100 text-lg text-center">Please log in to view your library.</div>
            ) : recommendations.length === 0 ? (
              <div className="rounded-2xl bg-background-glass/80 border border-fuchsia-400/10 shadow-lg p-8 text-fuchsia-100 text-lg text-center">You have not saved any recommendations yet.</div>
            ) : (
              <div className="flex flex-col gap-8">
                {recommendations.map((rec, idx) => (
                  <SavedRecommendationCard key={rec.id || rec.timestamp || idx} recommendation={{
                    saved_at: rec.timestamp,
                    status: rec.status || 'AI generated',
                    ...rec
                  }} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 
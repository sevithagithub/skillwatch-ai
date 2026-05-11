import { useState, useEffect } from 'react';
import { getMatches } from '../services/api';

export default function JobMatcher() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatches()
      .then(r => {
        setMatches(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader">Analyzing market opportunities...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Job Matcher</h1>
        <p className="page-subtitle">Real-world opportunities based on your O*NET skill profile</p>
      </div>

      <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {matches.length === 0 ? (
          <div className="empty-state">No direct matches found. Try adding more skills to your profile.</div>
        ) : (
          matches.map(m => (
            <div key={m.soc} className="card match-card" style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              borderRadius: '16px', 
              padding: '24px', 
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'transform 0.2s',
              cursor: 'default'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#f1f5f9' }}>{m.job_title}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>SOC: {m.soc}</span>
                </div>
                <div style={{ 
                  background: m.automation_risk > 0.7 ? 'rgba(248, 113, 113, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  color: m.automation_risk > 0.7 ? '#f87171' : '#4ade80',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {m.automation_risk > 0.7 ? 'High Risk' : 'Low Risk'}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Fit Score</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{Math.round(m.fit_score * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                  <div style={{ 
                    width: `${m.fit_score * 100}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #38bdf8, #818cf8)', 
                    borderRadius: '3px' 
                  }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Matched Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {m.matched_skills.map(s => (
                    <span key={s} style={{ 
                      padding: '3px 8px', 
                      background: 'rgba(56, 189, 248, 0.1)', 
                      color: '#38bdf8', 
                      borderRadius: '4px', 
                      fontSize: '10px' 
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              {m.missing_skills.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Skills to Acquire</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {m.missing_skills.map(s => (
                      <span key={s} style={{ 
                        padding: '3px 8px', 
                        background: 'rgba(255,255,255,0.03)', 
                        color: '#64748b', 
                        borderRadius: '4px', 
                        fontSize: '10px' 
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

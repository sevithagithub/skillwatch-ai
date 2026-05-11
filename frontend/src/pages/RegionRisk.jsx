import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getRegions } from '../services/api';

export default function RegionRisk() {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    getRegions().then(r => setRegions(r.data || [])).catch(() => {});
  }, []);

  const chartData = regions.slice(0, 12).map(r => ({
    name: r.region.length > 12 ? r.region.substring(0, 12) + '..' : r.region,
    risk: r.high_risk_pct,
  }));

  const getColor = (pct) => pct >= 45 ? '#f87171' : pct >= 30 ? '#f59e0b' : '#00d4a1';

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9', marginBottom: 5 }}>Region Risk Dashboard</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Workforce vulnerability analysis by region — skills at risk of obsolescence.</div>

      {/* Bar chart */}
      <div className="panel">
        <div className="panel-title">High-Risk Workforce Percentage by Region</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: -10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 60]} />
            <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
              formatter={(val) => [`${val}%`, 'High Risk']} />
            <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={getColor(d.risk)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Region cards */}
      <div className="regions-grid">
        {regions.map((r, i) => (
          <div key={i} className="region-card">
            <div className="region-name">{r.region}</div>
            <div className="region-country">{r.country} · {r.dominant_sector} · {(r.workforce_size / 1000000).toFixed(1)}M workforce</div>
            <div className="region-pct" style={{ color: getColor(r.high_risk_pct) }}>{r.high_risk_pct}%</div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>high-risk workforce</div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 10 }}>
              <div style={{ height: '100%', width: `${r.high_risk_pct}%`, background: getColor(r.high_risk_pct), borderRadius: 2, transition: 'width 1s' }} />
            </div>
            <div className="dying-skills">
              {(r.primary_at_risk_skills || []).map((s, j) => <span key={j} className="dying-tag">{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

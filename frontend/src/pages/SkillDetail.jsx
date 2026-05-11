import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getSkillDetail, getForecast, getResources, getRelatedSkills } from '../services/api';

const RC = { Growing: '#00d4a1', Stable: '#60a5fa', 'At Risk': '#f59e0b', Dying: '#f87171' };

export default function SkillDetail({ skillName, onBack }) {
  const [skill, setSkill] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [resources, setResources] = useState([]);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!skillName) return;
    getSkillDetail(skillName).then(r => setSkill(r.data)).catch(() => {});
    getForecast(skillName).then(r => setForecast(r.data.demand_forecast || [])).catch(() => {});
    getResources(skillName).then(r => setResources(r.data?.slice(0, 6) || [])).catch(() => {});
    getRelatedSkills(skillName).then(r => setRelated(r.data?.related || [])).catch(() => {});
  }, [skillName]);

  if (!skill) return <div style={{ color: '#64748b', padding: 40 }}>Loading skill data...</div>;

  const color = RC[skill.risk] || '#60a5fa';
  const factors = skill.factors || {};

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: '#94a3b8', cursor: 'pointer', marginBottom: 20, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
        ← Back to Dashboard
      </button>

      <div className="skill-header">
        <h1 className="skill-name">{skill.name}</h1>
        <div className="skill-category">{skill.category}</div>
        <div className="risk-badge" style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}>{skill.risk} · SDI {skill.sdi?.toFixed(2)}</div>
        <p className="skill-desc">{skill.description}</p>
      </div>

      <div className="detail-grid">
        {/* SDI Factors */}
        <div className="panel">
          <div className="panel-title">SDI Factor Breakdown</div>
          {[
            { name: 'Demand Decline', val: factors.demand_decline, weight: '40%' },
            { name: 'Automation Risk', val: factors.automation_risk, weight: '30%' },
            { name: 'Market Oversupply', val: factors.oversupply, weight: '20%' },
            { name: 'Salary Stagnation', val: factors.salary_stagnation, weight: '10%' },
          ].map(f => (
            <div key={f.name} className="factor-row">
              <div className="factor-name">
                <span>{f.name}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{((f.val || 0) * 100).toFixed(0)}% (wt: {f.weight})</span>
              </div>
              <div className="factor-bar-wrap">
                <div className="factor-bar" style={{ width: `${(f.val || 0) * 100}%`, background: (f.val || 0) > 0.6 ? '#f87171' : (f.val || 0) > 0.3 ? '#f59e0b' : '#00d4a1' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Related Skills */}
        <div className="panel">
          <div className="panel-title">Related Skills & Transition Paths</div>
          {related.length > 0 ? related.map((r, i) => (
            <div key={i} className="reskill-card">
              <span style={{ color: '#00d4a1' }}>→</span> {r}
            </div>
          )) : <div style={{ fontSize: 12, color: '#475569' }}>No related skills found</div>}
        </div>
      </div>

      {/* Forecast */}
      <div className="panel">
        <div className="panel-title">Demand Forecast (ML Projected)</div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={forecast}>
            <defs><linearGradient id="dfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 10 }} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
              formatter={(val) => [val?.toLocaleString() + ' postings', 'Demand']}
              labelFormatter={(l) => `Year ${l}`} />
            <Area type="monotone" dataKey="value" stroke={color} fill="url(#dfg)" strokeWidth={2} dot={(props) => {
              const { cx, cy, payload } = props;
              return <circle cx={cx} cy={cy} r={payload.is_projected ? 4 : 3} fill={payload.is_projected ? '#f59e0b' : color} stroke="none" />;
            }} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <div className="legend-item"><div className="legend-dot" style={{ background: color }} /> Actual</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#f59e0b' }} /> Projected</div>
        </div>
      </div>

      {/* Resources */}
      {resources.length > 0 && (
        <div className="panel">
          <div className="panel-title">Top Learning Resources</div>
          {resources.map((r, i) => (
            <a key={i} className="resource-card" href={r.url} target="_blank" rel="noopener noreferrer">
              <div style={{ fontSize: 16 }}>{r.resource_type === 'course' ? '📚' : r.resource_type === 'book' ? '📖' : '💻'}</div>
              <div className="resource-info">
                <div className="resource-title">{r.title}</div>
                <div className="resource-meta">{r.platform} · {r.level} · ⭐ {r.rating}</div>
              </div>
              <div className={`resource-badge ${r.cost_type === 'free' || r.cost_type === 'free_audit' ? 'badge-free' : 'badge-paid'}`}>
                {r.cost_type === 'free' || r.cost_type === 'free_audit' ? 'FREE' : 'PAID'}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

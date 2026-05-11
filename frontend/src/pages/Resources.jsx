import { useState, useEffect } from 'react';
import { getResources } from '../services/api';

export default function Resources({ skills }) {
  const [selectedSkill, setSelectedSkill] = useState('Python');
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getResources(selectedSkill).then(r => setResources(r.data || [])).catch(() => setResources([]));
  }, [selectedSkill]);

  const filtered = filter === 'all' ? resources
    : filter === 'free' ? resources.filter(r => r.cost_type === 'free' || r.cost_type === 'free_audit')
    : filter === 'paid' ? resources.filter(r => r.cost_type === 'paid')
    : resources.filter(r => r.resource_type === filter);

  const skillNames = skills.map(s => s.name);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9', marginBottom: 5 }}>Learning Resources</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Curated books, courses, and practice platforms from trusted sources.</div>

      {/* Skill selector */}
      <div className="filter-row">
        {skillNames.map(s => (
          <button key={s} className={`filter-btn${selectedSkill === s ? ' active' : ''}`} onClick={() => setSelectedSkill(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="filter-row">
        {[['all','All'],['free','Free'],['paid','Paid'],['course','Courses'],['book','Books'],['practice','Practice']].map(([id,label]) => (
          <button key={id} className={`filter-btn${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* Resources list */}
      <div className="panel">
        <div className="panel-title">{selectedSkill} · {filtered.length} resources</div>
        {filtered.length === 0 && <div style={{ fontSize: 12, color: '#475569' }}>No resources found for this filter.</div>}
        {filtered.map((r, i) => (
          <a key={i} className="resource-card" href={r.url} target="_blank" rel="noopener noreferrer">
            <div style={{ fontSize: 18 }}>{r.resource_type === 'course' ? '📚' : r.resource_type === 'book' ? '📖' : '💻'}</div>
            <div className="resource-info">
              <div className="resource-title">{r.title}</div>
              <div className="resource-meta">
                {r.platform} · {r.level}{r.duration_hrs ? ` · ${r.duration_hrs}h` : ''} · ⭐ {r.rating}
              </div>
            </div>
            <div className={`resource-badge ${r.cost_type === 'free' || r.cost_type === 'free_audit' ? 'badge-free' : 'badge-paid'}`}>
              {r.cost_type === 'free' || r.cost_type === 'free_audit' ? 'FREE' : r.cost_type === 'freemium' ? 'FREEMIUM' : 'PAID'}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getResources } from '../services/api';

const ALTERNATIVES = {
  'Data Entry': ['Python', 'SQL', 'Generative AI', 'Power BI'],
  'Manual Testing': ['Selenium', 'Python', 'Kubernetes', 'DevOps'],
  'Excel': ['Power BI', 'SQL', 'Python', 'Data Engineering']
};

export default function Resources({ skills }) {
  // Default to the user's first skill, or 'Python' if none
  const skillNames = skills.map(s => s.name);
  const [selectedSkill, setSelectedSkill] = useState(skillNames[0] || 'Python');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Find detailed info about current skill
  const skillDetails = skills.find(s => s.name.toLowerCase() === selectedSkill.toLowerCase());
  const isObsolete = skillDetails?.risk === 'Dying' || skillDetails?.risk === 'At Risk' || ['Data Entry', 'Manual Testing', 'Excel'].includes(selectedSkill);

  // Update selectedSkill if skills list changes (e.g., after onboarding)
  useEffect(() => {
    if (skillNames.length > 0 && !skillNames.includes(selectedSkill)) {
      setSelectedSkill(skillNames[0]);
    }
  }, [skillNames.join(',')]);

  useEffect(() => {
    if (!selectedSkill) return;
    setLoading(true);
    setResources([]);
    getResources(selectedSkill)
      .then(r => setResources(r.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [selectedSkill]);

  const filtered = filter === 'all' ? resources
    : filter === 'free' ? resources.filter(r => r.cost_type === 'free' || r.cost_type === 'free_audit')
    : filter === 'paid' ? resources.filter(r => r.cost_type === 'paid')
    : resources.filter(r => r.resource_type === filter);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9', marginBottom: 5 }}>Learning Resources</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Curated books, courses, and practice platforms from trusted sources.</div>

      {/* Skill selector — all skills in the system */}
      <div className="filter-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {skillNames.map(s => (
          <button key={s} className={`filter-btn${selectedSkill === s ? ' active' : ''}`} onClick={() => { setSelectedSkill(s); setFilter('all'); }}>
            {s}
          </button>
        ))}
      </div>

      {/* Obsolete/Decline Warning Banner */}
      {isObsolete && (
        <div style={{
          background: 'rgba(248, 113, 113, 0.08)',
          border: '1px solid rgba(248, 113, 113, 0.25)',
          borderRadius: '12px',
          padding: '18px',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f87171', marginBottom: '4px' }}>
              Skill Obsolescence Alert: {selectedSkill} is Declining
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '10px' }}>
              This skill has been flagged by the AI engine as having a very high <strong>Skill Death Index (SDI)</strong> or high automation vulnerability. 
              New learning investments in traditional {selectedSkill} are highly deprecated by top employers as modern AI tools and automated pipelines absorb these workflows.
            </div>
            {ALTERNATIVES[selectedSkill] && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
                  💡 Future-Proof Reskilling Recommendations:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALTERNATIVES[selectedSkill].map(alt => (
                    <button 
                      key={alt} 
                      onClick={() => setSelectedSkill(alt)}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(0, 212, 161, 0.1)',
                        border: '1px solid rgba(0, 212, 161, 0.2)',
                        borderRadius: '20px',
                        fontSize: '11px',
                        color: '#00d4a1',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.target.style.background = 'rgba(0, 212, 161, 0.2)';
                        e.target.style.borderColor = '#00d4a1';
                      }}
                      onMouseLeave={e => {
                        e.target.style.background = 'rgba(0, 212, 161, 0.1)';
                        e.target.style.borderColor = 'rgba(0, 212, 161, 0.2)';
                      }}
                    >
                      {alt} →
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
        <div className="panel-title">{selectedSkill} · {filtered.length} resource{filtered.length !== 1 ? 's' : ''}</div>

        {loading && (
          <div style={{ fontSize: 13, color: '#475569', padding: '20px 0', textAlign: 'center' }}>
            ⏳ Loading resources...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ fontSize: 13, color: '#64748b', padding: '20px 0', textAlign: 'center' }}>
            No resources currently registered for {selectedSkill}.
            {isObsolete && (
              <div style={{ fontSize: '11px', marginTop: '6px', color: '#475569' }}>
                Traditional learning resources for obsolete skills are hidden or limited to prioritize future-proof learning.
              </div>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && filtered.map((r, i) => (
          <a key={i} className="resource-card" href={r.url} target="_blank" rel="noopener noreferrer">
            <div style={{ fontSize: 18 }}>
              {r.resource_type === 'course' ? '📚' : r.resource_type === 'book' ? '📖' : '💻'}
            </div>
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

import { useState, useEffect } from 'react';
import { getGraph } from '../services/api';

const RC = { Growing: '#00d4a1', Stable: '#60a5fa', 'At Risk': '#f59e0b', Dying: '#f87171' };

// Simple force-directed-ish layout positions
const POSITIONS = {
  'Python': { x: 340, y: 100 }, 'Machine Learning': { x: 160, y: 200 }, 'Data Analysis': { x: 500, y: 200 },
  'SQL': { x: 580, y: 100 }, 'Cloud Computing': { x: 80, y: 100 }, 'Power BI': { x: 600, y: 300 },
  'Excel': { x: 480, y: 340 }, 'Manual Testing': { x: 200, y: 340 }, 'Data Entry': { x: 340, y: 400 },
  'DevOps': { x: 80, y: 260 }, 'Photoshop': { x: 700, y: 200 }, 'Selenium': { x: 280, y: 260 },
  'Kubernetes': { x: 80, y: 180 }, 'Generative AI': { x: 160, y: 100 }, 'LLM Fine-tuning': { x: 240, y: 140 },
  'MLOps': { x: 100, y: 340 }, 'Data Engineering': { x: 460, y: 120 },
};

// SDI lookup
const SDI_DATA = {};

export default function SkillGraph({ skills, onSelectSkill }) {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getGraph().then(r => setGraph(r.data)).catch(() => {});
    skills.forEach(s => { SDI_DATA[s.name] = { sdi: s.sdi, risk: s.risk }; });
  }, [skills]);

  const W = 780, H = 460;

  const getPos = (id) => POSITIONS[id] || { x: Math.random() * 600 + 80, y: Math.random() * 300 + 80 };

  const focus = selected || hovered;
  const connectedNodes = focus ? new Set(
    graph.edges.filter(e => e.source === focus || e.target === focus).flatMap(e => [e.source, e.target])
  ) : null;

  const isHighlighted = (id) => !focus || id === focus || connectedNodes?.has(id);
  const isEdgeHighlighted = (s, t) => !focus || s === focus || t === focus;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9', marginBottom: 5 }}>Skill Graph</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Visualize skill relationships and career transition paths. Click a node to explore.</div>
      </div>

      <div className="graph-container" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <svg width={W} height={H} style={{ display: 'block' }}>
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          {/* Edges */}
          {graph.edges.map((e, i) => {
            const from = getPos(e.source), to = getPos(e.target);
            const hl = isEdgeHighlighted(e.source, e.target);
            return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={hl ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)'}
              strokeWidth={hl ? 1.5 : 0.5} />;
          })}

          {/* Nodes */}
          {graph.nodes.map(node => {
            const pos = getPos(node.id);
            const data = SDI_DATA[node.id] || { sdi: 0.5, risk: 'Stable' };
            const color = RC[data.risk] || '#60a5fa';
            const hl = isHighlighted(node.id);
            const isActive = node.id === selected;
            return (
              <g key={node.id} style={{ cursor: 'pointer', opacity: hl ? 1 : 0.2, transition: 'opacity 0.2s' }}
                onMouseEnter={() => setHovered(node.id)} onMouseLeave={() => setHovered(null)}
                onClick={() => { if (selected === node.id) { setSelected(null); onSelectSkill(node.id); } else setSelected(node.id); }}>
                <circle cx={pos.x} cy={pos.y} r={isActive ? 22 : 18} fill={`${color}22`} stroke={color}
                  strokeWidth={isActive ? 2.5 : 1.5} filter={isActive ? 'url(#glow)' : undefined} />
                <text x={pos.x} y={pos.y - 24} textAnchor="middle" fill={hl ? '#e2e8f0' : '#475569'}
                  fontSize={10} fontWeight={500} fontFamily="'DM Sans', sans-serif">{node.id}</text>
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={color}
                  fontSize={9} fontWeight={700} fontFamily="'Space Mono', monospace">{data.sdi?.toFixed(2)}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="graph-legend" style={{ marginTop: 12 }}>
        {Object.entries(RC).map(([label, color]) => (
          <div key={label} className="legend-item"><div className="legend-dot" style={{ background: color }} />{label}</div>
        ))}
      </div>

      {selected && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-title">Connected Skills from: {selected}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {graph.edges.filter(e => e.source === selected || e.target === selected).map((e, i) => {
              const target = e.source === selected ? e.target : e.source;
              return (
                <div key={i} className="reskill-card" onClick={() => onSelectSkill(target)}>
                  <span style={{ color: '#00d4a1' }}>→</span> {target}
                  <span style={{ fontSize: 9, color: '#475569', marginLeft: 'auto' }}>{e.relationship_type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

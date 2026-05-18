import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { getRecommendations, getForecast, getSkillDetail, getMatches } from '../services/api';

const RC = { Growing: '#00d4a1', Stable: '#60a5fa', 'At Risk': '#f59e0b', Dying: '#f87171' };
const TT = { background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' };
const RCOLORS = ['#60a5fa','#00d4a1','#f59e0b','#f87171','#a78bfa','#fb923c'];
import { INTERVIEW_DATA, ROADMAP_DATA, DEFAULT_ROADMAP } from '../data/skillResources';

function SDIRing({ sdi = 0, risk = 'Stable', size = 64 }) {
  const color = RC[risk] || '#60a5fa';
  const r = size / 2 - 7, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ*(1-sdi)} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 5px ${color})`, transition:'stroke-dashoffset 1s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:size>60?13:10, fontWeight:700, color, lineHeight:1 }}>{sdi.toFixed(2)}</span>
        <span style={{ fontSize:7, color:'#475569', textTransform:'uppercase' }}>SDI</span>
      </div>
    </div>
  );
}

function SkillCard({ skillName, onSelect }) {
  const [d, setD] = useState(null);
  useEffect(() => { getSkillDetail(skillName).then(r => setD(r.data)).catch(()=>{}); }, [skillName]);
  if (!d) return <div className="stat-card" style={{ opacity:0.4, minWidth:160 }}><div style={{ fontSize:12, color:'#475569' }}>{skillName}</div></div>;
  const color = RC[d.risk] || '#60a5fa';
  return (
    <div className="stat-card" onClick={() => onSelect(d.name)}
      style={{ cursor:'pointer', borderColor:`${color}33`, minWidth:160 }}
      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
      onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:4 }}>{d.name}</div>
          <div style={{ display:'inline-flex', padding:'2px 8px', borderRadius:12, background:`${color}18`, color, fontSize:9, fontWeight:700, fontFamily:"'Space Mono',monospace" }}>{d.risk}</div>
        </div>
        <SDIRing sdi={d.sdi} risk={d.risk} size={50}/>
      </div>
      {['automation_risk','demand_decline'].map(k => (
        <div key={k} style={{ marginTop:5 }}>
          <div style={{ fontSize:9, color:'#475569', marginBottom:2 }}>{k==='automation_risk'?'Automation':' Demand↓'} {((d.factors?.[k]||0)*100).toFixed(0)}%</div>
          <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
            <div style={{ height:'100%', width:`${(d.factors?.[k]||0)*100}%`, background:(d.factors?.[k]||0)>0.6?'#f87171':(d.factors?.[k]||0)>0.3?'#f59e0b':'#00d4a1', borderRadius:2 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── MULTI-SKILL FORECAST ──────────────────────────────── */
function MultiSkillForecast({ skillNames }) {
  const [forecasts, setForecasts] = useState({});
  const [sel, setSel] = useState(skillNames[0] || '');
  useEffect(() => {
    skillNames.forEach(n => getForecast(n).then(r => setForecasts(p => ({ ...p, [n]: r.data.demand_forecast || [] }))).catch(() => {}));
    if (skillNames[0]) setSel(skillNames[0]);
  }, [skillNames.join(',')]);
  const idx = skillNames.indexOf(sel);
  const color = RCOLORS[idx >= 0 ? idx % 6 : 0];
  return (
    <div className="panel">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div className="panel-title" style={{ marginBottom:0 }}>Skill Demand Forecast</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {skillNames.map((n,i) => <button key={n} onClick={() => setSel(n)} style={{ padding:'4px 12px', borderRadius:20, fontSize:11, cursor:'pointer', border:`1px solid ${sel===n?RCOLORS[i%6]:'rgba(255,255,255,0.1)'}`, background:sel===n?`${RCOLORS[i%6]}22`:'transparent', color:sel===n?RCOLORS[i%6]:'#64748b', transition:'all 0.15s' }}>{n}</button>)}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={forecasts[sel] || []}>
          <defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
          <XAxis dataKey="year" tick={{ fill:'#475569', fontSize:10 }}/><YAxis tick={{ fill:'#475569', fontSize:10 }}/>
          <Tooltip contentStyle={TT}/>
          <Area type="monotone" dataKey="value" stroke={color} fill="url(#gm)" strokeWidth={2}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── INTERVIEW PREP ────────────────────────────────────── */
function InterviewPrepPanel({ userSkillNames }) {
  const [sel, setSel] = useState(userSkillNames[0] || '');
  const [showAnswer, setShowAnswer] = useState({});
  const d = INTERVIEW_DATA[sel] || {
    questions: ['Research common advanced questions for '+sel, 'Review core architecture & concepts', 'Practice System Design on LeetCode / HackerRank', 'Prepare STAR behavioral answers', 'Deep dive into internals of ' + sel],
    companies: ['TCS','Infosys','Wipro','Accenture','Cognizant'],
  };
  return (
    <div className="panel" style={{ borderColor:'rgba(0,212,161,0.2)', marginBottom:18 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div className="panel-title" style={{ marginBottom:0, color:'#00d4a1' }}>🎯 Advanced Interview Prep — Placement Ready</div>
        <select value={sel} onChange={e => { setSel(e.target.value); setShowAnswer({}); }} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'5px 10px', fontSize:12, color:'#e2e8f0', outline:'none' }}>
          {userSkillNames.map(s => <option key={s} value={s} style={{ background:'#1a2030', color:'#f1f5f9' }}>{s}</option>)}
        </select>
      </div>
      <div className="detail-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div>
          <div style={{ fontSize:10, color:'#475569', fontFamily:"'Space Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>In-Depth Interview Questions</div>
          {d.questions.map((q,i) => (
            <div key={i} style={{ padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display:'flex', gap:10, alignItems: 'flex-start' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(0,212,161,0.12)', color:'#00d4a1', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize:13, color:'#e2e8f0', lineHeight:1.5, fontWeight: 500, marginBottom: 8 }}>{q}</div>
                  {showAnswer[i] ? (
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '2px solid #00d4a1' }}>
                      <em>Tip: Focus your answer on underlying mechanisms, trade-offs, and practical scenarios where you have applied this concept. Avoid surface-level definitions.</em>
                    </div>
                  ) : (
                    <button onClick={() => setShowAnswer(p => ({...p, [i]: true}))} style={{ background: 'transparent', border: '1px solid rgba(0,212,161,0.3)', color: '#00d4a1', padding: '4px 10px', borderRadius: '4px', fontSize: 10, cursor: 'pointer' }}>Show Hint</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:10, color:'#475569', fontFamily:"'Space Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Top Companies Hiring</div>
          {d.companies.map((c,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', marginBottom:6, borderRadius:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`hsl(${i*60},35%,20%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:`hsl(${i*60},70%,70%)` }}>{c[0]}</div>
              <div style={{ fontSize:13, color:'#f1f5f9', fontWeight:500 }}>{c}</div>
              <div style={{ marginLeft:'auto', fontSize:9, padding:'2px 8px', borderRadius:4, background:'rgba(0,212,161,0.1)', color:'#00d4a1' }}>Hiring</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── LEARN NEW SKILL ───────────────────────────────────── */
function LearnSkillPanel({ year = null, prefillSkill = null }) {
  const [input, setInput] = useState(prefillSkill || '');
  const [sel, setSel] = useState(prefillSkill || null);
  const POPULAR = ['Python','JavaScript','Machine Learning','SQL','Cloud Computing','Generative AI','DevOps'];
  const go = () => { const s = input.trim(); if (!s) return; setSel(Object.keys(ROADMAP_DATA).find(k => k.toLowerCase()===s.toLowerCase()) || s); };
  const rm = sel ? (ROADMAP_DATA[sel] || DEFAULT_ROADMAP) : null;
  
  let displaySteps = rm ? rm.steps : [];
  let displayResources = rm ? rm.resources : [];
  
  if (year && rm) {
    const yearSteps = displaySteps.filter(s => s.includes(`Year ${year}`));
    if (yearSteps.length > 0) displaySteps = yearSteps;
    
    const yearRes = displayResources.filter(r => r.year === year || (r.year && r.year <= year));
    if (yearRes.length > 0) displayResources = yearRes;
  }

  return (
    <div className="panel" style={{ borderColor:'rgba(96,165,250,0.2)', marginBottom:18 }}>
      <div className="panel-title" style={{ color:'#60a5fa' }}>🚀 {year ? `Year ${year} Learning Path` : 'Want to Learn a New Skill?'}</div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && go()} placeholder="Type a skill (e.g. Python, React, AWS)..." style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#f1f5f9', outline:'none', fontFamily:'inherit' }}/>
        <button onClick={go} style={{ background:'#60a5fa', color:'#080b12', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Show Roadmap</button>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
        {POPULAR.map(s => <button key={s} onClick={() => { setInput(s); setSel(s); }} style={{ padding:'4px 12px', borderRadius:20, fontSize:11, cursor:'pointer', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)', color:'#64748b', transition:'all 0.15s' }}>{s}</button>)}
      </div>
      {rm && (
        <div className="detail-grid">
          <div>
            <div style={{ fontSize:10, color:'#475569', fontFamily:"'Space Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Learning Roadmap — {sel}</div>
            {displaySteps.map((step,i) => <div key={i} className="roadmap-step"><div className="roadmap-num">{i+1}</div><div style={{ fontSize:13, color:'#cbd5e1', lineHeight:1.5, paddingTop:2 }}>{step}</div></div>)}
          </div>
          <div>
            <div style={{ fontSize:10, color:'#475569', fontFamily:"'Space Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>{year ? `Year ${year} Resources` : 'Free & Paid Resources'}</div>
            {displayResources.map((r,i) => (
              <a key={i} href={r.u} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', marginBottom:8, borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', textDecoration:'none', transition:'all 0.15s' }}>
                <div style={{ fontSize:16 }}>{r.t==='Free'?'🆓':'💳'}</div>
                <div style={{ flex:1, fontSize:13, color:'#f1f5f9', fontWeight:500 }}>{r.n}</div>
                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:4, background:r.t==='Free'?'rgba(0,212,161,0.1)':'rgba(96,165,250,0.1)', color:r.t==='Free'?'#00d4a1':'#60a5fa', border:`1px solid ${r.t==='Free'?'rgba(0,212,161,0.2)':'rgba(96,165,250,0.2)'}` }}>{r.t}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── STUDENT DASHBOARD ─────────────────────────────────── */
function StudentDashboard({ user, profile, skills, onSelectSkill, recs, forecast }) {
  const year = profile.year || 1;
  const userSkills = skills.filter(s => (profile.skills||[]).some(u => u.toLowerCase()===s.name.toLowerCase()));
  const atRisk = userSkills.filter(s => s.risk==='Dying'||s.risk==='At Risk');
  const yearLabels = {1:'Foundation Builder',2:'Specialization Phase',3:'Project Portfolio',4:'Placement Ready'};
  const progress = (year/4)*100;
  const userSkillNames = userSkills.length > 0 ? userSkills.map(s => s.name) : (profile.skills || []);

  return (
    <div>
      <div className="persona-banner" style={{ background:'linear-gradient(135deg,rgba(96,165,250,0.1),rgba(0,212,161,0.06))', borderRadius:14, padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:18 }}>
        <div style={{ fontSize:36 }}>🎓</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:600, color:'#f1f5f9', marginBottom:3 }}>Hello, {user.name.split(' ')[0]}!</div>
          <div style={{ fontSize:13, color:'#64748b' }}>{yearLabels[year]} · {recs?.timeframe||'Building your roadmap...'}</div>
        </div>
        <div style={{ textAlign:'center', minWidth:90 }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#475569', marginBottom:6, textTransform:'uppercase' }}>Year Progress</div>
          <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, width:80 }}>
            <div style={{ height:'100%', width:`${progress}%`, background:'#60a5fa', borderRadius:3 }}/>
          </div>
          <div style={{ fontSize:11, color:'#60a5fa', marginTop:4, fontFamily:"'Space Mono',monospace" }}>Year {year} of 4</div>
        </div>
      </div>

      <div className="overview-grid">
        {[
          { label:'Your Skills', val:profile.skills?.length||0, sub: (profile.skills||[]).slice(0,2).join(', ') + ((profile.skills||[]).length > 2 ? ` +${(profile.skills||[]).length-2} more` : '') || 'none added yet', color:'#60a5fa' },
          { label:'At Risk', val:atRisk.length, sub:'need reskilling', color:'#f87171' },
          { label:'Market Growing', val:skills.filter(s=>s.risk==='Growing').length, sub:'high demand now', color:'#00d4a1' },
          { label:'Safe Skills', val:userSkills.filter(s=>s.risk==='Growing'||s.risk==='Stable').length, sub:'future-proof', color:'#f59e0b' },
        ].map(c=>(
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color:c.color }}>{c.val}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {userSkills.length>0 && (
        <div className="panel" style={{ borderColor:'rgba(96,165,250,0.15)', marginBottom:18 }}>
          <div className="panel-title" style={{ color:'#60a5fa' }}>Your Skills — SDI Analysis</div>
          {atRisk.length>0 && <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#f87171', marginBottom:14 }}>⚠ {atRisk.length} of your skills are at risk — see reskilling paths below</div>}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:12 }}>
            {userSkills.map(s=><SkillCard key={s.name} skillName={s.name} onSelect={onSelectSkill}/>)}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">Year {year} Roadmap — {yearLabels[year]}</div>
        {recs?.recommendations?.map((r,i)=>(
          <div key={i} className="roadmap-step">
            <div className="roadmap-num">{i+1}</div>
            <div><div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:2 }}>{r.skill}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>{r.reason}</div></div>
          </div>
        ))}
      </div>

      {year === 4 && userSkillNames.length > 0 && <InterviewPrepPanel userSkillNames={userSkillNames}/>}
      <LearnSkillPanel year={year} prefillSkill={userSkillNames[0]} />
      {userSkillNames.length > 0 && <MultiSkillForecast skillNames={userSkillNames}/>}
    </div>
  );
}

/* ── JOB MATCHES PANEL ─────────────────────────────────── */
function JobMatchesPanel() {
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

  if (loading) return <div className="panel" style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '20px' }}>Analyzing market opportunities...</div>;

  return (
    <div className="panel" style={{ borderColor: 'rgba(56, 189, 248, 0.2)' }}>
      <div className="panel-title" style={{ color: '#38bdf8' }}>🎯 Job Opportunities (O*NET Matches)</div>
      <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {matches.length === 0 ? (
          <div style={{ fontSize: 13, color: '#475569' }}>No direct matches found. Try adding more skills to your profile.</div>
        ) : (
          matches.map(m => (
            <div key={m.soc} style={{ 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '12px', 
              padding: '16px', 
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{m.job_title}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>SOC: {m.soc}</div>
                </div>
                <div style={{ 
                  background: m.automation_risk > 0.7 ? 'rgba(248, 113, 113, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  color: m.automation_risk > 0.7 ? '#f87171' : '#4ade80',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 600
                }}>
                  {m.automation_risk > 0.7 ? 'High Risk' : 'Low Risk'}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Fit Score</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{Math.round(m.fit_score * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ 
                    width: `${m.fit_score * 100}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #38bdf8, #818cf8)', 
                    borderRadius: '2px' 
                  }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>Matched Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {m.matched_skills.map(s => (
                    <span key={s} style={{ 
                      padding: '2px 6px', 
                      background: 'rgba(56, 189, 248, 0.1)', 
                      color: '#38bdf8', 
                      borderRadius: '4px', 
                      fontSize: '9px' 
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── PROFESSIONAL DASHBOARD ────────────────────────────── */
function ProfessionalDashboard({ user, profile, skills, onSelectSkill, recs, forecast }) {
  const userSkills = skills.filter(s => (profile.skills||[]).some(u => u.toLowerCase()===s.name.toLowerCase()));
  const atRisk = userSkills.filter(s => s.risk==='Dying'||s.risk==='At Risk');
  const avgSdi = userSkills.length ? userSkills.reduce((a,s)=>a+s.sdi,0)/userSkills.length : 0;
  const timeLabel = {low:'< 5 hrs/week', medium:'5-10 hrs/week', high:'10+ hrs/week'}[profile.time_available]||'Flexible';
  const barData = skills.map(s=>({ name:s.name.length>8?s.name.substring(0,8)+'..':s.name, sdi:s.sdi, risk:s.risk }));

  return (
    <div>
      <div className="persona-banner" style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(0,212,161,0.05))', borderRadius:14, padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:18 }}>
        <div style={{ fontSize:36 }}>💼</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:600, color:'#f1f5f9', marginBottom:3 }}>Hello, {user.name.split(' ')[0]}!</div>
          <div style={{ fontSize:13, color:'#64748b' }}>{profile.role} · {timeLabel} · {recs?.timeframe||'Calculating paths...'}</div>
        </div>
        {userSkills.length>0 && <SDIRing sdi={avgSdi} risk={avgSdi>0.5?'At Risk':avgSdi>0.25?'Stable':'Growing'} size={72}/>}
      </div>

      <div className="overview-grid">
        {[
          { label:'Current Skills', val:profile.skills?.length||0, sub:'in your profile', color:'#f59e0b' },
          { label:'Skills at Risk', val:atRisk.length, sub:'need transition', color:'#f87171' },
          { label:'Learning Time', val:timeLabel.split(' ')[0], sub:'per week', color:'#60a5fa' },
          { label:'Your Avg SDI', val:avgSdi.toFixed(2)||'—', sub:'career health', color:avgSdi>0.5?'#f87171':'#00d4a1' },
        ].map(c=>(
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color:c.color }}>{c.val}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {userSkills.length>0 && (
        <div className="panel" style={{ borderColor:'rgba(245,158,11,0.15)', marginBottom:18 }}>
          <div className="panel-title" style={{ color:'#f59e0b' }}>Your Current Skills — Risk Analysis</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:12 }}>
            {userSkills.map(s=><SkillCard key={s.name} skillName={s.name} onSelect={onSelectSkill}/>)}
          </div>
        </div>
      )}

      <div className="detail-grid">
        <div className="panel">
          <div className="panel-title">Recommended Transition Skills — {profile.role}</div>
          {recs?.recommendations?.slice(0,6).map((r,i)=>(
            <div key={i} className="roadmap-step">
              <div className="roadmap-num">{i+1}</div>
              <div><div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:2 }}>{r.skill}</div>
              <div style={{ fontSize:11, color:'#64748b' }}>{r.reason}</div></div>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="panel-title">Market SDI — All Skills</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ left:-10 }}>
              <XAxis dataKey="name" tick={{ fill:'#475569', fontSize:8 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:10 }} domain={[0,1]}/>
              <Tooltip contentStyle={TT}/>
              <Bar dataKey="sdi" radius={[4,4,0,0]}>{barData.map((d,i)=><Cell key={i} fill={RC[d.risk]||'#60a5fa'}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Python Demand Forecast (Market Intelligence)</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={forecast}>
            <defs><linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="year" tick={{ fill:'#475569', fontSize:10 }}/><YAxis tick={{ fill:'#475569', fontSize:10 }}/>
            <Tooltip contentStyle={TT}/>
            <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="url(#fg2)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <JobMatchesPanel />
    </div>
  );
}

/* ── UNIVERSITY DASHBOARD ──────────────────────────────── */
const UNI_REMOVE = ['Data Entry','Manual Testing','Excel'];
const UNI_ADD = ['Generative AI','Cloud Computing','MLOps','Data Engineering','LLM Fine-tuning'];
const UNI_UPDATE = [
  { old:'Manual Testing', new:'AI-Powered Test Automation' },
  { old:'Excel', new:'Power BI + Python Analytics' },
];

function UniversityDashboard({ user, profile, skills, onSelectSkill, recs }) {
  const courses = profile.courses || [];
  const matchedCourses = skills.filter(s => courses.some(c => c.toLowerCase()===s.name.toLowerCase()));
  const atRisk = matchedCourses.filter(s => s.risk==='Dying'||s.risk==='At Risk');
  const obsolete = courses.filter(c => UNI_REMOVE.some(r => r.toLowerCase()===c.toLowerCase()));
  const toAdd = UNI_ADD.filter(a => !courses.some(c => c.toLowerCase()===a.toLowerCase()));
  const radarData = skills.slice(0,8).map(s=>({ name:s.name.split(' ')[0], sdi:+(s.sdi*100).toFixed(0), demand:+((1-s.sdi)*100).toFixed(0) }));

  return (
    <div>
      <div className="persona-banner" style={{ background:'linear-gradient(135deg,rgba(0,212,161,0.08),rgba(96,165,250,0.05))', borderRadius:14, padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:18 }}>
        <div style={{ fontSize:36 }}>🏛️</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:600, color:'#f1f5f9', marginBottom:3 }}>Hello, {user.name.split(' ')[0]}!</div>
          <div style={{ fontSize:13, color:'#64748b' }}>Curriculum Modernization Dashboard · Next Academic Year</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#475569', marginBottom:4, textTransform:'uppercase' }}>At-Risk Courses</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:28, fontWeight:700, color:'#f87171' }}>{atRisk.length}</div>
          <div style={{ fontSize:10, color:'#475569' }}>of {courses.length} courses</div>
        </div>
      </div>

      <div className="overview-grid">
        {[
          { label:'Courses Offered', val:courses.length, sub:'currently in curriculum', color:'#60a5fa' },
          { label:'Obsolete Risk', val:atRisk.length, sub:'need immediate update', color:'#f87171' },
          { label:'Courses to Add', val:toAdd.length, sub:'high-demand skills missing', color:'#00d4a1' },
          { label:'Courses to Update', val:UNI_UPDATE.length, sub:'content modernization', color:'#f59e0b' },
        ].map(c=>(
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color:c.color }}>{c.val}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="detail-grid">
        <div className="panel" style={{ borderColor:'rgba(248,113,113,0.15)' }}>
          <div className="panel-title" style={{ color:'#f87171' }}>❌ Courses to Remove / Modernize</div>
          {obsolete.length===0 ? <div style={{ fontSize:12, color:'#475569' }}>No obsolete courses detected from your list.</div> :
            obsolete.map((c,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#f87171', flexShrink:0 }}/>
                <div style={{ fontSize:12, color:'#f1f5f9' }}>{c}</div>
                <div style={{ fontSize:10, color:'#475569', marginLeft:'auto' }}>Obsolete</div>
              </div>
            ))
          }
          {UNI_UPDATE.map((u,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#f59e0b', flexShrink:0 }}/>
              <div style={{ fontSize:12, color:'#f1f5f9' }}>{u.old} <span style={{ color:'#475569' }}>→</span> {u.new}</div>
              <div style={{ fontSize:10, color:'#f59e0b', marginLeft:'auto' }}>Update</div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ borderColor:'rgba(0,212,161,0.15)' }}>
          <div className="panel-title" style={{ color:'#00d4a1' }}>✓ Courses to Add (High Demand)</div>
          {toAdd.map((a,i)=>{
            const s = skills.find(sk=>sk.name===a);
            return (
              <div key={i} className="reskill-card" onClick={()=>s&&onSelectSkill(a)}>
                <span style={{ color:'#00d4a1' }}>+</span> {a}
                {s && <span style={{ fontSize:9, color:'#475569', marginLeft:'auto' }}>SDI {s.sdi?.toFixed(2)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {matchedCourses.length>0 && (
        <div className="panel">
          <div className="panel-title">Your Current Courses — Market Risk Analysis</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:12 }}>
            {matchedCourses.map(s=><SkillCard key={s.name} skillName={s.name} onSelect={onSelectSkill}/>)}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">Skill Radar — Industry Risk vs Demand</div>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)"/>
            <PolarAngleAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:10 }}/>
            <Radar name="Risk" dataKey="sdi" stroke="#f87171" fill="#f87171" fillOpacity={0.15}/>
            <Radar name="Demand" dataKey="demand" stroke="#00d4a1" fill="#00d4a1" fillOpacity={0.15}/>
            <Tooltip contentStyle={TT}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── MAIN EXPORT ───────────────────────────────────────── */
export default function Dashboard({ user, profile, skills, onSelectSkill }) {
  const [recs, setRecs] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    if (profile && profile.user_type) {
      getRecommendations(profile)
        .then(r => setRecs(r.data))
        .catch(e => console.error('Recommendations failed:', e?.response?.data || e.message));
    }
    getForecast('Python')
      .then(r => setForecast(r.data.demand_forecast || []))
      .catch(e => console.error('Forecast failed:', e?.response?.data || e.message));
  }, [profile?.user_type, profile?.skills, profile?.courses, profile?.role, profile?.year, profile?.time_available]);

  const props = { user, profile, skills, onSelectSkill, recs, forecast };

  if (profile.user_type === 'student') return <StudentDashboard {...props}/>;
  if (profile.user_type === 'professional') return <ProfessionalDashboard {...props}/>;
  if (profile.user_type === 'university') return <UniversityDashboard {...props}/>;

  return <div style={{ color:'#64748b', padding:40 }}>Loading your dashboard...</div>;
}

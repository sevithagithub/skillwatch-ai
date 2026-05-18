import { useState, useCallback } from 'react';
import { updateProfile } from '../services/api';

const ROLES = ['Software Engineer', 'Data Analyst', 'Designer', 'Tester / QA', 'Admin / Operations', 'Other'];
const QUICK_SKILLS = ['Python', 'Java', 'HTML/CSS', 'SQL', 'Excel', 'C++', 'JavaScript', 'Machine Learning'];
const QUICK_COURSES = ['Data Structures', 'DBMS', 'Java Programming', 'Manual Testing', 'Excel', 'Computer Networks', 'OS', 'Machine Learning'];

export default function Onboarding({ user, onComplete, onLogout }) {
  const [userType, setUserType] = useState(user?.user_type || null);
  const [year, setYear] = useState(user?.year || null);
  const [role, setRole] = useState(user?.role || 'Software Engineer');
  const [timeAvail, setTimeAvail] = useState(user?.time_available || null);
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [courses, setCourses] = useState(user?.courses || []);
  const [courseInput, setCourseInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const addSkill = (val) => { const v = (val || skillInput).trim(); if (v && !skills.includes(v)) setSkills(p => [...p, v]); setSkillInput(''); };
  const addCourse = (val) => { const v = (val || courseInput).trim(); if (v && !courses.includes(v)) setCourses(p => [...p, v]); setCourseInput(''); };

  const canProceed = !saving && userType && (
    userType === 'student' ? (year && skills.length > 0) :
    userType === 'professional' ? (timeAvail && skills.length > 0) :
    courses.length > 0
  );

  const handleProceed = useCallback(async (attempt = 1) => {
    const prof = { user_type: userType, year, role, time_available: timeAvail, skills, courses };
    setSaving(true);
    setSaveError('');
    try {
      const res = await updateProfile(prof);
      onComplete(res.data);
    } catch (err) {
      console.error('Failed to save profile (attempt', attempt, '):', err);
      const status = err?.response?.status;

      // ── 401: session is stale (DB was wiped on Render restart) ──────────
      if (status === 401) {
        setSaveError(
          'Your session expired because the server restarted. ' +
          'Please sign in again — your account needs to be re-created.'
        );
        setSaving(false);
        // Give user 3 seconds to read the message, then sign them out
        setTimeout(() => onLogout(), 3000);
        return;
      }

      // ── Network / timeout error: backend cold-starting on Render ────────
      if (!status && attempt < 3) {
        const delay = attempt * 8000; // 8s then 16s
        setSaveError(
          `Backend is waking up (Render free tier). Retrying in ${delay / 1000}s… (attempt ${attempt}/3)`
        );
        setTimeout(() => handleProceed(attempt + 1), delay);
        return;
      }

      // ── Generic failure ──────────────────────────────────────────────────
      setSaveError(
        status
          ? `Server error ${status} — please try again or sign out and back in.`
          : 'Could not reach the backend after 3 attempts. Check your connection and try again.'
      );
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType, year, role, timeAvail, skills, courses, onComplete, onLogout]);

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        <div className="onboard-step">Step 2 of 2 · Profile Setup</div>
        <h1 className="onboard-title">Welcome, <strong>{user.name?.split(' ')[0]}</strong></h1>
        <p className="onboard-sub">Tell us about yourself so we can personalize your skill analysis.</p>

        <div className="onboard-form">
          <div className="form-title">Who are you?</div>
          <div className="type-grid">
            {[
              { id: 'student', icon: '🎓', name: 'Student', desc: 'Year-based roadmaps & placement paths' },
              { id: 'professional', icon: '💼', name: 'Professional', desc: 'Quick transition with minimal gap' },
              { id: 'university', icon: '🏛️', name: 'University', desc: 'Curriculum analysis & updates' },
            ].map(t => (
              <div key={t.id} className={`type-card${userType === t.id ? ' selected' : ''}`} onClick={() => setUserType(t.id)}>
                <div className="type-icon">{t.icon}</div>
                <div className="type-name">{t.name}</div>
                <div className="type-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {userType === 'student' && (
          <div className="onboard-form">
            <div className="form-title">Current Year</div>
            <div className="year-grid" style={{ marginBottom: 20 }}>
              {[1,2,3,4].map(y => (
                <button key={y} className={`option-btn${year === y ? ' selected' : ''}`} onClick={() => setYear(y)}>
                  {y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'} Year
                </button>
              ))}
            </div>
            <div className="form-title">Skills You Know</div>
            <div className="skills-input-wrap">
              {skills.map(s => <span key={s} className="skill-tag">{s} <span className="remove-tag" onClick={() => setSkills(p => p.filter(x => x !== s))}>×</span></span>)}
              <input className="skills-text-input" placeholder="Type skill + Enter..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {QUICK_SKILLS.map(s => <button key={s} className="quick-add" onClick={() => addSkill(s)}>{s} +</button>)}
            </div>
          </div>
        )}

        {userType === 'professional' && (
          <div className="onboard-form">
            <div className="form-title">Current Role</div>
            <select className="role-select" style={{ marginBottom: 20 }} value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="form-title">Current Skills</div>
            <div className="skills-input-wrap" style={{ marginBottom: 16 }}>
              {skills.map(s => <span key={s} className="skill-tag">{s} <span className="remove-tag" onClick={() => setSkills(p => p.filter(x => x !== s))}>×</span></span>)}
              <input className="skills-text-input" placeholder="Type skill + Enter..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
            </div>
            <div className="form-title">Weekly Learning Time</div>
            <div className="time-grid">
              {[['low','< 5 hrs'],['medium','5-10 hrs'],['high','10+ hrs']].map(([id,label]) => (
                <button key={id} className={`option-btn${timeAvail === id ? ' selected' : ''}`} onClick={() => setTimeAvail(id)}>{label}</button>
              ))}
            </div>
          </div>
        )}

        {userType === 'university' && (
          <div className="onboard-form">
            <div className="form-title">Courses Currently Offered</div>
            <div className="skills-input-wrap">
              {courses.map(c => <span key={c} className="skill-tag">{c} <span className="remove-tag" onClick={() => setCourses(p => p.filter(x => x !== c))}>×</span></span>)}
              <input className="skills-text-input" placeholder="Type course + Enter..." value={courseInput} onChange={e => setCourseInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCourse()} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {QUICK_COURSES.map(c => <button key={c} className="quick-add" onClick={() => addCourse(c)}>{c} +</button>)}
            </div>
          </div>
        )}

        {saveError && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 12, lineHeight: 1.5 }}>
            ⚠ {saveError}
            {saveError.includes('waking up') && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#fbbf24' }}>
                ⏳ Render free tier spins down after 15 min of inactivity — first request can take up to 30 s.
              </div>
            )}
            {saveError.includes('expired') && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                Redirecting to login in 3 seconds…
              </div>
            )}
          </div>
        )}
        <button className="proceed-btn" disabled={!canProceed} onClick={handleProceed}>
          {saving ? 'Saving…' : 'Generate My Dashboard →'}
        </button>

        {onLogout && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <span 
              onClick={onLogout} 
              style={{ 
                fontSize: 13, 
                color: '#64748b', 
                cursor: 'pointer', 
                textDecoration: 'underline',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.target.style.color = '#f87171'}
              onMouseLeave={e => e.target.style.color = '#64748b'}
            >
              ← Sign Out / Back to Login
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

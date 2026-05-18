import { useState, useEffect, useRef } from 'react';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SkillDetail from './pages/SkillDetail';
import SkillGraph from './pages/SkillGraph';
import Resources from './pages/Resources';
import RegionRisk from './pages/RegionRisk';
import JobMatcher from './pages/JobMatcher';
import AdminPanel from './pages/AdminPanel';
import { getSkills, getMe } from './services/api';

const RISK_COLORS = {
  Growing: '#00d4a1', Stable: '#60a5fa', 'At Risk': '#f59e0b', Dying: '#f87171',
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('sw_token');
    const saved = localStorage.getItem('sw_user');
    const prof = localStorage.getItem('sw_profile');
    if (token && saved) {
      setUser(JSON.parse(saved));
      if (prof) setProfile(JSON.parse(prof));
      // Also sync profile from backend in case it changed
      getMe().then(r => {
        const u = r.data;
        setUser(u);
        localStorage.setItem('sw_user', JSON.stringify(u));
        if (u.user_type) {
          const p = {
            user_type: u.user_type,
            year: u.year,
            role: u.role,
            time_available: u.time_available,
            skills: u.skills || [],
            courses: u.courses || [],
          };
          setProfile(p);
          localStorage.setItem('sw_profile', JSON.stringify(p));
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (user && profile && profile.user_type) {
      getSkills().then(r => setSkills(r.data)).catch(() => {});
    }
  }, [user?.id, profile?.user_type, profile?.skills?.length]);

  const handleLogin = (userData, token) => {
    localStorage.setItem('sw_token', token);
    localStorage.setItem('sw_user', JSON.stringify(userData));
    setUser(userData);
    // If user already has profile, restore it
    if (userData.user_type) {
      const p = {
        user_type: userData.user_type,
        year: userData.year,
        role: userData.role,
        time_available: userData.time_available,
        skills: userData.skills || [],
        courses: userData.courses || [],
      };
      setProfile(p);
      localStorage.setItem('sw_profile', JSON.stringify(p));
    }
  };

  const handleOnboard = (updatedUser) => {
    const p = {
      user_type: updatedUser.user_type,
      year: updatedUser.year,
      role: updatedUser.role,
      time_available: updatedUser.time_available,
      skills: updatedUser.skills || [],
      courses: updatedUser.courses || [],
    };
    localStorage.setItem('sw_profile', JSON.stringify(p));
    setProfile(p);
    setUser(updatedUser);
    localStorage.setItem('sw_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setProfile(null);
    setPage('dashboard');
    setMenuOpen(false);
    setSkills([]);
  };

  const selectSkill = (name) => {
    setSelectedSkill(name);
    setPage('detail');
    setMenuOpen(false);
  };

  if (!user) return <Login onLogin={handleLogin} />;
  if (!profile || !profile.user_type) return <Onboarding user={user} onComplete={handleOnboard} onLogout={handleLogout} />;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'graph', label: 'Skill Graph' },
    { id: 'resources', label: 'Resources' },
    { id: 'regions', label: 'Region Risk' },
    { id: 'matcher', label: 'Job Matcher' },
    { id: 'admin', label: '🔐 Admin' },
  ];

  const userSkillNames = profile.user_type === 'university'
    ? (profile.courses || [])
    : (profile.skills || []);

  const renderPage = () => {
    switch (page) {
      case 'detail':
        return <SkillDetail skillName={selectedSkill} onBack={() => setPage('dashboard')} />;
      case 'graph':
        return <SkillGraph skills={skills} onSelectSkill={selectSkill} />;
      case 'resources':
        return <Resources skills={skills} profile={profile} />;
      case 'regions':
        return <RegionRisk />;
      case 'matcher':
        return <JobMatcher />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard user={user} profile={profile} skills={skills} onSelectSkill={selectSkill} />;
    }
  };

  const typeLabel = profile.user_type === 'student' ? `Year ${profile.year} Student`
    : profile.user_type === 'professional' ? profile.role || 'Professional'
    : 'University';

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="logo">Skill<span>Watch</span> · AI</div>
        <div className="nav-links">
          {navItems.map(n => (
            <button key={n.id} className={`nav-btn${page === n.id ? ' active' : ''}`} onClick={() => setPage(n.id)}>
              {n.label}
            </button>
          ))}
        </div>

        {/* User menu — dropdown instead of direct logout */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div className="user-pill" onClick={() => setMenuOpen(o => !o)} style={{ cursor: 'pointer' }}>
            <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>
                {user.name?.split(' ')[0]}
              </span>
              <span style={{ fontSize: 9, color: '#475569', textTransform: 'capitalize' }}>{typeLabel}</span>
            </div>
            <span style={{ fontSize: 10, color: '#475569', marginLeft: 2 }}>{menuOpen ? '▲' : '▼'}</span>
          </div>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 180,
              background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, overflow: 'hidden', zIndex: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{user.name}</div>
                <div style={{ fontSize: 10, color: '#475569' }}>{user.email}</div>
              </div>
              <button onClick={() => { setProfile(null); localStorage.removeItem('sw_profile'); setMenuOpen(false); }}
                style={{ width: '100%', padding: '9px 14px', background: 'none', border: 'none', color: '#94a3b8', fontSize: 12, cursor: 'pointer', textAlign: 'left', display: 'block' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.target.style.background = 'none'}>
                ⚙ Edit Profile
              </button>
              <button onClick={handleLogout}
                style={{ width: '100%', padding: '9px 14px', background: 'none', border: 'none', color: '#f87171', fontSize: 12, cursor: 'pointer', textAlign: 'left', display: 'block', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.target.style.background = 'rgba(248,113,113,0.08)'}
                onMouseLeave={e => e.target.style.background = 'none'}>
                → Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar">
        {userSkillNames.length > 0 && (
          <>
            <div className="sidebar-label" style={{ color: '#00d4a1' }}>Your Skills</div>
            {skills
              .filter(s => userSkillNames.some(us => us.toLowerCase() === s.name.toLowerCase()))
              .map(s => (
                <div key={s.name}
                  className={`skill-chip${selectedSkill === s.name ? ' active' : ''}`}
                  onClick={() => selectSkill(s.name)}
                  style={{ borderLeft: `2px solid ${RISK_COLORS[s.risk] || '#60a5fa'}`, paddingLeft: 8 }}>
                  <div className="chip-dot" style={{ background: RISK_COLORS[s.risk] || '#60a5fa' }} />
                  <span className="chip-name">{s.name}</span>
                  <span className="chip-sdi">{s.sdi?.toFixed(2)}</span>
                </div>
              ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '10px 8px' }} />
          </>
        )}
        <div className="sidebar-label">All Skills</div>
        {skills
          .filter(s => !userSkillNames.some(us => us.toLowerCase() === s.name.toLowerCase()))
          .map(s => (
            <div key={s.name} className={`skill-chip${selectedSkill === s.name ? ' active' : ''}`} onClick={() => selectSkill(s.name)}>
              <div className="chip-dot" style={{ background: RISK_COLORS[s.risk] || '#60a5fa' }} />
              <span className="chip-name">{s.name}</span>
              <span className="chip-sdi">{s.sdi?.toFixed(2)}</span>
            </div>
          ))}
      </div>

      <div className="main-panel">
        {renderPage()}
      </div>
    </div>
  );
}

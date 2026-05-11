import { useState, useEffect } from 'react';
import { getAdminUsers, getAdminStats, deleteAdminUser } from '../services/api';

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const fetchData = async (key) => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, statsRes] = await Promise.all([
        getAdminUsers(key),
        getAdminStats(key),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setAuthenticated(true);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Invalid admin key. Access denied.');
        setAuthenticated(false);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach backend server.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load admin data.');
      }
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    fetchData(adminKey.trim());
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(userId, adminKey);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (stats) {
        setStats((s) => ({ ...s, total_users: s.total_users - 1 }));
      }
    } catch {
      alert('Failed to delete user.');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const timeSince = (d) => {
    if (!d) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const typeEmoji = { student: '🎓', professional: '💼', university: '🏛️' };

  const filtered = users
    .filter((u) => {
      const term = searchTerm.toLowerCase();
      return (
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.user_type?.toLowerCase().includes(term) ||
        u.skills?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === 'created_at' || sortField === 'last_login') {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      }
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortIcon = (field) =>
    sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  // ── Auth Gate ──
  if (!authenticated) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <div className="admin-gate-icon">🔐</div>
          <h2 className="admin-gate-title">Admin Access</h2>
          <p className="admin-gate-sub">Enter your admin key to view registered users and platform statistics.</p>
          <form onSubmit={handleLogin}>
            <input
              className="admin-key-input"
              type="password"
              placeholder="Enter admin key…"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              autoFocus
            />
            <button className="admin-key-btn" type="submit" disabled={loading || !adminKey.trim()}>
              {loading ? 'Verifying…' : 'Unlock Dashboard →'}
            </button>
          </form>
          {error && <div className="admin-error">{error}</div>}
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">👥 User Management</h1>
          <p className="admin-subtitle">All registered users and their activity</p>
        </div>
        <button className="admin-refresh-btn" onClick={() => fetchData(adminKey)} disabled={loading}>
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-value">{stats.total_users}</div>
            <div className="admin-stat-label">Total Users</div>
          </div>
          <div className="admin-stat-card stat-student">
            <div className="admin-stat-value">{stats.students}</div>
            <div className="admin-stat-label">🎓 Students</div>
          </div>
          <div className="admin-stat-card stat-professional">
            <div className="admin-stat-value">{stats.professionals}</div>
            <div className="admin-stat-label">💼 Professionals</div>
          </div>
          <div className="admin-stat-card stat-university">
            <div className="admin-stat-value">{stats.universities}</div>
            <div className="admin-stat-label">🏛️ Universities</div>
          </div>
        </div>
      )}

      {/* Top Skills */}
      {stats?.top_skills?.length > 0 && (
        <div className="admin-top-skills">
          <div className="admin-section-label">🔥 Most Popular Skills</div>
          <div className="admin-skill-chips">
            {stats.top_skills.map((s) => (
              <span key={s.skill} className="admin-skill-chip">
                {s.skill} <span className="admin-skill-count">×{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="🔍 Search users by name, email, skills…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="admin-count">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Users Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('id')}>#{ sortIcon('id')}</th>
              <th onClick={() => toggleSort('name')}>User{sortIcon('name')}</th>
              <th onClick={() => toggleSort('email')}>Email{sortIcon('email')}</th>
              <th onClick={() => toggleSort('user_type')}>Type{sortIcon('user_type')}</th>
              <th>Skills / Courses</th>
              <th onClick={() => toggleSort('created_at')}>Signed Up{sortIcon('created_at')}</th>
              <th onClick={() => toggleSort('last_login')}>Last Login{sortIcon('last_login')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="8" className="admin-empty">No users found</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="admin-id">{u.id}</td>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-avatar">{u.name?.[0]?.toUpperCase() || '?'}</div>
                    <span className="admin-user-name">{u.name}</span>
                  </div>
                </td>
                <td className="admin-email">{u.email}</td>
                <td>
                  {u.user_type ? (
                    <span className={`admin-type-badge type-${u.user_type}`}>
                      {typeEmoji[u.user_type] || ''} {u.user_type}
                    </span>
                  ) : (
                    <span className="admin-type-badge type-none">Not set</span>
                  )}
                </td>
                <td className="admin-skills-cell">
                  {(u.skills || u.courses || '—').split(',').slice(0, 4).map((s, i) => (
                    <span key={i} className="admin-mini-tag">{s.trim()}</span>
                  ))}
                  {(u.skills || u.courses || '').split(',').length > 4 && (
                    <span className="admin-mini-more">+{(u.skills || u.courses).split(',').length - 4}</span>
                  )}
                </td>
                <td className="admin-date">{formatDate(u.created_at)}</td>
                <td className="admin-date">
                  <span title={formatDate(u.last_login)}>{timeSince(u.last_login)}</span>
                </td>
                <td>
                  <button className="admin-del-btn" title="Delete user" onClick={() => handleDelete(u.id, u.name)}>
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

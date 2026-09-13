import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, ShieldAlert, UserCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Building2 size={22} className="icon-main" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Vedron</span>
            <span className="brand-subtitle"> Submission Portal</span>
          </div>
        </Link>

        {user ? (
          <div className="navbar-user-actions">
            <nav className="navbar-nav">
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`nav-link admin-badge-link ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  <ShieldAlert size={16} /> Admin Portal
                </Link>
              )}
            </nav>

            <div className="user-profile-badge">
              <UserCheck size={16} className="user-icon" />
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role-tag">{user.role}</span>
              </div>
            </div>

            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="navbar-auth-buttons">
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Create Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldCheck, UserPlus, LogIn, ArrowRight } from 'lucide-react';

export const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-badge">
          <Building2 size={16} />
          <span>Enterprise Outreach Email Portal</span>
        </div>
        <h1 className="hero-title">
          Collect & Verification Portal for <span className="highlight-text">Enterprise Company Emails</span>
        </h1>
        <p className="hero-description">
          Systemize your authentic enterprise company email submissions directly. Register your applicant account, submit company contact details, and manage outreach records.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn-hero-primary">
            <UserPlus size={18} />
            <span>Create Applicant Account</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-hero-secondary">
            <LogIn size={18} />
            <span>Applicant / Admin Login</span>
          </Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <Building2 size={24} />
          </div>
          <h3>Multi-Entry Submissions</h3>
          <p>Easily add multiple company names and enterprise email addresses in a single dynamic submission flow.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <ShieldCheck size={24} />
          </div>
          <h3>Verified User Linking</h3>
          <p>Submissions are automatically linked to your authenticated session, ensuring data authenticity and traceability.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <LogIn size={24} />
          </div>
          <h3>Admin Data Search</h3>
          <p>Administrators have real-time access to search, filter, and inspect submitted company email records.</p>
        </div>
      </div>
    </div>
  );
};

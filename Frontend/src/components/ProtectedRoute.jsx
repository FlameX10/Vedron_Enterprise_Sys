import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading secure session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <ShieldAlert size={48} className="denied-icon" />
          <h2>Access Denied</h2>
          <p>Only users with Admin role are authorized to view the Admin Dashboard.</p>
          <a href="/dashboard" className="btn-primary">
            Return to Applicant Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

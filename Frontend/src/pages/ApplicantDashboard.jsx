import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Plus, Trash2, CheckCircle2, AlertCircle, Send, LogOut, History, Building2 } from 'lucide-react';

export const ApplicantDashboard = () => {
  const { user, logout } = useAuth();

  const [entries, setEntries] = useState([
    { id: 1, companyName: '', email: '' }
  ]);
  const [submissions, setSubmissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch applicant's previous submissions on load
  const fetchSubmissions = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiFetch('/api/company-emails');
      if (res.success && res.data) {
        setSubmissions(res.data);
      }
    } catch (err) {
      console.error('Failed to load past submissions:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleInputChange = (id, field, value) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddRow = () => {
    const newId = entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1;
    setEntries((prev) => [...prev, { id: newId, companyName: '', email: '' }]);
  };

  const handleRemoveRow = (id) => {
    if (entries.length === 1) {
      // If only one row remains, clear it instead of removing
      setEntries([{ id: 1, companyName: '', email: '' }]);
      return;
    }
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Filter out completely blank rows if user left empty ones
    const activeEntries = entries.filter(
      (e) => e.companyName.trim() !== '' || e.email.trim() !== ''
    );

    if (activeEntries.length === 0) {
      setErrorMessage('Please fill in at least one company name and email address before submitting.');
      return;
    }

    // Validate each row
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let i = 0; i < activeEntries.length; i++) {
      const entry = activeEntries[i];
      if (!entry.companyName.trim()) {
        setErrorMessage(`Row ${i + 1}: Please specify a Company Name.`);
        return;
      }
      if (!entry.email.trim() || !emailRegex.test(entry.email.trim())) {
        setErrorMessage(`Row ${i + 1}: Please enter a valid Email Address for ${entry.companyName}.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await apiFetch('/api/company-emails', {
        method: 'POST',
        body: JSON.stringify({ entries: activeEntries }),
      });

      if (res.success) {
        setSuccessMessage('✓ Your emails have been submitted successfully.');
        setEntries([{ id: 1, companyName: '', email: '' }]);
        fetchSubmissions(); // refresh history table
      } else {
        setErrorMessage(res.message || 'Submission failed. Please check your inputs.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit emails. Server error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Profile Welcome Header */}
      <div className="welcome-card">
        <div className="welcome-header">
          <h2>Welcome, {user?.name}</h2>
          <div className="welcome-email">
            <span>Email: </span>
            <strong>{user?.email}</strong>
          </div>
        </div>
      </div>

      {/* Main Submission Card */}
      <div className="submission-card">
        <div className="card-header">
          <div className="header-title">
            <Building2 size={24} className="header-icon" />
            <h3>Enterprise Company Emails</h3>
          </div>
          <p className="card-subtitle">
            Enter the enterprise companies and authentic email addresses you found.
          </p>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="success-banner">
            <CheckCircle2 size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="submission-form">
          <div className="entries-table-wrapper">
            <div className="entries-table-header">
              <div className="col-company">Company Name</div>
              <div className="col-email">Email Address</div>
              <div className="col-action">Action</div>
            </div>

            <div className="entries-rows">
              {entries.map((row, index) => (
                <div key={row.id} className="entry-row">
                  <div className="col-company">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Microsoft"
                      value={row.companyName}
                      onChange={(e) => handleInputChange(row.id, 'companyName', e.target.value)}
                    />
                  </div>
                  <div className="col-email">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. hr@microsoft.com"
                      value={row.email}
                      onChange={(e) => handleInputChange(row.id, 'email', e.target.value)}
                    />
                  </div>
                  <div className="col-action">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="btn-remove"
                      title="Remove entry row"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleAddRow} className="btn-add-another">
              <Plus size={18} />
              <span>+ Add Another</span>
            </button>
          </div>

          <div className="submit-section">
            <button type="submit" className="btn-submit-large" disabled={submitting}>
              <Send size={18} />
              <span>{submitting ? 'Submitting Emails...' : 'Submit Emails'}</span>
            </button>
          </div>
        </form>

        <div className="dashboard-footer-logout">
          <button onClick={logout} className="btn-logout-link">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Applicant Submission History Section */}
      <div className="history-card">
        <div className="history-header">
          <History size={20} className="history-icon" />
          <h3>Your Submitted Emails ({submissions.length})</h3>
        </div>

        {loadingHistory ? (
          <div className="loading-state">Loading your submission history...</div>
        ) : submissions.length === 0 ? (
          <div className="empty-history">
            No company emails submitted yet. Fill out the form above to submit your first entries.
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company Name</th>
                  <th>Email Address</th>
                  <th>Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td className="font-medium">{item.companyName}</td>
                    <td className="font-email">{item.email}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import { Building2, Plus, Trash2, CheckCircle2, AlertCircle, Send, User, Mail } from 'lucide-react';

export const PublicSubmission = () => {
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  
  const [entries, setEntries] = useState([
    { id: 1, companyName: '', email: '' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      setEntries([{ id: 1, companyName: '', email: '' }]);
      return;
    }
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!applicantName.trim()) {
      setErrorMessage('Please enter your Full Name at the top.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!applicantEmail.trim() || !emailRegex.test(applicantEmail.trim())) {
      setErrorMessage('Please enter a valid Applicant Email Address at the top.');
      return;
    }

    const activeEntries = entries.filter(
      (e) => e.companyName.trim() !== '' || e.email.trim() !== ''
    );

    if (activeEntries.length === 0) {
      setErrorMessage('Please fill in at least one enterprise company name and email address.');
      return;
    }

    for (let i = 0; i < activeEntries.length; i++) {
      const entry = activeEntries[i];
      if (!entry.companyName.trim()) {
        setErrorMessage(`Row ${i + 1}: Please enter a Company Name.`);
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
        body: JSON.stringify({
          applicantName: applicantName.trim(),
          applicantEmail: applicantEmail.trim(),
          entries: activeEntries,
        }),
      });

      if (res.success) {
        setSuccessMessage('✓ Your emails have been submitted successfully.');
        setEntries([{ id: 1, companyName: '', email: '' }]);
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
      {/* Top Applicant Identity Details */}
      <div className="welcome-card">
        <div className="welcome-header" style={{ marginBottom: '1rem' }}>
          <h2>Applicant Information</h2>
          <p className="card-subtitle">
            Enter your name and email address to tag your company submissions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="applicantName">Applicant Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="applicantName"
                type="text"
                className="form-input"
                placeholder="Rahul Sharma"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="applicantEmail">Applicant Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="applicantEmail"
                type="email"
                className="form-input"
                placeholder="rahul@example.com"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                required
              />
            </div>
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
              {entries.map((row) => (
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
      </div>
    </div>
  );
};

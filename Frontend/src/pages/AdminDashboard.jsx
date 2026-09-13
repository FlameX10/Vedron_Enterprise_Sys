import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Search, LogOut, ShieldCheck, RefreshCw, AlertCircle, Mail, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export const AdminDashboard = () => {
  const { logout } = useAuth();
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      const endpoint = query ? `/api/admin/company-emails?search=${encodeURIComponent(query)}` : '/api/admin/company-emails';
      const res = await apiFetch(endpoint);
      if (res.success && res.data) {
        setEmails(res.data);
      } else {
        setError(res.message || 'Failed to fetch company emails.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching admin records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdminData(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleRefresh = () => {
    fetchAdminData(searchTerm);
  };

  const handleExportExcel = () => {
    if (emails.length === 0) return;

    // Create formatted data structure matching the exact admin table columns
    const exportData = emails.map((item) => ({
      'ID': item.id,
      'Company Name': item.companyName,
      'Email': item.email,
      'Applicant Name': item.applicantName,
      'Submitted Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-fit column widths for clear presentation in Excel
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 25 }, // Company Name
      { wch: 35 }, // Email
      { wch: 25 }, // Applicant Name
      { wch: 15 }, // Date
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Company Emails');

    // Download the .xlsx file
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Enterprise_Company_Emails_${dateStr}.xlsx`);
  };

  return (
    <div className="admin-container">
      {/* Header bar */}
      <div className="admin-header-bar">
        <div className="admin-title-section">
          <ShieldCheck size={28} className="admin-title-icon" />
          <h1>Admin Dashboard</h1>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      {/* Main content box */}
      <div className="admin-content-card">
        {/* Search & Export toolbar */}
        <div className="admin-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search company, email, or applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                ✕
              </button>
            )}
          </div>

          <div className="toolbar-actions">
            <button
              onClick={handleExportExcel}
              className="btn-export-excel"
              disabled={emails.length === 0}
              title="Download table data in Excel format (.xlsx)"
            >
              <Download size={16} />
              <span>Export to Excel</span>
            </button>

            <button onClick={handleRefresh} className="btn-refresh" title="Refresh data">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Admin Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Company Name</th>
                <th>Email</th>
                <th>Applicant Name</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    <div className="table-spinner-wrapper">
                      <div className="spinner-small"></div>
                      <span>Loading submitted email records...</span>
                    </div>
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-muted">
                    {searchTerm ? `No results found matching "${searchTerm}"` : 'No submitted company emails found.'}
                  </td>
                </tr>
              ) : (
                emails.map((row) => (
                  <tr key={row.mongoId || row.id}>
                    <td className="font-bold text-center">{row.id}</td>
                    <td className="font-semibold text-primary">{row.companyName}</td>
                    <td>
                      <a href={`mailto:${row.email}`} className="email-link">
                        <Mail size={14} className="email-icon-inline" />
                        {row.email}
                      </a>
                    </td>
                    <td className="applicant-cell">{row.applicantName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>Showing <strong>{emails.length}</strong> submitted entry record(s)</span>
        </div>
      </div>
    </div>
  );
};

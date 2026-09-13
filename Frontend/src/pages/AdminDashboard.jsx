import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import {
  Search, LogOut, ShieldCheck, RefreshCw, AlertCircle, Mail,
  Download, ChevronLeft, ChevronRight, ChevronDown, FileSpreadsheet, Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';

const LIMIT = 50; // entries per page

export const AdminDashboard = () => {
  const { logout } = useAuth();
  const [emails, setEmails]         = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);

  // Export dropdown & loading state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingAll, setExportingAll]     = useState(false);
  const dropdownRef                         = useRef(null);

  const fetchAdminData = useCallback(async (query = '', page = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({ page, limit: LIMIT });
      if (query) params.set('search', query);

      const res = await apiFetch(`/api/admin/company-emails?${params.toString()}`);

      if (res.success && res.data) {
        const count = res.totalCount ?? res.data.length;
        const pages = res.totalPages ?? Math.max(1, Math.ceil(count / LIMIT));

        // If backend sent full un-paginated array, slice it locally for this page
        let displayData = res.data;
        if (!res.totalPages && res.data.length > LIMIT) {
          const start = (page - 1) * LIMIT;
          displayData = res.data.slice(start, start + LIMIT);
        }

        setEmails(displayData);
        setCurrentPage(res.currentPage || page);
        setTotalPages(pages);
        setTotalCount(count);
      } else {
        setError(res.message || 'Failed to fetch company emails.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching admin records.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search — reset to page 1 on new search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchAdminData(searchTerm, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchAdminData]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => fetchAdminData(searchTerm, currentPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchAdminData(searchTerm, page);
  };

  // Reusable Excel exporter function
  const triggerExcelDownload = (dataList, filenameSuffix = '') => {
    if (!dataList || dataList.length === 0) return;

    const exportData = dataList.map((item, idx) => ({
      'ID':             item.id || (idx + 1),
      'Company Name':   item.companyName,
      'Email':          item.email,
      'Applicant Name': item.applicantName,
      'Applicant Email': item.applicantEmail || 'N/A',
      'Submitted Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 8 },   // ID
      { wch: 25 },  // Company Name
      { wch: 35 },  // Email
      { wch: 25 },  // Applicant Name
      { wch: 30 },  // Applicant Email
      { wch: 15 },  // Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Company Emails');

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = filenameSuffix
      ? `Enterprise_Company_Emails_${filenameSuffix}_${dateStr}.xlsx`
      : `Enterprise_Company_Emails_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  // Option 1: Export only current visible page
  const handleExportPage = () => {
    setShowExportMenu(false);
    triggerExcelDownload(emails, `Page_${currentPage}`);
  };

  // Option 2: Export ALL leads from database
  const handleExportAll = async () => {
    setShowExportMenu(false);
    try {
      setExportingAll(true);
      const params = new URLSearchParams({ page: 1, limit: 100000 });
      if (searchTerm) params.set('search', searchTerm);

      const res = await apiFetch(`/api/admin/company-emails?${params.toString()}`);
      if (res.success && res.data) {
        triggerExcelDownload(res.data, 'ALL_LEADS');
      } else {
        setError(res.message || 'Failed to fetch all leads for export.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching all leads.');
    } finally {
      setExportingAll(false);
    }
  };

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
  const rangeEnd   = Math.min(currentPage * LIMIT, totalCount);

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
            {/* Export Dropdown Menu */}
            <div className="export-dropdown-wrapper" ref={dropdownRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn-export-excel"
                disabled={totalCount === 0 || exportingAll}
                title="Export options for Excel (.xlsx)"
              >
                {exportingAll ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Exporting All...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Export Excel</span>
                    <ChevronDown size={14} className={`dropdown-arrow ${showExportMenu ? 'open' : ''}`} />
                  </>
                )}
              </button>

              {showExportMenu && (
                <div className="export-dropdown-menu">
                  <button onClick={handleExportPage} className="export-menu-item">
                    <FileSpreadsheet size={16} className="menu-icon" />
                    <div className="menu-text">
                      <span className="menu-title">Export Current Page</span>
                      <span className="menu-sub">Only visible entries ({emails.length})</span>
                    </div>
                  </button>

                  <button onClick={handleExportAll} className="export-menu-item accent">
                    <Layers size={16} className="menu-icon" />
                    <div className="menu-text">
                      <span className="menu-title">Export All Leads</span>
                      <span className="menu-sub">Download entire DB ({totalCount} entries)</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

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

        {/* Footer: count + pagination */}
        <div className="admin-table-footer">
          <span className="footer-count">
            {totalCount === 0
              ? 'No entries'
              : `Showing ${rangeStart}–${rangeEnd} of ${totalCount} entries`}
          </span>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                title="Previous page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span className="page-indicator">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                className="page-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                title="Next page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export function StatusBanner({ type, message, onRetry, query }) {
  if (type === 'loading') {
    return (
      <div className="status-container status-loading" role="status">
        <div className="spinner-large" aria-hidden="true" />
        <p className="status-title">Searching employee directory...</p>
        <p className="status-subtitle">Fetching latest matching personnel records.</p>
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className="status-container status-empty" role="region" aria-label="No results">
        <div className="status-icon-bubble">
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <p className="status-title">No employees found</p>
        <p className="status-subtitle">
          {query
            ? `No records match "${query}". Try searching with a different name or department.`
            : 'No employee records are currently available in the directory.'}
        </p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="status-container status-error" role="alert">
        <div className="status-icon-bubble status-icon-error">
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="status-title">Failed to load directory</p>
        <p className="status-subtitle">{message || 'An unexpected error occurred while communicating with the server.'}</p>
        {onRetry && (
          <button type="button" className="retry-button" onClick={onRetry}>
            Retry Request
          </button>
        )}
      </div>
    );
  }

  return null;
}

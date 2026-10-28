import React from 'react';

export function SearchBar({
  value,
  onChange,
  onClear,
  isLoading,
  placeholder = 'Search by employee name or department...',
}) {
  return (
    <div className="search-bar-wrapper">
      <div className="search-input-container">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search employee directory"
          autoFocus
        />

        {isLoading && (
          <div className="search-spinner" aria-label="Searching...">
            <span className="spinner-indicator" />
          </div>
        )}

        {!isLoading && value && (
          <button
            type="button"
            className="clear-search-button"
            onClick={onClear}
            aria-label="Clear search input"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

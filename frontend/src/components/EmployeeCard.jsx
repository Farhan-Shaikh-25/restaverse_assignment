import React from 'react';

const DEPARTMENT_THEMES = {
  Engineering: { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  'Product Management': { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' },
  Design: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  'Human Resources': { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  Finance: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  Marketing: { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  Sales: { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const parsed = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(parsed);
  } catch {
    return isoString;
  }
}

export function EmployeeCard({ employee }) {
  const { id, name, email, department, designation, date_of_joining } = employee;
  const badgeStyle = DEPARTMENT_THEMES[department] || {
    bg: '#F3F4F6',
    text: '#374151',
    border: '#E5E7EB',
  };

  return (
    <article className="employee-card" data-employee-id={id}>
      <div className="card-header">
        <div className="avatar-badge" aria-hidden="true">
          {getInitials(name)}
        </div>
        <div className="header-info">
          <h3 className="employee-name">{name}</h3>
          <p className="employee-designation">{designation}</p>
        </div>
      </div>

      <div className="card-body">
        <div className="badge-row">
          <span
            className="department-badge"
            style={{
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.text,
              borderColor: badgeStyle.border,
            }}
          >
            {department}
          </span>
        </div>

        <div className="meta-list">
          <div className="meta-item">
            <svg
              className="meta-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`mailto:${email}`} className="meta-link" title={email}>
              {email}
            </a>
          </div>

          <div className="meta-item">
            <svg
              className="meta-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="meta-text">Joined {formatDate(date_of_joining)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

import React from 'react';
import { EmployeeCard } from './EmployeeCard';
import { StatusBanner } from './StatusBanner';

export function EmployeeList({
  employees,
  totalCount,
  isLoading,
  isEmpty,
  isError,
  errorMessage,
  query,
  onRetry,
}) {
  if (isError) {
    return (
      <StatusBanner
        type="error"
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading && employees.length === 0) {
    return <StatusBanner type="loading" />;
  }

  if (isEmpty) {
    return <StatusBanner type="empty" query={query} />;
  }

  return (
    <section className="directory-results-section" aria-label="Employee search results">
      <div className="results-header">
        <h2 className="results-count">
          {totalCount} {totalCount === 1 ? 'employee' : 'employees'} found
        </h2>
        {query && (
          <span className="results-filter-badge">
            Filtered by: &ldquo;{query}&rdquo;
          </span>
        )}
      </div>

      <div className="employee-grid">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </section>
  );
}

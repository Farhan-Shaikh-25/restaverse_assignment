import React from 'react';
import { useEmployeeSearch } from './hooks/useEmployeeSearch';
import { SearchBar } from './components/SearchBar';
import { EmployeeList } from './components/EmployeeList';

const QUICK_DEPARTMENT_FILTERS = [
  'Engineering',
  'Product Management',
  'Design',
  'Human Resources',
  'Finance',
];

export function App() {
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    retry,
    employees,
    totalCount,
    errorMessage,
    isLoading,
    isEmpty,
    isError,
  } = useEmployeeSearch();

  const handleFilterClick = (department) => {
    if (searchTerm.toLowerCase() === department.toLowerCase()) {
      clearSearch();
    } else {
      setSearchTerm(department);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="brand-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">Employee Directory</h1>
              <p className="brand-subtitle">
                Search internal staff by name, title, or department
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="search-controls-section">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            isLoading={isLoading}
          />

          <div className="quick-filters">
            <span className="filters-label">Quick Filters:</span>
            <div className="filter-chips">
              {QUICK_DEPARTMENT_FILTERS.map((dept) => {
                const isActive = searchTerm.toLowerCase() === dept.toLowerCase();
                return (
                  <button
                    key={dept}
                    type="button"
                    className={`filter-chip ${isActive ? 'active' : ''}`}
                    onClick={() => handleFilterClick(dept)}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <EmployeeList
          employees={employees}
          totalCount={totalCount}
          isLoading={isLoading}
          isEmpty={isEmpty}
          isError={isError}
          errorMessage={errorMessage}
          query={searchTerm}
          onRetry={retry}
        />
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <span>Enterprise Directory Service &bull; Production v1.0</span>
          <span>FastAPI + MySQL Connection Pool &bull; React Debounced Engine</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchEmployees } from '../api/client';

export const SEARCH_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  EMPTY: 'empty',
  ERROR: 'error',
};

const DEBOUNCE_DELAY_MS = 300;

export function useEmployeeSearch(initialQuery = '') {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [status, setStatus] = useState(SEARCH_STATUS.IDLE);
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const activeAbortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const executeFetch = useCallback(async (query, signal) => {
    setStatus(SEARCH_STATUS.LOADING);
    setErrorMessage(null);

    try {
      const data = await fetchEmployees(query, signal);
      const items = Array.isArray(data.items) ? data.items : [];
      const total = typeof data.total === 'number' ? data.total : items.length;

      setEmployees(items);
      setTotalCount(total);
      setStatus(items.length === 0 ? SEARCH_STATUS.EMPTY : SEARCH_STATUS.SUCCESS);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setEmployees([]);
      setTotalCount(0);
      setErrorMessage(err.message || 'Failed to fetch directory data.');
      setStatus(SEARCH_STATUS.ERROR);
    }
  }, []);

  useEffect(() => {
    // Clear pending debounce schedule on each keystroke
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel in-flight HTTP request to avoid stale race conditions
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    debounceTimerRef.current = setTimeout(() => {
      executeFetch(searchTerm, controller.signal);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(debounceTimerRef.current);
      controller.abort();
    };
  }, [searchTerm, executeFetch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const retry = useCallback(() => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortControllerRef.current = controller;
    executeFetch(searchTerm, controller.signal);
  }, [searchTerm, executeFetch]);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    retry,
    status,
    employees,
    totalCount,
    errorMessage,
    isLoading: status === SEARCH_STATUS.LOADING,
    isEmpty: status === SEARCH_STATUS.EMPTY,
    isError: status === SEARCH_STATUS.ERROR,
    isSuccess: status === SEARCH_STATUS.SUCCESS,
  };
}

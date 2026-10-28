const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchEmployees(searchQuery = '', signal) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured in the environment.');
  }

  const url = new URL(`${API_BASE_URL.replace(/\/+$/, '')}/employees`);
  if (searchQuery.trim()) {
    url.searchParams.set('search', searchQuery.trim());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      }
    } catch {
      // Non-JSON response payload fallback
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

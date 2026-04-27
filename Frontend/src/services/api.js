const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api';

/**
 * Enhanced Fetch Wrapper for global API integration
 * Features:
 * - Automatic Authorization header attachment
 * - Global 401 Unauthorized handling (Automatic Logout)
 * - Safe JSON parsing with fallback
 * - Descriptive error handling with server-side messages
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const fetchOptions = { ...options };
  
  if (fetchOptions.body && typeof fetchOptions.body === 'object' && !(fetchOptions.body instanceof FormData)) {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // 1. Handle Global Authorization Errors
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized - Please login again');
    }

    // 2. Safe JSON Parsing
    const contentType = response.headers.get('content-type');
    let data = {};
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || response.statusText };
    }

    // STRICT RULE: Always log response
    console.log(`API [${options.method || 'GET'}] ${endpoint}:`, data);

    // 3. Application level Error Handling
    if (!response.ok) {
      const errorMessage = data.message || data.error || `Request failed (${response.status})`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (err) {
    // Check for Network/CORS errors first to avoid noisy console logs
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = 'Backend unreachable at ' + BASE_URL;
      // Use console.warn for network errors to make them less prominent than red errors
      console.warn(`[Network Error] ${endpoint}: ${networkError}`);
      throw new Error('Network error: Ensure backend is running.');
    }
    
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

/**
 * Handle session expiration or unauthorized access
 */
function handleUnauthorized() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?expired=true';
  }
}

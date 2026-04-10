export const getApiUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  if (window.location.hostname.includes('loca.lt')) {
    return 'https://ventitout-api.loca.lt/api';
  }
  return `http://${window.location.hostname}:5000/api`;
};

export const getSocketUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (window.location.hostname.includes('loca.lt')) {
    return 'https://ventitout-api.loca.lt';
  }
  return `http://${window.location.hostname}:5000`;
};

// Wrapper for fetch to instantly bypass LocalTunnel warning screens automatically on API calls
export const apiFetch = async (endpoint, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (window.location.hostname.includes('loca.lt')) {
    headers.set('Bypass-Tunnel-Reminder', 'true');
  }
  return fetch(`${getApiUrl()}${endpoint}`, {
    ...options,
    headers
  });
};

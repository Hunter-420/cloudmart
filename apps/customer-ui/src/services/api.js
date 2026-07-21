const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/products${query ? '?' + query : ''}`);
};

export const getProductById = (id) => apiFetch(`/api/products/${id}`);

export const createProduct = (data) =>
  apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) });

export const getCart = () => apiFetch('/api/cart');

export const addToCart = (productId, quantity) =>
  apiFetch('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) });

export const createOrder = (data) =>
  apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) });

export default apiFetch;

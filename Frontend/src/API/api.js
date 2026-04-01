// Frontend/src/API/api.js

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const fetchWrapper = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeout = 10000;

  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const token = localStorage.getItem("token"); // ✅ MOVE HERE

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
      ...options,
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const API = {
  get: (url, config = {}) => fetchWrapper(url, { method: "GET", ...config }),

  post: (url, data, config = {}) =>
    fetchWrapper(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...config,
    }),

  put: (url, data, config = {}) =>
    fetchWrapper(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...config,
    }),

  delete: (url, config = {}) =>
    fetchWrapper(url, { method: "DELETE", ...config }),
};

export default API;
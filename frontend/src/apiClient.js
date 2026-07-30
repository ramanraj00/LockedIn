export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("auth_token");
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include", // Automatically send cookies/JWT as fallback
    ...options,
    headers
  });

  return response;
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include", // Automatically send cookies/JWT
    ...options,
  });

  return response;
};

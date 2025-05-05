const API_BASE_URL = "http://10.196.175.187:5000";

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/users/register`,
  LOGIN: `${API_BASE_URL}/api/users/login`,
  LOGOUT: `${API_BASE_URL}/api/users/logout`,
};

export const getHeaders = (token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

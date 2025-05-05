import { API_ENDPOINTS, getHeaders } from "./config";

export const register = async (userData) => {
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message );
    }

    return data;
  } catch (error) {
    if (error.message.includes("Network request failed")) {
      throw new Error("تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت");
    }
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "فشل في تسجيل الدخول");
    }

    return data;
  } catch (error) {
    if (error.message.includes("Network request failed")) {
      throw new Error("تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت");
    }
    throw error;
  }
};

export const logout = async (token) => {
  try {
    const response = await fetch(API_ENDPOINTS.LOGOUT, {
      method: "POST",
      headers: getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "فشل في تسجيل الخروج");
    }

    return data;
  } catch (error) {
    if (error.message.includes("Network request failed")) {
      throw new Error("تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت");
    }
    throw error;
  }
};

// API Configuration
export const API_CONFIG = {
  BASE_URL:
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE) ||
    "http://localhost:8080",
  ENDPOINTS: {
    USERS: "/api/users",
    APPOINTMENTS: "/api/appointments",
    AVAILABILITY: "/api/availability",
    VEHICLES: "/api/vehicles",
    SERVICES: "/api/services",
  },
};

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// API Helper function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers as HeadersInit);
  headers.set("Content-Type", "application/json");

  const auth = getAuthHeader();
  Object.entries(auth).forEach(([k, v]) => headers.set(k, v));

  // Debug: Log token info (safe)
  console.log(
    "🔐 API Call:",
    endpoint,
    "Has Token?",
    !!auth.Authorization,
    "Token:",
    auth.Authorization?.substring(0, 50) + "..."
  );

  const defaultOptions: RequestInit = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      let message = `HTTP error! status: ${response.status}`;
      try {
        const data = await response.json();
        if (data?.error?.message) message = data.error.message;
      } catch {}
      throw new Error(message);
    }

    if (response.status === 204) return null; // No content
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

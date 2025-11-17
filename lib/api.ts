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

  // Debug: Log token info (masked)
  const hasToken = !!auth.Authorization;
  const maskedToken = hasToken ? `${auth.Authorization!.slice(0, 10)}...` : "none";
  console.debug("🔐 API Call:", endpoint, "Has Token?", hasToken, "Token:", maskedToken);

  const defaultOptions: RequestInit = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      let message = `HTTP error! status: ${response.status} ${response.statusText}`;
      let errorData: any = null;
      let errorText: string | null = null;
      try {
        // Try parse JSON first
        errorData = await response.json();
        console.error('🔍 Backend Error Details (JSON):', JSON.stringify(errorData, null, 2));
        if (errorData?.message) message = errorData.message;
        else if (errorData?.error?.message) message = errorData.error.message;
        else if (typeof errorData === 'string') message = errorData;
      } catch (parseErr) {
        // If JSON parsing fails, try reading raw text
        try {
          errorText = await response.text();
          console.error('🔍 Backend Error Details (text):', errorText);
          if (errorText) message = errorText
        } catch (textErr) {
          console.debug('Could not read error response body:', textErr);
        }
      }
      // Include URL for easier debugging
      const urlInfo = response.url ? ` (${response.url})` : '';
      throw new Error(`${message}${urlInfo}`);
    }

    if (response.status === 204) return null; // No content
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

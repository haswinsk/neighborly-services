export const API_BASE_URL = (() => {
  const url = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000/api";
  // Ensure URL ends with /api
  if (!url.endsWith("/api")) {
    return url.replace(/\/$/, "") + "/api";
  }
  return url.replace(/\/$/, "");
})();

const buildHeaders = (headers?: HeadersInit) => {
  const token = localStorage.getItem("auth_token");
  const baseHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    return {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  return baseHeaders;
};

export const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
};

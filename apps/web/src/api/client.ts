const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL ?? "");

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const executeRequest = async (overrideToken?: string) => {
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      ...getAuthHeader(),
      ...options?.headers,
    } as Record<string, string>;

    if (overrideToken) {
      headers["Authorization"] = `Bearer ${overrideToken}`;
    }

    return fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });
  };

  let res = await executeRequest();

  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) {
          throw new Error("Refresh failed");
        }

        const data = await refreshRes.json();
        const newToken = data.accessToken;
        
        localStorage.setItem("accessToken", newToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        isRefreshing = false;
        onRefreshed(newToken);
        
        // Retry the failed request
        res = await executeRequest(newToken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      // Wait for the token refresh to complete
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve);
      });
      res = await executeRequest(newToken);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }
  const text = await res.text();
  if (!text.trim()) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
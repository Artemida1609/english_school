const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL ?? "");

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
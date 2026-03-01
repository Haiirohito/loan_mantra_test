// src/lib/api.ts
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  const text = await res.text();
  if (!res.ok) {
    try {
      const json = JSON.parse(text);
      return { error: json.error || res.statusText };
    } catch {
      return { error: `API Error: ${res.status} ${res.statusText}` };
    }
  }

  try {
    return JSON.parse(text || "{}");
  } catch {
    return text;
  }
}

export const api = {
  createSubmission: (payload: any) =>
    request("/api/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Public
  uploadDocs: (id: string) =>
    request(`/api/submissions/${id}/upload`, { method: "POST" }),
};

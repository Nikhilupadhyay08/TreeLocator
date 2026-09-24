// frontend/src/api/custom-fetch.ts

export type AuthTokenGetter = () => string | null | Promise<string | null>;

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

// Use VITE_API_URL in production (Vercel).
// Example: https://treelocator-backend.onrender.com
//
// If VITE_API_URL is not set, relative /api URLs are used,
// which allows the local Vite proxy to work normally.
const envBaseUrl = import.meta.env.VITE_API_URL;

if (envBaseUrl) {
  _baseUrl = envBaseUrl.replace(/\/+$/, "");
}

/**
 * Set the base URL for API requests.
 */
export function setBaseUrl(baseUrl: string | null) {
  _baseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : null;
}

/**
 * Get the current API base URL.
 */
export function getBaseUrl(): string | null {
  return _baseUrl;
}

/**
 * Set a function that provides the authentication token.
 */
export function setAuthTokenGetter(getter: AuthTokenGetter | null) {
  _authTokenGetter = getter;
}

/**
 * Apply the configured base URL to an API path.
 */
function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) {
    return input;
  }

  if (typeof input === "string") {
    if (input.startsWith("/")) {
      return `${_baseUrl}${input}`;
    }

    return input;
  }

  if (input instanceof URL) {
    if (input.pathname.startsWith("/")) {
      return new URL(`${_baseUrl}${input.pathname}${input.search}`);
    }

    return input;
  }

  return input;
}

/**
 * Add authentication headers when a token is available.
 */
async function applyAuthHeaders(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<RequestInit> {
  const headers = new Headers(init.headers);

  if (_authTokenGetter) {
    const token = await _authTokenGetter();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return {
    ...init,
    headers,
  };
}

/**
 * Custom fetch wrapper used by the API client.
 */
export async function customFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const url = applyBaseUrl(input);
  const options = await applyAuthHeaders(url, init);

  return fetch(url, options);
}

/**
 * Convenience HTTP methods.
 */
export async function get<T = unknown>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await customFetch(url, {
    ...init,
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export async function post<T = unknown>(
  url: string,
  body?: unknown,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await customFetch(url, {
    ...init,
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`POST ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export async function put<T = unknown>(
  url: string,
  body?: unknown,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await customFetch(url, {
    ...init,
    method: "PUT",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`PUT ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export async function patch<T = unknown>(
  url: string,
  body?: unknown,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await customFetch(url, {
    ...init,
    method: "PATCH",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`PATCH ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export async function del<T = unknown>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await customFetch(url, {
    ...init,
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`DELETE ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export default customFetch;
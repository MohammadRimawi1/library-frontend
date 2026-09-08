import type { ApiError } from '@/types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';
const TOKEN_KEY = 'athenaeum_token';
const USER_KEY = 'athenaeum_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiRequestError extends Error {
  status: number;
  error: string;
  timestamp: string;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiRequestError';
    this.status = apiError.status;
    this.error = apiError.error;
    this.timestamp = apiError.timestamp;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, skipAuth } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  // Try to parse JSON
  let data: unknown = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const apiError = data as ApiError;
    if (apiError && typeof apiError.message === 'string') {
      if (apiError.status === 401 && !skipAuth) {
        clearAuth();
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
      throw new ApiRequestError(apiError);
    }
    throw new ApiRequestError({
      status: res.status,
      error: res.statusText,
      message: 'An unexpected error occurred. Please try again.',
      timestamp: new Date().toISOString(),
    });
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'POST', body, signal }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

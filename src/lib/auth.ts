export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
}

export interface AuthState {
  token: string;
  user: AuthUser;
}

const STORAGE_KEY = "supplydesk-auth";
const AUTH_BASE = "/api/auth";

export function getStoredAuth(): AuthState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function saveAuth(state: AuthState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken(): string | null {
  const auth = getStoredAuth();
  return auth?.token ?? null;
}

export function getStoredUser(): AuthUser | null {
  const auth = getStoredAuth();
  return auth?.user ?? null;
}

async function request(path: string, body: unknown) {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message ?? `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const payload = await request("/login", { email, password });
  const state: AuthState = {
    token: payload.token,
    user: payload.user,
  };
  saveAuth(state);
  return state;
}

export async function register(name: string, email: string, password: string) {
  const payload = await request("/register", { name, email, password });
  const state: AuthState = {
    token: payload.token,
    user: payload.user,
  };
  saveAuth(state);
  return state;
}

export async function fetchMe(token: string) {
  const res = await fetch(`${AUTH_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Unable to verify authentication");
  }

  return res.json() as Promise<AuthUser>;
}

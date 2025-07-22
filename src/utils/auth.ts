// src/utils/auth.ts

const TOKEN_KEY = "shellsync_token";
const ROLE_KEY = "shellsync_user_role";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY); // 🔑 Clear role when logging out
}

// ✅ Role helpers

export function setUserRole(role: string) {
  localStorage.setItem(ROLE_KEY, role);
}

export function getUserRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function clearUserRole() {
  localStorage.removeItem(ROLE_KEY);
}

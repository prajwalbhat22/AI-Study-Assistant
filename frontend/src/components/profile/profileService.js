// profileService.js
// Handles all profile-related API interactions

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ─── Profile CRUD ────────────────────────────────────────────────────────────

export const profileService = {
  /**
   * Fetch authenticated user's profile
   */
  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  },

  /**
   * Update user's full name (and optional avatar)
   * @param {{ full_name: string }} data
   */
  async updateProfile(data) {
    const res = await fetch(`${API_BASE}/auth/profile/update/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Failed to update profile");
    }
    return res.json();
  },

  /**
   * Change the user's password
   * @param {{ old_password: string, new_password: string, confirm_password: string }} data
   */
  async changePassword(data) {
    const res = await fetch(`${API_BASE}/auth/change-password/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.detail || err?.old_password?.[0] || "Failed to change password"
      );
    }
    return res.json();
  },

  /**
   * Fetch account-level statistics (topics, notes, materials, study time)
   */
  async getStats() {
    const res = await fetch(`${API_BASE}/auth/profile/stats/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  /**
   * Logout: blacklist refresh token server-side then clear local storage
   */
  async logout() {
    const refresh = localStorage.getItem("refresh_token");
    try {
      await fetch(`${API_BASE}/auth/logout/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ refresh }),
      });
    } catch (_) {
      // best-effort; clear locally regardless
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },
};

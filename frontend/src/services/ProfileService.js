// src/services/ProfileService.js

import axiosClient from "../api/axiosClient";

export const profileService = {
  async getProfile() {
    const userRaw = localStorage.getItem("user");

    if (userRaw) {
      const user = JSON.parse(userRaw);

      return {
        full_name: user.fullName || user.full_name || "Student",
        email: user.email || "student@example.com",
      };
    }

    return {
      full_name: "Student",
      email: "student@example.com",
    };
  },

  async updateProfile(data) {
    const userRaw = localStorage.getItem("user");
    const existingUser = userRaw ? JSON.parse(userRaw) : {};

    const updatedUser = {
      ...existingUser,
      fullName: data.full_name,
      full_name: data.full_name,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    return {
      full_name: updatedUser.fullName,
      email: updatedUser.email || "student@example.com",
    };
  },

  async changePassword(data) {
    console.log("Change password data:", data);

    return {
      message: "Password change UI is ready. Backend API can be connected later.",
    };
  },

  async getStats() {
    try {
      const [topicsRes, notesRes, materialsRes] = await Promise.allSettled([
        axiosClient.get("/topics"),
        axiosClient.get("/topics/0/notes/all"),
        axiosClient.get("/notes/4/materials"),
      ]);

      const topics =
        topicsRes.status === "fulfilled" && Array.isArray(topicsRes.value.data)
          ? topicsRes.value.data.length
          : 0;

      const notes =
        notesRes.status === "fulfilled" && Array.isArray(notesRes.value.data)
          ? notesRes.value.data.length
          : 0;

      const materials =
        materialsRes.status === "fulfilled" && Array.isArray(materialsRes.value.data)
          ? materialsRes.value.data.length
          : 0;

      return {
        topics,
        notes,
        materials,
        study_time: "12h",
      };
    } catch {
      return {
        topics: 0,
        notes: 0,
        materials: 0,
        study_time: "0h",
      };
    }
  },

    async logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    }
};
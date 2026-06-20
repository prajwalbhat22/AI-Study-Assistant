// src/services/dashboardService.js

import axiosClient from "../api/axiosClient";

export async function getDashboardStats() {
  try {
    const res = await axiosClient.get("/dashboard/stats");
    return res.data;
  } catch (error) {
    console.error("Dashboard stats error:", error.response || error);

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load dashboard statistics."
    );
  }
}
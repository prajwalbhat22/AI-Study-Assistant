// src/services/topicService.js

import axiosClient from "../api/axiosClient";

/**
 * Fetch all topics for the authenticated user.
 * GET /api/topics
 */
export async function getAllTopics() {
  try {
    const res = await axiosClient.get("/topics");
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to load topics."
    );
  }
}

/**
 * Create a new topic.
 * POST /api/topics
 * @param {{ name: string, description?: string }} payload
 */
export async function createTopic(payload) {
  try {
    const res = await axiosClient.post("/topics", payload);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to create topic."
    );
  }
}

/**
 * Update an existing topic.
 * PUT /api/topics/{id}
 * @param {number|string} id
 * @param {{ name: string, description?: string }} payload
 */
export async function updateTopic(id, payload) {
  try {
    const res = await axiosClient.put(`/topics/${id}`, payload);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update topic."
    );
  }
}

/**
 * Delete a topic by ID.
 * DELETE /api/topics/{id}
 * @param {number|string} id
 */
export async function deleteTopic(id) {
  try {
    await axiosClient.delete(`/topics/${id}`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to delete topic."
    );
  }
}
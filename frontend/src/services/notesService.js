// src/services/notesService.js

import axiosClient from "../api/axiosClient";

export async function getAllNotes() {
  try {
    const res = await axiosClient.get("/topics/0/notes/all");
    return Array.isArray(res.data) ? res.data : res.data.notes ?? [];
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load notes."
    );
  }
}

export async function createNote(payload) {
  try {
    const topicId = payload.topicId;

    if (!topicId) {
      throw new Error("Please select a topic before creating a note.");
    }

    const res = await axiosClient.post(`/topics/${topicId}/notes`, {
      title: payload.title,
      content: payload.content,
    });

    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create note."
    );
  }
}

export async function updateNote(id, payload) {
  try {
    const topicId = payload.topicId;

    if (!topicId) {
      throw new Error("Topic is required to update note.");
    }

    const res = await axiosClient.put(`/topics/${topicId}/notes/${id}`, {
      title: payload.title,
      content: payload.content,
    });

    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update note."
    );
  }
}

export async function deleteNote(note) {
  try {
    const topicId = note.topicId;
    const noteId = note.id;

    if (!topicId) {
      throw new Error("Topic is required to delete note.");
    }

    await axiosClient.delete(`/topics/${topicId}/notes/${noteId}`);
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to delete note."
    );
  }
}
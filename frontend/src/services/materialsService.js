// src/services/materialsService.js

import axiosClient from "../api/axiosClient";

// TEMP: using first note id
const DEFAULT_NOTE_ID = 4;

export async function getAllMaterials() {
  try {
    const res = await axiosClient.get(`/notes/${DEFAULT_NOTE_ID}/materials`);
    return Array.isArray(res.data) ? res.data : res.data.materials ?? [];
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load materials."
    );
  }
}

export async function uploadMaterial(file, topicId = null, onUploadProgress) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post(
      `/notes/${DEFAULT_NOTE_ID}/materials/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      }
    );

    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Upload failed. Please try again."
    );
  }
}

export async function downloadMaterial(id, fileName) {
  try {
    const res = await axiosClient.get(
      `/notes/${DEFAULT_NOTE_ID}/materials/${id}/download`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Download failed."
    );
  }
}

export async function deleteMaterial(id) {
  try {
    await axiosClient.delete(`/notes/${DEFAULT_NOTE_ID}/materials/${id}`);
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete material."
    );
  }
}
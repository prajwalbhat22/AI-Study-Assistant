package com.studyassistant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * StudyMaterialResponse — DTO returned when listing or fetching study materials.
 *
 * Used for:
 *   GET /api/notes/{noteId}/materials        → returns List<StudyMaterialResponse>
 *   GET /api/notes/{noteId}/materials/{id}   → returns StudyMaterialResponse
 *
 * What it intentionally EXCLUDES from the entity:
 *   - filePath  → internal server path; never expose this to clients
 *   - note      → the full Note object; not needed, client already knows the noteId
 *
 * Follows the same structure as your NoteResponse and TopicResponse.
 */
@Data
// Lombok: generates getters, setters, toString(), equals(), hashCode()

@Builder
// Lombok: enables builder pattern for clean object construction in the Service layer:
//   StudyMaterialResponse.builder()
//       .id(material.getId())
//       .fileName(material.getOriginalFileName())
//       .build();

@NoArgsConstructor
// Lombok: no-arg constructor — required by Jackson for JSON deserialization

@AllArgsConstructor
// Lombok: all-args constructor — required by @Builder

public class StudyMaterialResponse {

    private Long id;
    // The unique identifier of this study material.
    // Used by the frontend to target a specific file (e.g., for delete or download).

    private String fileName;
    // The ORIGINAL filename as uploaded by the user (e.g., "Chapter 3 Notes.pdf").
    // Mapped from entity's originalFileName — this is what the user sees.
    // We do NOT expose the internal sanitized fileName stored on disk.

    private String fileType;
    // The MIME type of the file (e.g., "application/pdf", "image/jpeg").
    // Frontend uses this to show the right icon (PDF icon, image thumbnail, etc.)
    // and to decide how to open or preview the file.

    private String fileSize;
    // Human-readable file size (e.g., "2.4 MB", "340 KB").
    // NOTE: the entity stores raw bytes (Long), but we convert it to a readable
    // string in the Service layer before setting it here.
    // This keeps formatting logic in the backend, not scattered across frontends.

    private String downloadUrl;
    // The API URL the frontend calls to download or preview this file.
    // Example: "/api/notes/5/materials/12/download"
    // We build this in the Service layer — the entity itself has no concept of URLs.
    // This decouples the storage location from how clients access the file.

    private Long noteId;
    // The ID of the Note this material belongs to.
    // Included so the frontend can navigate back to the parent note if needed.
    // We send just the ID — not the entire Note object — to keep the response flat.

    private LocalDateTime uploadedAt;
    // When this file was uploaded.
    // Used for display ("Uploaded 2 days ago") and sorting in the UI.
    // Maps directly from the entity field set by @PrePersist.

    private Long topicId;
    private String topicTitle;
}
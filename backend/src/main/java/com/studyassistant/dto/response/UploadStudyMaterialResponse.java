package com.studyassistant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * UploadStudyMaterialResponse — DTO returned immediately after a successful file upload.
 *
 * Used for:
 *   POST /api/notes/{noteId}/materials/upload → returns UploadStudyMaterialResponse
 *
 * Why a SEPARATE DTO from StudyMaterialResponse?
 *
 * After an upload, the client needs confirmation-specific data:
 *   - A success message ("File uploaded successfully")
 *   - The full material details (so the UI can immediately show the new file)
 *
 * We COULD reuse StudyMaterialResponse and just add a "message" field,
 * but keeping them separate means:
 *   1. Each DTO has a single, clear purpose (Single Responsibility Principle)
 *   2. Upload responses can evolve independently (e.g., add processingStatus later)
 *   3. Matches the pattern of your existing AuthResponse which wraps a message + data
 *
 * Follows the same structure as your existing response DTOs.
 */
@Data
// Lombok: generates getters, setters, toString(), equals(), hashCode()

@Builder
// Lombok: builder pattern for clean construction in the Service layer

@NoArgsConstructor
// Lombok: no-arg constructor for Jackson deserialization

@AllArgsConstructor
// Lombok: all-args constructor required by @Builder

public class UploadStudyMaterialResponse {

    private String message;
    // A human-readable confirmation message.
    // Example: "File uploaded successfully"
    // Displayed as a success toast/notification in the frontend.
    // Keeps the frontend decoupled — it doesn't need to hardcode success strings.

    private Long id;
    // The database ID assigned to the newly created StudyMaterial record.
    // The frontend uses this immediately (e.g., to render a delete button,
    // or to construct the download URL without needing a separate GET request).

    private String fileName;
    // The original filename the user uploaded (e.g., "Lecture Notes Week 5.pdf").
    // Shown immediately in the UI after upload so the user gets visual confirmation
    // that the right file was uploaded.

    private String fileType;
    // MIME type of the uploaded file (e.g., "application/pdf").
    // Frontend uses this to display the correct file type icon right after upload.

    private String fileSize;
    // Human-readable file size (e.g., "1.8 MB").
    // Shown in the upload confirmation so the user knows the file size was accepted.
    // Converted from raw bytes in the Service layer before setting here.

    private String downloadUrl;
    // The URL to download or preview the uploaded file.
    // Returned immediately so the frontend can make the file clickable right away —
    // without needing to refresh or make a separate GET /materials request.

    private Long noteId;
    // The ID of the Note this file was attached to.
    // Useful for the frontend to confirm the file went to the right note,
    // and to refresh the note's file list after the upload.

    private LocalDateTime uploadedAt;
    // The server-side timestamp of when the upload was processed.
    // Displayed as "Just now" or a formatted timestamp in the file list UI.
}
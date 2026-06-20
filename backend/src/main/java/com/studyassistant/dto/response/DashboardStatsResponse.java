package com.studyassistant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DashboardStatsResponse — DTO returned by GET /api/dashboard/stats
 *
 * Contains aggregate statistics for the currently authenticated user.
 * Every field reflects data owned exclusively by that user — no cross-user leakage.
 *
 * Design decisions:
 *   - totalStorageUsed is a pre-formatted String ("14.7 MB") not raw bytes.
 *     The backend owns formatting so all clients (web, mobile, future) display
 *     consistently without duplicating the conversion logic.
 *   - recentMaterialsCount uses a 7-day window — wide enough to be meaningful,
 *     narrow enough to reflect recent activity rather than all-time history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalTopics;
    // How many Topics the user has created.
    // Gives a sense of how organized their study space is.

    private long totalNotes;
    // Total Notes across ALL of the user's Topics combined.
    // Not scoped to a single topic — this is the global note count.

    private long totalStudyMaterials;
    // Total uploaded files across ALL notes across ALL topics.
    // Reflects how much content the user has attached to their notes.

    private String totalStorageUsed;
    // Human-readable total storage consumed by all uploaded files.
    // Examples: "0 B", "340.0 KB", "14.7 MB"
    // Calculated as SUM(file_size) across all study_materials for this user,
    // then formatted by the service before being set here.

    private long recentMaterialsCount;
    // Number of files uploaded in the last 7 days.
    // Provides a "recent activity" signal — useful for showing
    // "You've been busy lately!" or similar UI nudges.
    // 7 days chosen as a balance between "today only" (too narrow)
    // and "this month" (too broad to feel recent).
}
package com.studyassistant.service;

import com.studyassistant.dto.response.DashboardStatsResponse;
import com.studyassistant.repository.NoteRepository;
import com.studyassistant.repository.StudyMaterialRepository;
import com.studyassistant.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * DashboardService — Assembles aggregate statistics for the authenticated user.
 *
 * Responsibilities:
 *   1. Extract the logged-in user's email from the Security Context
 *   2. Query each repository for counts/sums scoped to that email
 *   3. Format raw bytes into a human-readable storage string
 *   4. Build and return DashboardStatsResponse
 *
 * No ownership validation needed here (unlike StudyMaterialService) because
 * all queries are inherently scoped to the JWT user's email — there is no
 * user-supplied ID that could be tampered with.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final TopicRepository topicRepository;
    // Provides countByUserEmail()

    private final NoteRepository noteRepository;
    // Provides countByTopicUserEmail()

    private final StudyMaterialRepository studyMaterialRepository;
    // Provides countByNoteTopicUserEmail(), sumFileSizeByUserEmail(),
    // and countRecentMaterialsByUserEmail()

    // ─────────────────────────────────────────
    // MAIN METHOD
    // ─────────────────────────────────────────

    /**
     * Gathers all dashboard statistics for the currently authenticated user.
     *
     * @return DashboardStatsResponse populated with the user's aggregate data
     */
    public DashboardStatsResponse getDashboardStats() {

        // ── Resolve logged-in user from Security Context ──
        String currentUserEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        // The JWT filter has already validated the token by the time this runs.
        // getName() returns the email stored as the subject in your JWT (from your
        // existing JwtService/JwtUtil — consistent with all other services).

        log.info("Fetching dashboard stats for user: {}", currentUserEmail);

        // ── Query 1: Total Topics ──
        long totalTopics = topicRepository.countByUserEmail(currentUserEmail);
        // COUNT(*) FROM topics WHERE user_id = (user with this email)

        // ── Query 2: Total Notes ──
        long totalNotes = noteRepository.countByTopicUserEmail(currentUserEmail);
        // COUNT(*) FROM notes JOIN topics JOIN users WHERE email = ?

        // ── Query 3: Total Study Materials ──
        long totalMaterials = studyMaterialRepository.countByNoteTopicUserEmail(currentUserEmail);
        // COUNT(*) FROM study_materials JOIN notes JOIN topics JOIN users WHERE email = ?

        // ── Query 4: Total Storage Used ──
        long totalBytes = studyMaterialRepository.sumFileSizeByUserEmail(currentUserEmail);
        // SUM(file_size) across all materials for this user.
        // Returns 0 (not null) thanks to COALESCE in the @Query.
        String totalStorageUsed = formatFileSize(totalBytes);
        // Convert raw bytes → "14.7 MB" for direct display in the UI.

        // ── Query 5: Recent Materials (last 7 days) ──
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentMaterials = studyMaterialRepository
                .countRecentMaterialsByUserEmail(currentUserEmail, sevenDaysAgo);
        // COUNT where uploaded_at >= (now - 7 days) AND owned by this user.

        log.info("Dashboard stats for {}: topics={}, notes={}, materials={}, " +
                 "storage={}, recentMaterials={}",
                currentUserEmail, totalTopics, totalNotes,
                totalMaterials, totalStorageUsed, recentMaterials);

        // ── Assemble and return the response ──
        return DashboardStatsResponse.builder()
                .totalTopics(totalTopics)
                .totalNotes(totalNotes)
                .totalStudyMaterials(totalMaterials)
                .totalStorageUsed(totalStorageUsed)
                .recentMaterialsCount(recentMaterials)
                .build();
    }

    // ─────────────────────────────────────────
    // PRIVATE HELPER
    // ─────────────────────────────────────────

    /**
     * Converts raw bytes to a human-readable size string.
     *
     * Intentionally duplicated from StudyMaterialService rather than extracted
     * to a shared utility class — keeping services self-contained avoids creating
     * shared state or hidden dependencies. Extract to a FileUtils class only
     * when a third service needs it.
     *
     * Examples:
     *   0          → "0 B"
     *   500        → "500 B"
     *   2457600    → "2.3 MB"
     */
    private String formatFileSize(long bytes) {
        if (bytes <= 0) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }
}
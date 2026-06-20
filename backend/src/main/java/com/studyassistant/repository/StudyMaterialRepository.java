package com.studyassistant.repository;

import com.studyassistant.model.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

/**
 * StudyMaterialRepository — Data Access Layer for StudyMaterial.
 *
 * Extends JpaRepository which provides built-in methods for free:
 *   save(), findById(), findAll(), deleteById(), existsById(), count(), etc.
 *
 * Spring Data JPA auto-generates the SQL from the method names below.
 * You do NOT write any SQL — Spring reads the method name and builds the query.
 */
@Repository
// @Repository marks this as a Spring-managed bean for the data layer.
// Also enables Spring's exception translation (converts DB exceptions to Spring exceptions).

public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    // JpaRepository<StudyMaterial, Long>:
    //   StudyMaterial → the entity this repository manages
    //   Long          → the type of the primary key (id field)

    /**
     * Find all study materials attached to a specific Note.
     *
     * Spring generates:
     *   SELECT * FROM study_materials WHERE note_id = ?
     *
     * Used when a user opens a Note and wants to see all uploaded files.
     */
    List<StudyMaterial> findByNoteId(Long noteId);

    /**
     * Find all study materials for a Note, ordered by upload time (newest first).
     *
     * Spring generates:
     *   SELECT * FROM study_materials WHERE note_id = ? ORDER BY uploaded_at DESC
     *
     * Preferred over findByNoteId() for consistent display ordering in the UI.
     */
    List<StudyMaterial> findByNoteIdOrderByUploadedAtDesc(Long noteId);

    /**
     * Find a specific study material by its ID AND the Note it belongs to.
     *
     * Spring generates:
     *   SELECT * FROM study_materials WHERE id = ? AND note_id = ?
     *
     * Why both id AND noteId? — Security.
     * Without the noteId check, a user could request any file by ID,
     * even files belonging to another user's notes.
     * This ensures the file actually belongs to the expected note.
     */
    Optional<StudyMaterial> findByIdAndNoteId(Long id, Long noteId);

    /**
     * Check if a material with a given fileName already exists under a Note.
     *
     * Spring generates:
     *   SELECT COUNT(*) > 0 FROM study_materials WHERE note_id = ? AND file_name = ?
     *
     * Used before saving to detect duplicate uploads.
     */
    boolean existsByNoteIdAndFileName(Long noteId, String fileName);

    /**
     * Count how many files are attached to a given Note.
     *
     * Spring generates:
     *   SELECT COUNT(*) FROM study_materials WHERE note_id = ?
     *
     * Useful for enforcing per-note file limits (e.g., max 10 files per note).
     */
    long countByNoteId(Long noteId);
    // Dashboard statistics
    long countByNoteTopicUserEmail(String email);

    @Query("SELECT COALESCE(SUM(sm.fileSize), 0) FROM StudyMaterial sm WHERE sm.note.topic.user.email = :email")
    long sumFileSizeByUserEmail(@Param("email") String email);

    @Query("SELECT COUNT(sm) FROM StudyMaterial sm WHERE sm.note.topic.user.email = :email AND sm.uploadedAt >= :since")
    long countRecentMaterialsByUserEmail(
        @Param("email") String email,
        @Param("since") LocalDateTime since
    );
    
    List<StudyMaterial> findByNoteTopicUserEmailOrderByUploadedAtDesc(String email);
}
package com.studyassistant.repository;

import com.studyassistant.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * NoteRepository — The data access layer for Note entities.
 *
 * By extending JpaRepository<Note, Long>, Spring automatically provides:
 *   save(note)           → INSERT or UPDATE a note
 *   findById(id)         → SELECT * FROM notes WHERE id = ?
 *   findAll()            → SELECT * FROM notes
 *   deleteById(id)       → DELETE FROM notes WHERE id = ?
 *   existsById(id)       → Check if a note exists
 *   count()              → Total number of notes
 *
 * JpaRepository<Note, Long>
 *   Note → The entity this repository manages
 *   Long → The data type of Note's primary key (@Id field)
 *
 * @Repository → Marks this as a Spring-managed DAO bean.
 *               Also enables Spring to translate DB exceptions into
 *               Spring's unified DataAccessException hierarchy.
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    /**
     * Find all notes that belong to a specific topic.
     *
     * Spring Data JPA reads the method name and automatically generates SQL:
     * SELECT * FROM notes WHERE topic_id = ?
     *
     * Convention: findBy + FieldName + NestedField
     *   "topic"   → the 'topic' field in Note.java
     *   "Id"      → the 'id' field inside Topic.java
     *
     * @param topicId - The ID of the topic whose notes we want
     * @return List of all Note objects belonging to that topic
     */
    List<Note> findByTopicId(Long topicId);

    /**
     * Find all notes belonging to a topic, but ONLY if that topic
     * belongs to a specific user.
     *
     * Generated SQL:
     * SELECT * FROM notes
     * WHERE topic_id = ? AND topic.user_id = ?
     *
     * WHY THIS MATTERS (Security):
     * Without this check, User A could request notes using any topic_id
     * and accidentally (or maliciously) access User B's notes.
     * This query ensures a user can only fetch their own notes.
     *
     * @param topicId - The topic ID to search in
     * @param userId  - The user ID who must own the topic
     * @return List of notes that match both conditions
     */
    List<Note> findByTopicIdAndTopicUserId(Long topicId, Long userId);

    /**
     * Check if a note exists AND belongs to a topic owned by the given user.
     *
     * Generated SQL:
     * SELECT COUNT(*) > 0 FROM notes
     * WHERE id = ? AND topic.user_id = ?
     *
     * Used in the Service layer to verify ownership before
     * allowing UPDATE or DELETE operations on a note.
     *
     * @param id     - The note ID to check
     * @param userId - The user who should own the note's topic
     * @return true if the note exists and belongs to the user, false otherwise
     */
    boolean existsByIdAndTopicUserId(Long id, Long userId);

    long countByTopicUserEmail(String email);
}
package com.studyassistant.dto.response;

import java.time.LocalDateTime;

/**
 * NoteResponse DTO — What the SERVER sends BACK to the client.
 *
 * Used for ALL responses involving a note:
 *   POST   /api/topics/{topicId}/notes       → Returns the created note
 *   GET    /api/topics/{topicId}/notes        → Returns list of these
 *   GET    /api/topics/{topicId}/notes/{id}   → Returns one of these
 *   PUT    /api/topics/{topicId}/notes/{id}   → Returns the updated note
 *
 * WHAT WE EXPOSE TO THE CLIENT:
 *   ✅ id          → Client needs this to make future GET/PUT/DELETE calls
 *   ✅ title       → Display in the UI
 *   ✅ content     → Display in the UI
 *   ✅ createdAt   → Show "Created on..." in the UI
 *   ✅ topicId     → Lets the client know which topic this note belongs to
 *   ✅ topicTitle  → Useful for UI breadcrumbs like "Java Basics > Note Title"
 *
 * WHAT WE DO NOT EXPOSE:
 *   ❌ The full Topic object  → Unnecessary nesting, wastes bandwidth
 *   ❌ The User object        → Never expose user data inside note responses
 *   ❌ Password or tokens     → Obviously never
 *
 * WHY topicTitle AND topicId?
 *   Instead of returning the entire Topic object (which contains the
 *   entire User object), we cherry-pick just the two fields the
 *   frontend actually needs. This is called "flattening" the response.
 */
public class NoteResponse {

    /**
     * The unique ID of this note in the database.
     * The client uses this for PUT /notes/{id} and DELETE /notes/{id} calls.
     */
    private Long id;

    /**
     * The note title — shown as a heading in the UI.
     */
    private String title;

    /**
     * The full study content of the note.
     */
    private String content;

    /**
     * When this note was created.
     * LocalDateTime serializes to ISO-8601 format in JSON:
     * "2025-06-10T14:30:00" — readable and standard.
     */
    private LocalDateTime createdAt;

    /**
     * The ID of the Topic this note belongs to.
     *
     * WHY INCLUDE THIS?
     * After creating a note, the client needs to know which topic it
     * was saved under — especially useful for navigation and state
     * management in a React/Angular frontend.
     */
    private Long topicId;

    /**
     * The title of the Topic this note belongs to.
     *
     * WHY INCLUDE THIS?
     * Instead of making a second API call to fetch the topic name,
     * we include it here directly. This is more efficient and lets
     * the UI show breadcrumbs like:
     *   "Java Basics  ›  What is Inheritance?"
     *
     * This is fetched from note.getTopic().getTitle() in the Service layer.
     */
    private String topicTitle;

    // ─────────────────────────────────────────────
    // DEFAULT CONSTRUCTOR
    // Required by Jackson for deserialization.
    // ─────────────────────────────────────────────
    public NoteResponse() {
    }

    /**
     * FULL CONSTRUCTOR — Used in the Service layer.
     *
     * When the Service fetches a Note entity from the database,
     * it will call this constructor to build a clean response:
     *
     * Example (in Service, later):
     *   return new NoteResponse(
     *       note.getId(),
     *       note.getTitle(),
     *       note.getContent(),
     *       note.getCreatedAt(),
     *       note.getTopic().getId(),
     *       note.getTopic().getTitle()
     *   );
     *
     * This is the ONLY place where we reach into the Note entity.
     * The Controller never touches the entity — it only sees this DTO.
     *
     * @param id         - Note's database ID
     * @param title      - Note heading
     * @param content    - Note body
     * @param createdAt  - Creation timestamp
     * @param topicId    - ID of the parent Topic
     * @param topicTitle - Title of the parent Topic
     */
    public NoteResponse(Long id, String title, String content,
                        LocalDateTime createdAt, Long topicId, String topicTitle) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.topicId = topicId;
        this.topicTitle = topicTitle;
    }

    // ─────────────────────────────────────────────
    // GETTERS AND SETTERS
    // Jackson uses getters to convert this object into JSON
    // that gets sent back to the client in the HTTP response body.
    // ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getTopicId() {
        return topicId;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }

    public String getTopicTitle() {
        return topicTitle;
    }

    public void setTopicTitle(String topicTitle) {
        this.topicTitle = topicTitle;
    }
}

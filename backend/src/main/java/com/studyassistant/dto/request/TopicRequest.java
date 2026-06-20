package com.studyassistant.dto.request;

/**
 * TopicRequest — The shape of JSON the client sends when
 * creating or updating a topic.
 *
 * This is what the client sends in the request body:
 * {
 *   "name": "Java Programming",
 *   "description": "Core Java concepts for interviews"
 * }
 *
 * Why a separate class for this?
 *   1. The client should NOT send id, createdAt, or userId —
 *      those are set by the server. This DTO enforces that contract.
 *   2. If your Topic entity changes internally (new columns, renames),
 *      this DTO stays stable — your API contract doesn't break.
 *   3. You can add request-specific validation annotations here later
 *      (e.g., @NotBlank, @Size) without touching the entity.
 *
 * Used by:
 *   POST /api/topics        (create)
 *   PUT  /api/topics/{id}   (update)
 */
public class TopicRequest {

    // The name the user wants to give their topic.
    // Required — the Service will validate this is not blank.
    private String name;

    // Optional description of the topic.
    // Client can omit this field entirely, or send null, or send empty string.
    private String description;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public TopicRequest() {
        // Default no-arg constructor required by Jackson.
        // Jackson is the library Spring uses to deserialize JSON → Java object.
        // When Spring receives: { "name": "Java", "description": "..." }
        // it calls this constructor first, then calls setName() and setDescription().
        // Without this constructor, Jackson throws an error.
    }

    public TopicRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // -----------------------------------------------------------------------
    // Getters and Setters
    // -----------------------------------------------------------------------
    // Jackson needs getters to serialize (Java → JSON)
    // and setters to deserialize (JSON → Java).
    // Without these, fields will be null even if the client sent values.

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
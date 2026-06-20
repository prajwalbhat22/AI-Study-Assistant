package com.studyassistant.dto.response;

import com.studyassistant.model.Topic;

import java.util.Date;

/**
 * TopicResponse — The shape of JSON the server sends back to the client.
 *
 * This is what the client receives after create/get/update operations:
 * {
 *   "id": 1,
 *   "name": "Java Programming",
 *   "description": "Core Java concepts for interviews",
 *   "createdAt": "2025-01-15T14:30:00.000+00:00"
 * }
 *
 * Notice what is NOT here:
 *   ❌ user object   → would expose email, password hash
 *   ❌ userId        → internal database detail, client doesn't need it
 *
 * The static factory method fromTopic() is the bridge between
 * the Topic entity (internal) and TopicResponse (external/public).
 */
public class TopicResponse {

    // The unique ID of this topic in the database.
    // The client needs this to build URLs like:
    //   PUT /api/topics/1
    //   DELETE /api/topics/1
    private Long id;

    private String name;

    private String description;

    // When this topic was created.
    // Jackson serializes Java Date as a timestamp number by default.
    // We'll keep it simple for now — formatting can be improved later.
    private Date createdAt;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public TopicResponse() {
        // Default no-arg constructor required by Jackson for serialization.
    }

    public TopicResponse(Long id, String name, String description, Date createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
    }

    // -----------------------------------------------------------------------
    // Static Factory Method: fromTopic()
    // -----------------------------------------------------------------------

    /**
     * Converts a Topic entity into a TopicResponse DTO.
     *
     * This is called a "static factory method" — a static method that
     * creates and returns an instance of the class.
     *
     * Why static factory instead of a constructor?
     *   Clarity. When you write:
     *     TopicResponse.fromTopic(topic)
     *   It reads like English: "a TopicResponse built FROM a Topic".
     *
     *   Compare to a constructor:
     *     new TopicResponse(topic.getId(), topic.getName(), ...)
     *   Less readable, especially as the number of fields grows.
     *
     * Where is this called?
     *   In TopicController — every endpoint that returns a topic
     *   calls TopicResponse.fromTopic(topic) before sending the response.
     *
     * @param topic  The Topic entity returned by TopicService
     * @return       A clean TopicResponse safe to send to the client
     */
    public static TopicResponse fromTopic(Topic topic) {
        return new TopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getDescription(),
                topic.getCreatedAt()
        );
        // Notice: topic.getUser() is deliberately NOT included here.
        // This is the key protection — entity fields not in the DTO
        // are completely invisible to the outside world.
    }

    // -----------------------------------------------------------------------
    // Getters and Setters
    // -----------------------------------------------------------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
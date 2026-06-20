package com.studyassistant.controller;

import com.studyassistant.dto.request.TopicRequest;
import com.studyassistant.dto.response.TopicResponse;
import com.studyassistant.model.Topic;
import com.studyassistant.service.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TopicController — Exposes Topic operations as REST API endpoints.
 *
 * This class is the HTTP entry point for all topic-related actions.
 * Its responsibilities are intentionally narrow:
 *   1. Declare URL mappings and HTTP methods
 *   2. Read request data (body, path variables, query params)
 *   3. Delegate ALL logic to TopicService
 *   4. Wrap the result in the correct HTTP response (status + body)
 *
 * What this class does NOT do:
 *   ❌ No business logic (that's TopicService's job)
 *   ❌ No database calls (that's TopicRepository's job)
 *   ❌ No JWT parsing (that's JwtFilter's job)
 *
 * All endpoints below require a valid JWT token.
 * Spring Security + JwtFilter enforce this automatically —
 * no extra code needed here. Any request without a valid token
 * is rejected by JwtFilter before it ever reaches this controller.
 */
@RestController
// @RestController = @Controller + @ResponseBody combined.
//
// @Controller      → marks this class as a Spring MVC controller (handles requests)
// @ResponseBody    → every method return value is written directly to the HTTP
//                    response body as JSON (via Jackson serialization)
//
// Without @RestController, Spring would try to find a view template (HTML page)
// to render instead of returning JSON — which is not what we want for a REST API.

@RequestMapping("/api/topics")
// @RequestMapping sets the BASE URL prefix for every method in this class.
// All endpoints here start with /api/topics.
// Individual method annotations then add the rest of the path:
//   @GetMapping("/{id}") → full URL is /api/topics/{id}
//   @DeleteMapping("/{id}") → full URL is /api/topics/{id}
public class TopicController {

    @Autowired
    // Spring injects TopicService here automatically.
    // This controller only talks to the Service — never directly to Repository.
    private TopicService topicService;

    // =========================================================================
    // POST /api/topics
    // Create a new topic
    // =========================================================================

    /**
     * Creates a new topic for the logged-in user.
     *
     * Request:
     *   POST /api/topics
     *   Authorization: Bearer <token>
     *   Content-Type: application/json
     *   Body: { "name": "Java Programming", "description": "Core Java" }
     *
     * Response (success):
     *   201 Created
     *   { "id": 1, "name": "Java Programming", "description": "Core Java",
     *     "createdAt": ... }
     *
     * Response (duplicate name):
     *   500 Internal Server Error (we'll refine error handling later)
     *   { "message": "You already have a topic named..." }
     */
    @PostMapping
    // @PostMapping maps HTTP POST requests to /api/topics to this method.
    // POST is the correct HTTP verb for CREATE operations (REST convention).
    public ResponseEntity<TopicResponse> createTopic(
            @RequestBody TopicRequest request
            // @RequestBody tells Spring: "Read the JSON from the request body
            // and deserialize it into a TopicRequest object."
            // Spring uses Jackson for this conversion automatically.
            // If the body is missing or malformed JSON, Spring returns 400 Bad Request.
    ) {
        // Delegate to the Service — all logic lives there.
        Topic createdTopic = topicService.createTopic(
                request.getName(),
                request.getDescription()
        );

        // Convert the Topic entity to a TopicResponse DTO.
        // We NEVER return the raw Topic entity — it contains the User object
        // which would expose sensitive data.
        TopicResponse response = TopicResponse.fromTopic(createdTopic);

        // ResponseEntity lets us control both the HTTP status code and the body.
        // 201 Created is the correct status for a successful resource creation.
        // (200 OK would also work but 201 is more semantically precise for POST)
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================================================================
    // GET /api/topics
    // Get all topics for the logged-in user
    // =========================================================================

    /**
     * Returns all topics belonging to the logged-in user.
     *
     * Request:
     *   GET /api/topics
     *   Authorization: Bearer <token>
     *
     * Response (success):
     *   200 OK
     *   [
     *     { "id": 2, "name": "Spring Boot", "description": "...", "createdAt": ... },
     *     { "id": 1, "name": "Java",        "description": "...", "createdAt": ... }
     *   ]
     *   (sorted newest → oldest)
     *
     * Response (no topics yet):
     *   200 OK
     *   []    ← empty array, not 404. "I found your topics, and there are none."
     */
    @GetMapping
    // @GetMapping with no path maps HTTP GET /api/topics to this method.
    public ResponseEntity<List<TopicResponse>> getAllTopics() {

        List<Topic> topics = topicService.getAllTopics();

        // Convert List<Topic> → List<TopicResponse> using Java Streams.
        //
        // What this does step by step:
        //   topics.stream()          → treat the list as a stream of items
        //   .map(TopicResponse::fromTopic)  → convert each Topic to TopicResponse
        //                                     (:: is a method reference — shorthand
        //                                      for topic -> TopicResponse.fromTopic(topic))
        //   .collect(Collectors.toList())   → gather the results into a new List
        //
        // This is cleaner than a for-loop and is the standard Java 8+ pattern.
        List<TopicResponse> response = topics.stream()
                .map(TopicResponse::fromTopic)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
        // ResponseEntity.ok() is a shorthand for:
        //   ResponseEntity.status(HttpStatus.OK).body(response)
    }

    // =========================================================================
    // GET /api/topics/{id}
    // Get one specific topic by ID
    // =========================================================================

    /**
     * Returns a single topic by its ID.
     * Only returns the topic if it belongs to the logged-in user.
     *
     * Request:
     *   GET /api/topics/1
     *   Authorization: Bearer <token>
     *
     * Response (found):
     *   200 OK
     *   { "id": 1, "name": "Java", "description": "...", "createdAt": ... }
     *
     * Response (not found or belongs to another user):
     *   500 (RuntimeException — we'll upgrade to 404 with GlobalExceptionHandler later)
     */
    @GetMapping("/{id}")
    // @GetMapping("/{id}") maps GET /api/topics/1, /api/topics/5, etc.
    // The {id} is a PATH VARIABLE — a dynamic segment of the URL.
    public ResponseEntity<TopicResponse> getTopicById(
            @PathVariable Long id
            // @PathVariable extracts the {id} from the URL and binds it
            // to this 'id' parameter.
            // Spring auto-converts the String "1" from the URL to Long 1.
            // If someone sends /api/topics/abc, Spring returns 400 Bad Request
            // because "abc" can't be converted to Long.
    ) {
        Topic topic = topicService.getTopicById(id);
        return ResponseEntity.ok(TopicResponse.fromTopic(topic));
    }

    // =========================================================================
    // PUT /api/topics/{id}
    // Update an existing topic
    // =========================================================================

    /**
     * Updates the name and/or description of a topic.
     * Only updates if the topic belongs to the logged-in user.
     *
     * Request:
     *   PUT /api/topics/1
     *   Authorization: Bearer <token>
     *   Content-Type: application/json
     *   Body: { "name": "Advanced Java", "description": "Updated description" }
     *
     * Response (success):
     *   200 OK
     *   { "id": 1, "name": "Advanced Java", "description": "Updated description",
     *     "createdAt": ... }
     *
     * Note: createdAt never changes — only name and description are updated.
     */
    @PutMapping("/{id}")
    // @PutMapping maps HTTP PUT requests.
    // PUT is the correct HTTP verb for full UPDATE operations (REST convention).
    public ResponseEntity<TopicResponse> updateTopic(
            @PathVariable Long id,
            @RequestBody TopicRequest request
    ) {
        Topic updatedTopic = topicService.updateTopic(
                id,
                request.getName(),
                request.getDescription()
        );
        return ResponseEntity.ok(TopicResponse.fromTopic(updatedTopic));
    }

    // =========================================================================
    // DELETE /api/topics/{id}
    // Delete a topic
    // =========================================================================

    /**
     * Permanently deletes a topic.
     * Only deletes if the topic belongs to the logged-in user.
     *
     * Request:
     *   DELETE /api/topics/1
     *   Authorization: Bearer <token>
     *
     * Response (success):
     *   200 OK
     *   { "message": "Topic deleted successfully." }
     *
     * Why return 200 with a message instead of 204 No Content?
     *   204 is more RESTfully correct for DELETE, but returning a message
     *   is more beginner-friendly and easier to verify in Postman.
     *   You can switch to 204 later if needed.
     */
    @DeleteMapping("/{id}")
    // @DeleteMapping maps HTTP DELETE requests.
    public ResponseEntity<Map<String, String>> deleteTopic(
            @PathVariable Long id
    ) {
        topicService.deleteTopic(id);

        // Return a simple JSON message to confirm deletion.
        // Map.of() creates an immutable map with one key-value pair.
        // Jackson serializes Map<String, String> to JSON automatically:
        //   { "message": "Topic deleted successfully." }
        return ResponseEntity.ok(Map.of("message", "Topic deleted successfully."));
    }

    // =========================================================================
    // GET /api/topics/search?keyword=java
    // Search topics by name keyword
    // =========================================================================

    /**
     * Searches the logged-in user's topics by a keyword in the name.
     *
     * Request:
     *   GET /api/topics/search?keyword=java
     *   Authorization: Bearer <token>
     *
     * Response (matches found):
     *   200 OK
     *   [
     *     { "id": 1, "name": "Java Programming", ... },
     *     { "id": 3, "name": "Advanced Java",    ... }
     *   ]
     *
     * Response (no matches):
     *   200 OK
     *   []
     *
     * ⚠️ IMPORTANT — URL ordering in Spring MVC:
     *   This method is mapped to /api/topics/search.
     *   The getTopicById method is mapped to /api/topics/{id}.
     *   Spring could confuse "search" as a value for {id}.
     *
     *   Spring resolves this by matching EXACT paths before pattern paths.
     *   /api/topics/search (exact) is matched BEFORE /api/topics/{id} (pattern).
     *   So this works correctly — but keep this ordering concept in mind.
     */
    @GetMapping("/search")
    public ResponseEntity<List<TopicResponse>> searchTopics(
            @RequestParam String keyword
            // @RequestParam reads a query parameter from the URL.
            // For URL: /api/topics/search?keyword=java
            // Spring binds the value "java" to this 'keyword' parameter.
            //
            // If the client calls /api/topics/search without ?keyword=...,
            // Spring returns 400 Bad Request automatically (parameter is required).
            // To make it optional: @RequestParam(required = false) String keyword
    ) {
        List<Topic> topics = topicService.searchTopics(keyword);

        List<TopicResponse> response = topics.stream()
                .map(TopicResponse::fromTopic)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // GET /api/topics/count
    // Get total topic count for the logged-in user
    // =========================================================================

    /**
     * Returns the total number of topics the logged-in user has created.
     *
     * Request:
     *   GET /api/topics/count
     *   Authorization: Bearer <token>
     *
     * Response:
     *   200 OK
     *   { "count": 5 }
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTopicCount() {
        long count = topicService.getTopicCount();

        // Map.of("count", count) serializes to: { "count": 5 }
        return ResponseEntity.ok(Map.of("count", count));
    }
}
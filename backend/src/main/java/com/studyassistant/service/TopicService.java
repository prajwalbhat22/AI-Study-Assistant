package com.studyassistant.service;

import com.studyassistant.model.Topic;
import com.studyassistant.model.User;
import com.studyassistant.repository.TopicRepository;
import com.studyassistant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * TopicService — The business logic layer for all Topic operations.
 *
 * This class sits between the Controller (HTTP layer) and the Repository
 * (database layer). It is responsible for:
 *   1. Identifying who the logged-in user is (from JWT via SecurityContext)
 *   2. Enforcing ownership — users can only access their own topics
 *   3. Validating input — e.g. no duplicate topic names
 *   4. Coordinating with the Repository to read/write data
 *
 * Controllers will call this Service.
 * This Service will call TopicRepository and UserRepository.
 * Neither the Controller nor the Repository contains any business rules.
 */
@Service
// @Service is a Spring stereotype annotation — just like @Component,
// it tells Spring: "Create a Bean from this class and manage it."
//
// Spring provides three stereotype annotations for three layers:
//   @Controller   → HTTP layer (handles requests/responses)
//   @Service      → Business logic layer  ← this annotation
//   @Repository   → Data access layer (database queries)
//
// All three ultimately do the same thing (register a Bean), but using
// the correct annotation for each layer makes your code self-documenting
// and lets Spring apply layer-specific behavior (like @Repository's
// exception translation).
public class TopicService {

    @Autowired
    // Spring injects TopicRepository automatically.
    // We don't write: topicRepository = new TopicRepository();
    // Spring creates and manages the instance for us.
    private TopicRepository topicRepository;

    @Autowired
    // We need UserRepository to look up the logged-in user by their email.
    // The JWT contains the email (set as the subject in JwtUtil).
    // SecurityContext gives us that email — UserRepository gives us the User object.
    private UserRepository userRepository;

    // -------------------------------------------------------------------------
    // PRIVATE HELPER: Get the currently logged-in User
    // -------------------------------------------------------------------------

    /**
     * Retrieves the currently authenticated User from the database.
     *
     * How this works end-to-end:
     *
     *   1. Client sends request with header: Authorization: Bearer <JWT>
     *   2. JwtFilter intercepts the request (runs before every controller)
     *   3. JwtFilter extracts the email from the JWT token
     *   4. JwtFilter calls SecurityContextHolder.getContext()
     *                          .setAuthentication(authToken)
     *      where authToken has the email as the "principal"
     *   5. HERE — we read that email back from SecurityContextHolder
     *   6. We use the email to load the full User from the database
     *
     * Why a private helper method?
     *   Every Service method (create, getAll, getById, update, delete)
     *   needs to know who the logged-in user is.
     *   Instead of repeating the same 3 lines in every method,
     *   we extract it into one private method called once per operation.
     *
     * @return The User entity of the currently logged-in user
     * @throws RuntimeException if the email from JWT is not found in the database
     *         (this should never happen in normal flow, but defensive coding is good)
     */
    private User getLoggedInUser() {

        // Step 1: Get the email from the security context.
        // SecurityContextHolder is Spring Security's thread-local storage.
        // It holds the Authentication object that JwtFilter set for this request.
        // getAuthentication().getName() returns the "principal" — which JwtFilter
        // set to the user's email when it validated the JWT token.
        String email = SecurityContextHolder
                .getContext()       // get the SecurityContext for this thread/request
                .getAuthentication()// get the Authentication object JwtFilter stored
                .getName();         // getName() returns the principal = the user's email

        // Step 2: Use the email to load the full User object from MySQL.
        // We use orElseThrow() because findByEmail returns Optional<User>.
        // If the email somehow isn't in the database, we throw immediately
        // with a clear error message rather than getting a NullPointerException
        // somewhere deeper in the code.
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new RuntimeException("Authenticated user not found in database: " + email)
                );
    }

    // -------------------------------------------------------------------------
    // CREATE TOPIC
    // -------------------------------------------------------------------------

    /**
     * Creates a new Topic for the currently logged-in user.
     *
     * Business rules enforced here:
     *   1. The topic name cannot be blank or empty.
     *   2. The user cannot have two topics with the same name.
     *      (Two different users CAN have topics with the same name — that's fine.)
     *   3. The createdAt timestamp is set automatically — the client never sends it.
     *   4. The topic is automatically owned by the logged-in user — the client
     *      never sends a userId (that would be a security hole).
     *
     * @param name        The desired name for the new topic
     * @param description Optional description (can be null or empty)
     * @return            The saved Topic object (with id and createdAt populated)
     */
    public Topic createTopic(String name, String description) {

        // VALIDATION 1: Name must not be blank.
        // .trim() removes leading/trailing whitespace so "   " is treated as empty.
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Topic name cannot be blank.");
        }

        // Get the logged-in user — every subsequent step needs this.
        User loggedInUser = getLoggedInUser();

        // VALIDATION 2: Prevent duplicate topic names per user.
        // This calls our TopicRepository method: existsByNameAndUser(name, user)
        // which generates: SELECT COUNT(*) > 0 FROM topics WHERE name = ? AND user_id = ?
        if (topicRepository.existsByNameAndUser(name.trim(), loggedInUser)) {
            throw new RuntimeException(
                "You already have a topic named '" + name.trim() + "'. " +
                "Please choose a different name."
            );
        }

        // Build the Topic entity to save.
        // We use the convenience constructor we defined in Topic.java.
        Topic newTopic = new Topic();
        newTopic.setName(name.trim());
        // .trim() removes accidental leading/trailing spaces from the name.

        // Description is optional — only set it if the caller provided one.
        if (description != null && !description.trim().isEmpty()) {
            newTopic.setDescription(description.trim());
        }

        // Set the owner — this is what populates the user_id foreign key column.
        // The client NEVER sends userId; we always take it from the JWT.
        // This ensures a user can never create a topic "owned" by someone else.
        newTopic.setUser(loggedInUser);

        // Set the creation timestamp to right now.
        // new Date() gives the current date + time.
        // We do this in the Service (not the Controller, not the entity constructor)
        // because setting timestamps is a business rule — it belongs here.
        newTopic.setCreatedAt(new Date());

        // Persist to MySQL and return the saved entity.
        // After save(), the returned Topic object has its auto-generated id populated.
        // Before save(): topic.getId() = null
        // After  save(): topic.getId() = 1 (or whatever MySQL assigned)
        return topicRepository.save(newTopic);
    }

    // -------------------------------------------------------------------------
    // GET ALL TOPICS
    // -------------------------------------------------------------------------

    /**
     * Returns all topics belonging to the currently logged-in user.
     *
     * Sorted newest → oldest (most recently created appears first).
     * Users only ever see their own topics — never another user's topics.
     *
     * @return List of Topic objects owned by the logged-in user,
     *         sorted by createdAt descending (newest first)
     */
    public List<Topic> getAllTopics() {

        User loggedInUser = getLoggedInUser();

        // Calls: SELECT * FROM topics WHERE user_id = ? ORDER BY created_at DESC
        // Spring Data JPA generates this SQL from the method name in TopicRepository.
        return topicRepository.findByUserOrderByCreatedAtDesc(loggedInUser);
    }

    // -------------------------------------------------------------------------
    // GET TOPIC BY ID
    // -------------------------------------------------------------------------

    /**
     * Returns a single Topic by its ID, only if it belongs to the logged-in user.
     *
     * Security rule enforced:
     *   We look up by BOTH id AND user together (findByIdAndUser).
     *   This means even if someone guesses another user's topic ID in the URL,
     *   this method returns "not found" — because it won't match their user_id.
     *
     *   Example attack prevented:
     *     User A has topic with id=5.
     *     User B sends GET /api/topics/5
     *     findByIdAndUser(5, UserB) → returns empty → throws "Topic not found"
     *     User B never sees User A's topic. ✅
     *
     * @param topicId The ID of the topic (from the URL, e.g. /api/topics/5)
     * @return        The Topic if it exists AND belongs to the logged-in user
     * @throws        RuntimeException if not found or owned by a different user
     */
    public Topic getTopicById(Long topicId) {

        User loggedInUser = getLoggedInUser();

        // findByIdAndUser generates:
        //   SELECT * FROM topics WHERE id = ? AND user_id = ?
        // Returns Optional<Topic> — empty if not found OR owned by someone else.
        return topicRepository.findByIdAndUser(topicId, loggedInUser)
                .orElseThrow(() ->
                    new RuntimeException("Topic not found with id: " + topicId)
                );
        // Note: We intentionally give a generic "not found" message.
        // We do NOT say "this topic belongs to another user" —
        // that would leak information about data that exists in the system.
    }

    // -------------------------------------------------------------------------
    // UPDATE TOPIC
    // -------------------------------------------------------------------------

    /**
     * Updates the name and/or description of an existing topic.
     *
     * Business rules enforced:
     *   1. Topic must exist AND belong to the logged-in user.
     *   2. New name cannot be blank.
     *   3. If the name is being changed, the new name must not already
     *      exist in this user's other topics (duplicate check).
     *   4. createdAt is NEVER updated — it is read-only after creation.
     *
     * @param topicId        The ID of the topic to update
     * @param newName        The new name to apply
     * @param newDescription The new description to apply (can be null to clear it)
     * @return               The updated and saved Topic
     */
    public Topic updateTopic(Long topicId, String newName, String newDescription) {

        // VALIDATION 1: New name must not be blank.
        if (newName == null || newName.trim().isEmpty()) {
            throw new RuntimeException("Topic name cannot be blank.");
        }

        // This also validates ownership — throws if not found or not owned by user.
        Topic existingTopic = getTopicById(topicId);

        // VALIDATION 2: Duplicate name check — but only if the name is actually changing.
        // If the user submits the same name (e.g., only updating description),
        // we skip the duplicate check to avoid a false "name already exists" error.
        boolean nameIsChanging = !existingTopic.getName()
                                               .equalsIgnoreCase(newName.trim());

        if (nameIsChanging) {
            User loggedInUser = getLoggedInUser();

            // Check if the NEW name already exists in this user's other topics.
            if (topicRepository.existsByNameAndUser(newName.trim(), loggedInUser)) {
                throw new RuntimeException(
                    "You already have a topic named '" + newName.trim() + "'."
                );
            }
        }

        // Apply the updates.
        existingTopic.setName(newName.trim());

        // For description: if null is passed, we clear it (set to null in DB).
        // If a value is passed, we update it. This gives the caller full control.
        if (newDescription != null && !newDescription.trim().isEmpty()) {
            existingTopic.setDescription(newDescription.trim());
        } else {
            existingTopic.setDescription(null);
            // Setting to null stores NULL in the description column.
            // This is fine because description is nullable in our schema.
        }

        // We intentionally do NOT update createdAt.
        // The @Column(updatable = false) in Topic.java provides a second
        // layer of protection, but not modifying it here is the first line
        // of defense. Good security is layered (defense in depth).

        // Save the updated entity.
        // Because existingTopic already has an id, JPA runs UPDATE not INSERT.
        // JPA decides INSERT vs UPDATE based on whether the entity has an id:
        //   id == null  → INSERT (new record)
        //   id != null  → UPDATE (existing record)
        return topicRepository.save(existingTopic);
    }

    // -------------------------------------------------------------------------
    // DELETE TOPIC
    // -------------------------------------------------------------------------

    /**
     * Deletes a topic permanently, only if it belongs to the logged-in user.
     *
     * Security rule enforced:
     *   getTopicById() already verifies ownership before we delete anything.
     *   A user can never delete another user's topic — even if they know the ID.
     *
     * Future consideration (when Notes are added in Step X):
     *   You may want to delete all Notes under this topic first,
     *   or configure CASCADE DELETE on the database foreign key so MySQL
     *   handles it automatically. We'll address this in the Notes module.
     *
     * @param topicId The ID of the topic to delete
     */
    public void deleteTopic(Long topicId) {

        // getTopicById validates that the topic exists AND belongs to this user.
        // If either check fails, it throws RuntimeException and we never reach
        // the delete line below. Clean, no extra code needed.
        Topic topicToDelete = getTopicById(topicId);

        // Permanently delete the row from the topics table.
        // Generates: DELETE FROM topics WHERE id = ?
        topicRepository.delete(topicToDelete);

        // Note: We call delete(entity) rather than deleteById(id)
        // because we already have the entity object loaded above.
        // Both produce the same SQL, but delete(entity) is slightly more
        // explicit about what we're removing.
    }

    // -------------------------------------------------------------------------
    // SEARCH TOPICS
    // -------------------------------------------------------------------------

    /**
     * Searches the logged-in user's topics by a keyword in the topic name.
     *
     * Case-insensitive: searching "java" matches "Java Programming",
     * "Advanced JAVA", and "java basics" equally.
     *
     * @param keyword The search term entered by the user
     * @return        List of matching topics (empty list if nothing matches)
     */
    public List<Topic> searchTopics(String keyword) {

        // Return empty list immediately if keyword is blank.
        // No point hitting the database with an empty search.
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of(); // Returns an immutable empty list.
        }

        User loggedInUser = getLoggedInUser();

        // Calls our @Query in TopicRepository:
        // SELECT t FROM Topic t WHERE t.user = :user
        // AND LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        return topicRepository.searchByNameContaining(loggedInUser, keyword.trim());
    }

    // -------------------------------------------------------------------------
    // GET TOPIC COUNT
    // -------------------------------------------------------------------------

    /**
     * Returns the total number of topics the logged-in user has created.
     * Useful for displaying stats on the dashboard ("You have 8 topics").
     *
     * @return Count of topics owned by the logged-in user
     */
    public long getTopicCount() {
        User loggedInUser = getLoggedInUser();
        // Generates: SELECT COUNT(*) FROM topics WHERE user_id = ?
        return topicRepository.countByUser(loggedInUser);
    }
}
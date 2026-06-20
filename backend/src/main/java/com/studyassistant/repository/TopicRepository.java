package com.studyassistant.repository;

import com.studyassistant.model.Topic;
import com.studyassistant.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TopicRepository — The data access layer for Topic entities.
 *
 * This interface is the ONLY thing you need to interact with the
 * "topics" table in MySQL. No SQL, no JDBC, no boilerplate.
 *
 * How it works:
 *   1. You define method signatures (what you want).
 *   2. Spring Data JPA reads those method names at startup.
 *   3. Spring generates the SQL and the implementation automatically.
 *   4. Spring registers this as a Spring Bean (injectable anywhere).
 *
 * The two generic parameters in JpaRepository<Topic, Long>:
 *   Topic → the entity this repository manages
 *   Long  → the data type of Topic's @Id field (id is a Long)
 */
@Repository
// @Repository is a Spring stereotype annotation.
// It marks this interface as a "data access component."
//
// Two things it does:
//   1. Tells Spring to create a Bean from this interface so you can
//      @Autowired it into your Service class.
//   2. Enables Spring's exception translation — raw database exceptions
//      (like SQLException) are automatically converted into Spring's
//      cleaner DataAccessException hierarchy.
//
// Technically, Spring Data JPA would detect this interface even WITHOUT
// @Repository (because it extends JpaRepository). But adding it is
// a best practice — it makes the intent of this class crystal clear.
public interface TopicRepository extends JpaRepository<Topic, Long> {

    // -----------------------------------------------------------------------
    // DERIVED QUERY METHODS
    // -----------------------------------------------------------------------
    // Spring Data JPA has a powerful feature called "query derivation."
    // It reads your method name, parses it like a sentence, and generates
    // the correct SQL automatically.
    //
    // Naming rules:
    //   findBy   → SELECT ... WHERE
    //   And      → AND
    //   Or       → OR
    //   OrderBy  → ORDER BY
    //
    // Example: findByUserAndName(User user, String name)
    //   → SELECT * FROM topics WHERE user_id = ? AND name = ?
    // -----------------------------------------------------------------------

    /**
     * Fetch all topics that belong to a specific user.
     *
     * Method name breakdown:
     *   find     → SELECT
     *   By       → WHERE
     *   User     → the 'user' field in Topic.java (@ManyToOne User user)
     *
     * Generated SQL:
     *   SELECT * FROM topics WHERE user_id = ?
     *
     * When to use:
     *   When a logged-in user opens their dashboard and wants to see
     *   all their study topics. This will be the most-used query in
     *   the Topic module.
     *
     * @param user  The User object (JPA extracts the user's id automatically)
     * @return      All Topic rows where user_id matches
     */
    List<Topic> findByUser(User user);

    /**
     * Fetch all topics for a user, sorted alphabetically by name.
     *
     * Method name breakdown:
     *   findByUser      → SELECT * FROM topics WHERE user_id = ?
     *   OrderByNameAsc  → ORDER BY name ASC
     *
     * Generated SQL:
     *   SELECT * FROM topics WHERE user_id = ? ORDER BY name ASC
     *
     * When to use:
     *   When the frontend wants to display a user's topics in A-Z order.
     *   Cleaner than fetching all topics and sorting in Java.
     *
     * @param user  The User object
     * @return      Topics sorted A → Z by name
     */
    List<Topic> findByUserOrderByNameAsc(User user);

    /**
     * Fetch all topics for a user, newest first.
     *
     * Method name breakdown:
     *   findByUser              → WHERE user_id = ?
     *   OrderByCreatedAtDesc    → ORDER BY created_at DESC (newest first)
     *
     * Generated SQL:
     *   SELECT * FROM topics WHERE user_id = ? ORDER BY created_at DESC
     *
     * When to use:
     *   Default dashboard view — show the user their most recently
     *   created topics at the top.
     *
     * @param user  The User object
     * @return      Topics sorted newest → oldest
     */
    List<Topic> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find a specific topic by its ID, but only if it belongs to the given user.
     *
     * Method name breakdown:
     *   findBy   → SELECT ... WHERE
     *   Id       → id = ?
     *   And      → AND
     *   User     → user_id = ?
     *
     * Generated SQL:
     *   SELECT * FROM topics WHERE id = ? AND user_id = ?
     *
     * Why this matters (SECURITY):
     *   Without the "AndUser" part, any authenticated user could fetch
     *   ANY topic by ID — even topics belonging to other users.
     *
     *   This query ensures a user can ONLY access their OWN topics.
     *   Even if someone passes another user's topic ID in the URL,
     *   this query returns empty because user_id won't match.
     *
     *   This pattern is called "ownership validation" — always verify
     *   both the resource ID AND the owner in the same query.
     *
     * Returns Optional<Topic> instead of Topic because:
     *   → The topic might not exist (wrong ID)
     *   → The topic might exist but belong to a different user
     *   In both cases, Optional lets us handle "not found" cleanly
     *   without NullPointerException.
     *
     * @param id    The topic ID from the URL (e.g., /api/topics/5)
     * @param user  The currently logged-in user
     * @return      Optional containing Topic if found AND owned by user,
     *              or Optional.empty() if not found or unauthorized
     */
    Optional<Topic> findByIdAndUser(Long id, User user);

    /**
     * Check if a topic with a given name already exists for this user.
     *
     * Method name breakdown:
     *   existsBy       → SELECT COUNT(*) ... (returns boolean)
     *   Name           → name = ?
     *   And            → AND
     *   User           → user_id = ?
     *
     * Generated SQL:
     *   SELECT COUNT(*) > 0 FROM topics WHERE name = ? AND user_id = ?
     *
     * Why this matters:
     *   Prevents a user from creating duplicate topic names.
     *   Example: if a user already has "Java Programming", we can
     *   check this before saving and return a helpful error message
     *   instead of a cryptic database error.
     *
     *   Note: Two DIFFERENT users CAN have the same topic name.
     *   The uniqueness is per-user, not global — which is why
     *   we check BOTH name AND user together.
     *
     * @param name  The topic name to check
     * @param user  The user to check within
     * @return      true if the topic name already exists for this user,
     *              false if the name is available
     */
    boolean existsByNameAndUser(String name, User user);

    /**
     * Count how many topics a user has created.
     *
     * Generated SQL:
     *   SELECT COUNT(*) FROM topics WHERE user_id = ?
     *
     * When to use:
     *   Dashboard statistics ("You have 12 study topics").
     *   Could also be used to enforce a topic limit in future
     *   (e.g., free plan = max 10 topics).
     *
     * @param user  The User object
     * @return      The number of topics owned by this user
     */
    long countByUser(User user);

    /**
     * Search a user's topics by a keyword in the name.
     *
     * This uses @Query — a custom JPQL query written manually.
     * We use this instead of a derived method name because the
     * LIKE + LOWER logic is complex to express through naming alone.
     *
     * JPQL vs SQL:
     *   SQL   writes table/column names  → SELECT * FROM topics WHERE ...
     *   JPQL  writes entity/field names  → SELECT t FROM Topic t WHERE ...
     *   JPQL is database-agnostic: works on MySQL, PostgreSQL, H2, etc.
     *
     * Query breakdown:
     *   SELECT t FROM Topic t    → fetch Topic entities (not raw rows)
     *   WHERE t.user = :user     → only this user's topics
     *   AND LOWER(t.name)        → convert the stored name to lowercase
     *   LIKE LOWER(:keyword)     → compare against lowercase search input
     *   %:keyword%               → % is a wildcard: matches anything before/after
     *
     * Example:
     *   User searches "java"
     *   keyword becomes "%java%"
     *   Matches: "Java Programming", "Advanced Java", "java basics"
     *   (case-insensitive because of LOWER on both sides)
     *
     * @param user     The logged-in user
     * @param keyword  The search term (wrapped in % wildcards in the query)
     * @return         Topics whose names contain the keyword (case-insensitive)
     */
    @Query("SELECT t FROM Topic t WHERE t.user = :user " +
           "AND LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Topic> searchByNameContaining(
            @Param("user") User user,
            @Param("keyword") String keyword
    );
    // @Param("user")    → binds the 'user' method parameter to :user in the query
    // @Param("keyword") → binds the 'keyword' method parameter to :keyword in the query
    // Without @Param, Spring wouldn't know which variable maps to which placeholder.

    List<Topic> findByUserId(Long userId);

    long countByUserEmail(String email);
    
}
// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/repository/UserRepository.java
//
// WHAT IS THIS FILE?
//   This is the Repository layer for the User entity.
//   It is a Java INTERFACE — not a class. You never write
//   any method body here. Spring Data JPA reads this interface
//   at startup and builds a real working implementation for you.
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.repository;

// ─────────────────────────────────────────────────────────────────────────────
// WHY THESE IMPORTS?
//
// JpaRepository
//   The Spring Data interface that gives us 20+ free database
//   methods just by extending it. Lives in spring-data-jpa,
//   which is already in your pom.xml.
//
// Optional<T>
//   A Java wrapper that either holds a value or is empty.
//   Using Optional<User> instead of plain User forces you
//   to think: "What if no user is found?" and handle it.
//   This prevents NullPointerExceptions in your Service layer.
//
// User
//   Our entity class from the model package. We import it
//   so this repository knows which table it manages.
// ─────────────────────────────────────────────────────────────────────────────

import com.studyassistant.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


// ─────────────────────────────────────────────────────────────────────────────
// @Repository
//   Marks this interface as a Spring-managed bean — Spring will
//   create an instance of the auto-generated implementation and
//   put it in the Application Context (Spring's object store).
//   This means you can inject UserRepository anywhere using
//   @Autowired or constructor injection.
//
//   Technically, @Repository is optional here because extending
//   JpaRepository already registers it. But adding it explicitly:
//     1. Makes your intent clear to anyone reading the code
//     2. Enables Spring to translate database exceptions into
//        Spring's own DataAccessException hierarchy
//     3. Is considered best practice in production codebases
// ─────────────────────────────────────────────────────────────────────────────

@Repository

// ─────────────────────────────────────────────────────────────────────────────
// public interface UserRepository extends JpaRepository<User, Long>
//
// KEY POINTS:
//
// 1. It's an INTERFACE, not a class.
//    You declare method signatures only. Spring writes the
//    implementation at runtime. You never write { ... } bodies here.
//
// 2. extends JpaRepository<User, Long>
//    - User → the Entity this repository manages
//    - Long → the data type of the @Id field in User.java
//    This link tells Spring: "Use the `users` table, and find
//    rows by their BIGINT primary key."
//
// 3. What you get for FREE by extending JpaRepository:
//    ─────────────────────────────────────────────────
//    save(user)              → INSERT or UPDATE
//    findById(id)            → SELECT WHERE id = ?  (returns Optional)
//    findAll()               → SELECT * FROM users
//    findAll(pageable)       → SELECT with LIMIT and OFFSET (pagination)
//    findAll(sort)           → SELECT with ORDER BY
//    count()                 → SELECT COUNT(*)
//    deleteById(id)          → DELETE WHERE id = ?
//    delete(user)            → DELETE WHERE id = user.getId()
//    deleteAll()             → DELETE FROM users
//    existsById(id)          → SELECT EXISTS(... WHERE id = ?)
//    saveAll(list)           → batch INSERT or UPDATE
//    flush()                 → force pending changes to DB
//    saveAndFlush(user)      → save + flush in one call
//    getReferenceById(id)    → lazy-loaded proxy (advanced use)
//    ─────────────────────────────────────────────────
//    That's ~20 methods you got for writing ONE line.
// ─────────────────────────────────────────────────────────────────────────────

public interface UserRepository extends JpaRepository<User, Long> {


    // ─────────────────────────────────────────────────────────────────────────
    // CUSTOM METHOD 1: findByEmail
    //
    // Optional<User> findByEmail(String email);
    //
    // WHY Optional<User> and not just User?
    //   If the email doesn't exist in the database, returning
    //   plain User would force Spring to return null — and null
    //   causes NullPointerException crashes if your Service
    //   tries to call methods on it.
    //   Optional<User> is a container that either:
    //     - holds the User  →  optional.isPresent() = true
    //     - is empty        →  optional.isEmpty()   = true
    //   It forces the calling code to handle the "not found" case.
    //
    // HOW DOES SPRING KNOW WHAT SQL TO GENERATE?
    //   Spring Data JPA reads the method name like a sentence
    //   and builds the query automatically:
    //
    //   findBy     → SELECT * FROM users WHERE
    //   Email      → email = ?
    //   (String email) → the ? is replaced by the parameter value
    //
    //   Full SQL generated:
    //   SELECT * FROM users WHERE email = 'ravi@example.com'
    //
    // WHEN WILL WE USE THIS?
    //   In AuthService, during login:
    //     Optional<User> user = userRepository.findByEmail(loginEmail);
    //     if (user.isEmpty()) { throw new UserNotFoundException(); }
    //     // then verify password against user.get().getPassword()
    //
    //   In AuthService, during registration:
    //     to check if email is already taken before saving.
    // ─────────────────────────────────────────────────────────────────────────

    Optional<User> findByEmail(String email);


    // ─────────────────────────────────────────────────────────────────────────
    // CUSTOM METHOD 2: existsByEmail
    //
    // boolean existsByEmail(String email);
    //
    // WHY boolean and not Optional<User>?
    //   Sometimes you don't need the User object — you just need
    //   to know "does this email already exist in the database?"
    //   That's a yes/no question, so boolean is the right return type.
    //   Returning a full User object when you only need true/false
    //   wastes memory and is less readable.
    //
    // SQL GENERATED:
    //   existsBy  → SELECT EXISTS(...)
    //   Email     → WHERE email = ?
    //
    //   Full SQL:
    //   SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)
    //   Returns: 1 (true) or 0 (false)
    //
    //   This is more efficient than findByEmail() for this case
    //   because the DB doesn't need to load the whole row — it
    //   just checks for existence and stops.
    //
    // WHEN WILL WE USE THIS?
    //   In AuthService, during registration:
    //     if (userRepository.existsByEmail(request.getEmail())) {
    //         throw new EmailAlreadyExistsException("Email taken");
    //     }
    //   We check BEFORE trying to save, to give the user a
    //   clean error message instead of a database constraint error.
    // ─────────────────────────────────────────────────────────────────────────

    boolean existsByEmail(String email);

}

// ─────────────────────────────────────────────────────────────────────────────
// HOW SPRING DATA JPA NAMES CUSTOM METHODS — THE RULES
//
// Spring reads your method name word by word. You can build
// powerful queries just by choosing the right names:
//
// PREFIX     MEANING
// findBy     → SELECT ... WHERE
// existsBy   → SELECT EXISTS(...) WHERE
// countBy    → SELECT COUNT(*) WHERE
// deleteBy   → DELETE WHERE
//
// CONDITION WORDS (go after "By")
// Email              → email = ?
// EmailAndFullName   → email = ? AND full_name = ?
// EmailOrFullName    → email = ? OR full_name = ?
// FullNameContaining → full_name LIKE '%?%'
// FullNameStartingWith → full_name LIKE '?%'
// CreatedAtBefore    → created_at < ?
// CreatedAtAfter     → created_at > ?
// OrderByCreatedAtDesc → ORDER BY created_at DESC
//
// EXAMPLES OF VALID METHOD NAMES YOU COULD ADD LATER:
// Optional<User> findByEmailAndPassword(String email, String password);
// List<User>     findAllByOrderByCreatedAtDesc();
// long           countByCreatedAtAfter(LocalDateTime date);
// void           deleteByEmail(String email);
//
// You write ZERO SQL. Spring generates it all from the name.
// ─────────────────────────────────────────────────────────────────────────────
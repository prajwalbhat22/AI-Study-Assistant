
// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:  src/main/java/com/studyassistant/model/User.java
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.model;

// ─── IMPORTS ─────────────────────────────────────────────────────────────────
// jakarta.persistence.*  → JPA annotations that map this class to a DB table
// lombok.*               → Auto-generates boilerplate (getters, setters, etc.)
// java.time.LocalDateTime → Modern Java date/time (preferred over java.util.Date)
// org.hibernate.annotations.CreationTimestamp → Auto-sets timestamp on INSERT
// ─────────────────────────────────────────────────────────────────────────────

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// ─────────────────────────────────────────────────────────────────────────────
// @Entity
//   Tells JPA (Java Persistence API): "This class is not just a regular Java
//   class — it represents a TABLE in the database."
//   Hibernate reads this annotation at startup and either:
//     - Creates the 'users' table if it doesn't exist (ddl-auto=update)
//     - Validates that the table matches this class
//   WITHOUT this annotation, Spring treats it as a plain Java class and
//   ignores it completely when setting up the database.
// ─────────────────────────────────────────────────────────────────────────────
@Entity

// ─────────────────────────────────────────────────────────────────────────────
// @Table(name = "users")
//   By default, JPA would name your table "user" (the class name, lowercase).
//   But "user" is a RESERVED WORD in MySQL — using it causes SQL errors.
//   This annotation explicitly sets the table name to "users" (plural).
//   Best practice: always use plural table names ("users", "topics", "quizzes").
//
//   uniqueConstraints → enforces UNIQUE constraint at the database level.
//   Here we say: no two rows can have the same email address.
//   This is different from @Column(unique=true) — uniqueConstraints lets
//   you give the constraint a readable name (shown in error messages).
// ─────────────────────────────────────────────────────────────────────────────
@Table(
    name = "users",
    uniqueConstraints = {
        @jakarta.persistence.UniqueConstraint(
            name = "uk_users_email",   // readable name for the DB constraint
            columnNames = "email"
        )
    }
)

// ─────────────────────────────────────────────────────────────────────────────
// LOMBOK ANNOTATIONS — these eliminate boilerplate Java code.
//
// @Data
//   Automatically generates at compile time:
//     - getters for ALL fields       (getId(), getFullName(), etc.)
//     - setters for ALL non-final    (setFullName(), setEmail(), etc.)
//     - toString()                   (useful for logging)
//     - equals() and hashCode()      (for object comparison)
//   Without @Data you'd write 50+ lines of repetitive getter/setter code.
//
// @NoArgsConstructor
//   Generates: public User() {}
//   JPA REQUIRES a no-argument constructor to create entity instances
//   when loading data from the database. This is mandatory for entities.
//
// @AllArgsConstructor
//   Generates a constructor with ALL fields as parameters.
//   Useful when creating User objects with all values at once in tests.
//
// @Builder
//   Enables the Builder pattern. Instead of:
//       User u = new User();
//       u.setFullName("Ravi");
//       u.setEmail("ravi@test.com");
//   You can write:
//       User u = User.builder()
//                    .fullName("Ravi")
//                    .email("ravi@test.com")
//                    .build();
//   Much cleaner, especially when you have many fields.
// ─────────────────────────────────────────────────────────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // ─────────────────────────────────────────────────────────────────────────
    // FIELD: id
    //
    // @Id
    //   Marks this field as the PRIMARY KEY of the table.
    //   Every entity MUST have exactly one @Id field.
    //   The database uses this to uniquely identify each row.
    //
    // @GeneratedValue(strategy = GenerationType.IDENTITY)
    //   Tells the database to AUTO-INCREMENT this value.
    //   So you never set the id yourself — MySQL assigns it automatically.
    //   1, 2, 3, 4... as rows are inserted.
    //
    //   Why IDENTITY strategy?
    //   MySQL's AUTO_INCREMENT column is the most natural fit.
    //   Other strategies (SEQUENCE, TABLE) are for Oracle/PostgreSQL.
    //   IDENTITY is the correct choice for MySQL.
    //
    // Why Long and not int?
    //   int maxes out at ~2 billion. Long handles up to 9.2 quintillion.
    //   Use Long for all IDs — it's a universal best practice.
    // ─────────────────────────────────────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─────────────────────────────────────────────────────────────────────────
    // FIELD: fullName
    //
    // @NotBlank
    //   Validation constraint. Means: this field cannot be null, empty,
    //   or just whitespace. If a request comes in with an empty fullName,
    //   Spring will reject it and return a 400 Bad Request automatically.
    //   Pair this with @Valid on your controller method later.
    //
    // @Size(min=2, max=100)
    //   Restricts the string length. Rejects "A" (too short) or a 500-char name.
    //   message = what the user sees if validation fails.
    //
    // @Column(name = "full_name", ...)
    //   name="full_name"   → the actual column name in MySQL.
    //                        Java convention = camelCase (fullName)
    //                        DB convention   = snake_case (full_name)
    //   nullable=false     → adds NOT NULL constraint in the DB schema.
    //                        Two-layer protection: @NotBlank (Java) + NOT NULL (DB).
    //   length=100         → sets VARCHAR(100) in MySQL.
    //                        Always set this — default is VARCHAR(255) which
    //                        wastes space for short fields.
    // ─────────────────────────────────────────────────────────────────────────
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    // ─────────────────────────────────────────────────────────────────────────
    // FIELD: email
    //
    // @NotBlank     → cannot be null or empty (same as above)
    //
    // @Email
    //   Validates that the string looks like a real email address.
    //   It checks for the @ symbol and domain format.
    //   "ravi.test.com" would fail. "ravi@test.com" would pass.
    //
    // @Column(unique = true)
    //   Combined with the @Table uniqueConstraints above, this ensures
    //   no duplicate emails exist. This is enforced at the DB level,
    //   meaning even if two requests arrive simultaneously, MySQL
    //   will reject the second one.
    //
    //   length=150  → emails are typically ≤254 chars. 150 is a safe max.
    // ─────────────────────────────────────────────────────────────────────────
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // ─────────────────────────────────────────────────────────────────────────
    // FIELD: password
    //
    // @NotBlank  → cannot be null or empty
    //
    // @Size(min=8)
    //   Enforces a minimum password length of 8 characters.
    //   Note: This validates the RAW password from the request.
    //   After hashing (BCrypt), the stored string will be 60 chars —
    //   the @Size check runs BEFORE hashing, which is what you want.
    //
    // @Column(nullable=false)
    //   NOT NULL in the database.
    //
    // Why no length limit here?
    //   BCrypt always produces a 60-character hash regardless of input.
    //   Default VARCHAR(255) is fine. We don't set a column length
    //   because we'll store the HASH, not the raw password.
    //
    // ⚠️  IMPORTANT REMINDER:
    //   NEVER store plain-text passwords. When you build AuthService,
    //   always hash with BCryptPasswordEncoder before saving.
    //   The password field here stores the HASH, never the raw text.
    // ─────────────────────────────────────────────────────────────────────────
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Column(nullable = false)
    private String password;

    // ─────────────────────────────────────────────────────────────────────────
    // FIELD: createdAt
    //
    // @CreationTimestamp
    //   A Hibernate annotation (not standard JPA).
    //   Automatically sets this field to the current date+time the
    //   MOMENT a new User row is inserted into the database.
    //   You never set this manually — Hibernate handles it.
    //
    // @Column(name="created_at", updatable=false)
    //   name="created_at"  → snake_case column name in the DB.
    //   updatable=false    → after the row is created, this column
    //                        can NEVER be changed by JPA.
    //                        Even if you call userRepository.save(user)
    //                        again, this value will not be touched.
    //                        This is critical — a creation timestamp
    //                        should be immutable.
    //   nullable=false     → every row must have a creation time.
    //
    // Why LocalDateTime and not Date or Timestamp?
    //   LocalDateTime is the modern Java 8+ standard. It's timezone-
    //   neutral, immutable, and pairs perfectly with Hibernate.
    //   Avoid the old java.util.Date — it's mutable and error-prone.
    // ─────────────────────────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
// ─────────────────────────────────────────────────────────────────────────────
// WHAT MYSQL TABLE THIS CREATES:
//
//   CREATE TABLE users (
//       id          BIGINT          NOT NULL AUTO_INCREMENT,
//       full_name   VARCHAR(100)    NOT NULL,
//       email       VARCHAR(150)    NOT NULL UNIQUE,
//       password    VARCHAR(255)    NOT NULL,
//       created_at  DATETIME        NOT NULL,
//       PRIMARY KEY (id),
//       CONSTRAINT uk_users_email UNIQUE (email)
//   );
//
// You never wrote this SQL. Hibernate generated it from your class.
// ─────────────────────────────────────────────────────────────────────────────


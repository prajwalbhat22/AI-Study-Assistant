package com.studyassistant.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import java.util.ArrayList;
import java.util.List;

import java.util.Date;

/**
 * Topic — Represents a study subject or category created by a user.
 *
 * In the database, this class maps to a table called "topics".
 * Each row in that table = one Topic object in Java.
 *
 * Example topics a student might create:
 *   - "Java Programming"
 *   - "Data Structures & Algorithms"
 *   - "System Design"
 *
 * Relationship Summary:
 *   - One User   → Many Topics  (a user can have many study subjects)
 *   - One Topic  → Many Notes   (each subject will have many notes — built later)
 */

@Entity
// @Entity tells JPA (Java Persistence API): "This Java class is a database table."
// JPA will automatically create a table for this class when the app starts
// (if spring.jpa.hibernate.ddl-auto=update or create is set in application.properties).
// Without @Entity, JPA completely ignores this class.

@Table(name = "topics")
// @Table specifies the exact name of the database table this entity maps to.
// Without this, JPA would default to the class name ("Topic" → "topic").
// Being explicit with @Table is a best practice — it avoids naming confusion
// especially across different databases (MySQL, PostgreSQL, etc.).
public class Topic {

    // -----------------------------------------------------------------------
    // PRIMARY KEY
    // -----------------------------------------------------------------------

    @Id
    // @Id marks this field as the PRIMARY KEY of the table.
    // Every table must have a primary key — a unique identifier for each row.
    // JPA requires exactly one @Id field in every @Entity class.

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // @GeneratedValue tells JPA: "Don't make me set the ID manually —
    // generate it automatically."
    //
    // GenerationType.IDENTITY means:
    //   → The DATABASE is responsible for generating the ID.
    //   → MySQL uses AUTO_INCREMENT for this (1, 2, 3, 4, ...)
    //   → Every time a new Topic is inserted, MySQL assigns the next number.
    //
    // Other strategies exist (SEQUENCE, TABLE, AUTO) but IDENTITY
    // is the most common and natural choice for MySQL.
    private Long id;

    // -----------------------------------------------------------------------
    // TOPIC NAME
    // -----------------------------------------------------------------------

    @Column(name = "name", nullable = false, length = 100)
    // @Column customizes how this field maps to a database column.
    //
    // name = "name"
    //   → The column in the database will be called "name".
    //   → Without this, JPA uses the Java field name (which is also "name" here,
    //     but being explicit is always clearer).
    //
    // nullable = false
    //   → This column cannot be NULL in the database.
    //   → A topic MUST have a name — it would be meaningless without one.
    //   → JPA adds "NOT NULL" constraint to this column in the DB schema.
    //
    // length = 100
    //   → Maximum 100 characters allowed for the topic name.
    //   → Translates to VARCHAR(100) in MySQL.
    //   → Prevents someone from storing a 10,000-character topic name.
    private String name;

    // -----------------------------------------------------------------------
    // TOPIC DESCRIPTION (OPTIONAL)
    // -----------------------------------------------------------------------

    @Column(name = "description", length = 500)
    // nullable is NOT set here, which means it defaults to true → column CAN be NULL.
    // Description is optional — a user might just want a quick topic name
    // without adding extra detail.
    //
    // length = 500
    //   → Allows a reasonable paragraph for describing the topic.
    //   → Translates to VARCHAR(500) in MySQL.
    private String description;

    // -----------------------------------------------------------------------
    // CREATION TIMESTAMP
    // -----------------------------------------------------------------------

    @Column(name = "created_at", nullable = false, updatable = false)
    // nullable = false  → every topic must have a creation date.
    //
    // updatable = false
    //   → This is an important flag!
    //   → It tells JPA: "Once this value is written to the database on INSERT,
    //     NEVER update it again."
    //   → Even if you accidentally include created_at in an UPDATE query,
    //     JPA will silently ignore it.
    //   → This protects the integrity of your audit trail —
    //     a creation date should never change.

    @Temporal(TemporalType.TIMESTAMP)
    // @Temporal tells JPA how to store a Java Date in the database.
    //
    // Java's Date class holds both date AND time.
    // @Temporal lets you choose how much of that to store:
    //
    //   TemporalType.DATE      → stores only date       (2025-01-15)
    //   TemporalType.TIME      → stores only time       (14:30:00)
    //   TemporalType.TIMESTAMP → stores date AND time   (2025-01-15 14:30:00)
    //
    // We use TIMESTAMP because knowing the exact time a topic was
    // created is useful for sorting and displaying "created 2 hours ago".
    private Date createdAt;

    // -----------------------------------------------------------------------
    // RELATIONSHIP: Many Topics → One User (OWNER)
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    // @ManyToOne defines the relationship from Topic's perspective:
    //   "MANY Topics can belong to ONE User."
    //
    // fetch = FetchType.LAZY
    //   → This controls WHEN JPA loads the related User from the database.
    //
    //   LAZY  (recommended) → Load the User only when you actually access it.
    //     Example: if you fetch a Topic and never call topic.getUser(),
    //     JPA will NOT run a JOIN query for the User. Saves database calls.
    //
    //   EAGER (the default for @ManyToOne) → Load the User IMMEDIATELY
    //     every time you fetch a Topic, even if you never use it.
    //     This can cause performance issues (N+1 query problem) at scale.
    //
    // → Always prefer LAZY for @ManyToOne unless you have a specific reason.

    @JoinColumn(name = "user_id", nullable = false)
    // @JoinColumn defines the FOREIGN KEY column in the topics table.
    //
    // name = "user_id"
    //   → The column in the "topics" table that stores the foreign key.
    //   → This column will hold the ID of the user who owns this topic.
    //   → In MySQL: topics.user_id → references users.id
    //
    // nullable = false
    //   → Every topic MUST belong to a user.
    //   → You cannot have an "orphan" topic with no owner.
    //   → The database will reject any INSERT where user_id is NULL.
    private User user;
    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Note> notes = new ArrayList<>();
    // Note: The field type is User (your existing User entity), not Long.
    // JPA handles the translation:
    //   Java side  → topic.getUser() returns a User object
    //   DB side    → topics.user_id stores a Long (the user's ID)
    // You never manually manage the foreign key integer — JPA does it for you.

    // -----------------------------------------------------------------------
    // CONSTRUCTORS
    // -----------------------------------------------------------------------

    public Topic() {
        // Default no-argument constructor.
        // JPA REQUIRES this — it uses reflection to create entity instances
        // when loading data from the database. If you remove this,
        // JPA will throw an InstantiationException at runtime.
    }

    public Topic(String name, String description, User user) {
        // Convenience constructor for creating a new Topic in code.
        // We don't set 'id' here (database auto-generates it).
        // We don't set 'createdAt' here (we'll handle this in the Service layer
        // using new Date() before saving — keeps the entity clean).
        this.name = name;
        this.description = description;
        this.user = user;
    }

    // -----------------------------------------------------------------------
    // GETTERS AND SETTERS
    // -----------------------------------------------------------------------
    // JPA and Spring need these to read and write field values.
    // Without getters/setters, serialization to JSON (via Jackson)
    // and JPA field access will silently fail.

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Note> getNotes() {
    return notes;
    }

    public void setNotes(List<Note> notes) {
    this.notes = notes;
    }

    // -----------------------------------------------------------------------
    // toString() — For debugging
    // -----------------------------------------------------------------------
    // When you print a Topic object (e.g., System.out.println(topic)),
    // this method defines what gets printed.
    // Very helpful during development to inspect Topic objects in logs.
    //
    // IMPORTANT: We deliberately do NOT include user in toString().
    // Because user is LAZY loaded, calling user.toString() here could
    // trigger an unexpected database query or a LazyInitializationException
    // if called outside a transaction.
    @Override
    public String toString() {
        return "Topic{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
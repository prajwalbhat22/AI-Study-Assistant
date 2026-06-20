package com.studyassistant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // optional topic link
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(nullable = false)
    private LocalDateTime startTime;

    // null means session is still active
    private LocalDateTime endTime;

    // computed on endSession() call
    private Integer durationMinutes;

    // user's own note about what they studied
    @Column(length = 500)
    private String notes;

    // 1–5 stars, user rates their own productivity
    private Integer productivityRating;

    // ACTIVE or ENDED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudySessionStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = StudySessionStatus.ACTIVE;
    }

    public enum StudySessionStatus {
        ACTIVE, ENDED
    }
}
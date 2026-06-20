package com.studyassistant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pomodoro_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PomodoroSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // which user owns this session
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // optional — link to a topic being studied
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    // FOCUS or BREAK
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionType sessionType;

    // planned duration in minutes (usually 25 for focus, 5 for short break)
    @Column(nullable = false)
    private Integer plannedDurationMinutes;

    // actual minutes completed (user may stop early)
    private Integer actualDurationMinutes;

    // COMPLETED, SKIPPED, INTERRUPTED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum SessionType {
        FOCUS, SHORT_BREAK, LONG_BREAK
    }

    public enum SessionStatus {
        COMPLETED, SKIPPED, INTERRUPTED
    }
}
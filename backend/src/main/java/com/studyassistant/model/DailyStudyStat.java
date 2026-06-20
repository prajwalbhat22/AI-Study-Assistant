package com.studyassistant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "daily_study_stats",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "stat_date"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyStudyStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // one row per user per day
    @Column(nullable = false)
    private LocalDate statDate;

    // total focus minutes that day
    @Column(nullable = false)
    private Integer totalFocusMinutes;

    // how many pomodoro focus blocks completed
    @Column(nullable = false)
    private Integer pomodorosCompleted;

    // how many study sessions started that day
    @Column(nullable = false)
    private Integer studySessionsCount;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
}
package com.studyassistant.repository;

import com.studyassistant.model.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {

    List<PomodoroSession> findByUserIdOrderByStartTimeDesc(Long userId);

    // all sessions for a user between two timestamps
    List<PomodoroSession> findByUserIdAndStartTimeBetweenOrderByStartTimeDesc(
        Long userId, LocalDateTime from, LocalDateTime to
    );

    // count completed focus blocks today
    @Query("""
        SELECT COUNT(p) FROM PomodoroSession p
        WHERE p.user.id = :userId
        AND p.sessionType = 'FOCUS'
        AND p.status = 'COMPLETED'
        AND p.startTime >= :from
        AND p.startTime < :to
    """)
    long countCompletedFocusSessionsBetween(
        @Param("userId") Long userId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    // sum of actual focus minutes in a date range
    @Query("""
        SELECT COALESCE(SUM(p.actualDurationMinutes), 0)
        FROM PomodoroSession p
        WHERE p.user.id = :userId
        AND p.sessionType = 'FOCUS'
        AND p.status = 'COMPLETED'
        AND p.startTime >= :from
        AND p.startTime < :to
    """)
    Integer sumFocusMinutesBetween(
        @Param("userId") Long userId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    // find the currently running pomodoro (no endTime yet)
    Optional<PomodoroSession> findByUserIdAndEndTimeIsNull(Long userId);
}
package com.studyassistant.repository;

import com.studyassistant.model.StudySession;
import com.studyassistant.model.StudySession.StudySessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByStartTimeDesc(Long userId);

    List<StudySession> findByUserIdAndStartTimeBetweenOrderByStartTimeDesc(
        Long userId, LocalDateTime from, LocalDateTime to
    );

    // find the currently active session (not ended yet)
    Optional<StudySession> findByUserIdAndStatus(Long userId, StudySessionStatus status);

    // sum of duration minutes in a range
    @Query("""
        SELECT COALESCE(SUM(s.durationMinutes), 0)
        FROM StudySession s
        WHERE s.user.id = :userId
        AND s.status = 'ENDED'
        AND s.startTime >= :from
        AND s.startTime < :to
    """)
    Integer sumDurationMinutesBetween(
        @Param("userId") Long userId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    // per-topic time breakdown
    @Query("""
    SELECT s.topic.id, s.topic.name, COALESCE(SUM(s.durationMinutes), 0)
    FROM StudySession s
    WHERE s.user.id = :userId
    AND s.status = 'ENDED'
    AND s.topic IS NOT NULL
    AND s.startTime >= :from
    GROUP BY s.topic.id, s.topic.name
    ORDER BY 3 DESC
    """)
    List<Object[]> findTimeByTopicSince(
        @Param("userId") Long userId,
        @Param("from") LocalDateTime from
    );
}
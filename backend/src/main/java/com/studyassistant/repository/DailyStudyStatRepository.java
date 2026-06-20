package com.studyassistant.repository;

import com.studyassistant.model.DailyStudyStat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyStudyStatRepository extends JpaRepository<DailyStudyStat, Long> {

    Optional<DailyStudyStat> findByUserIdAndStatDate(Long userId, LocalDate date);

    // last N days for heatmap
    List<DailyStudyStat> findByUserIdAndStatDateBetweenOrderByStatDate(
        Long userId, LocalDate from, LocalDate to
    );

    // streak calculation — all days with at least 1 pomodoro, newest first
    List<DailyStudyStat> findByUserIdAndPomodorosCompletedGreaterThanOrderByStatDateDesc(
        Long userId, int minPomodoros
    );
}
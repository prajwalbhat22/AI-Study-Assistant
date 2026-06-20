package com.studyassistant.dto;

import com.studyassistant.model.PomodoroSession.SessionStatus;
import com.studyassistant.model.PomodoroSession.SessionType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PomodoroSessionDTO {

    private Long id;
    private Long topicId;
    private String topicTitle;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private SessionType sessionType;
    private Integer plannedDurationMinutes;
    private Integer actualDurationMinutes;
    private SessionStatus status;

    private LocalDateTime createdAt;
}
package com.studyassistant.dto;

import com.studyassistant.model.PomodoroSession.SessionType;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StartPomodoroRequest {
    private Long topicId;                    // optional
    private SessionType sessionType;         // FOCUS / SHORT_BREAK / LONG_BREAK
    private Integer plannedDurationMinutes;  // 25, 5, or 15
}
package com.studyassistant.dto;

import com.studyassistant.model.PomodoroSession.SessionStatus;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CompletePomodoroRequest {
    private SessionStatus status;           // COMPLETED / SKIPPED / INTERRUPTED
    private Integer actualDurationMinutes;  // how long it actually ran
}
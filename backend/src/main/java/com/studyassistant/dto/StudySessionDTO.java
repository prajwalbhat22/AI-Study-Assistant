package com.studyassistant.dto;

import com.studyassistant.model.StudySession.StudySessionStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudySessionDTO {

    private Long id;

    private Long topicId;
    private String topicTitle;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;

    private String notes;
    private Integer productivityRating;  // 1–5
    private StudySessionStatus status;

    private LocalDateTime createdAt;
}
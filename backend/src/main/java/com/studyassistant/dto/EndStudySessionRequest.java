package com.studyassistant.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EndStudySessionRequest {
    private String notes;            // optional
    private Integer productivityRating;  // 1–5, optional
}
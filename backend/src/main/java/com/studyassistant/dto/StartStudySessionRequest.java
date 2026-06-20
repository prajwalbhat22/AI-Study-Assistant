package com.studyassistant.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StartStudySessionRequest {
    private Long topicId;   // optional
}
package com.studyassistant.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ExplainRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Level is required")
    @Pattern(regexp = "beginner|intermediate|advanced", message = "Level must be beginner, intermediate, or advanced")
    private String level;

    public ExplainRequest() {}

    public ExplainRequest(String topic, String level) {
        this.topic = topic;
        this.level = level;
    }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
package com.studyassistant.ai.dto.response;

import java.time.LocalDateTime;

public class ExplainResponse {

    private String topic;
    private String level;
    private String explanation;
    private LocalDateTime generatedAt;

    public ExplainResponse() {}

    public ExplainResponse(String topic, String level, String explanation, LocalDateTime generatedAt) {
        this.topic = topic;
        this.level = level;
        this.explanation = explanation;
        this.generatedAt = generatedAt;
    }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}

package com.studyassistant.ai.dto.response;
import java.time.LocalDateTime;

public class ChatResponse {

    private String userMessage;
    private String aiResponse;
    private LocalDateTime timestamp;

    public ChatResponse() {}

    public ChatResponse(String userMessage, String aiResponse, LocalDateTime timestamp) {
        this.userMessage = userMessage;
        this.aiResponse  = aiResponse;
        this.timestamp   = timestamp;
    }

    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }

    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
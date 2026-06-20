package com.studyassistant.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FlashcardRequest {

    @NotBlank(message = "Content must not be blank")
    @Size(min = 20, message = "Content must be at least 20 characters")
    private String content;

    public FlashcardRequest() {}

    public FlashcardRequest(String content) {
        this.content = content;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
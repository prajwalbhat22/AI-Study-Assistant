package com.studyassistant.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SummaryRequest {

    @NotBlank(message = "Content must not be blank")
    @Size(min = 20, max = 10000, message = "Content must be between 20 and 10000 characters")
    private String content;

    private String tone; // "concise", "detailed", "bullet-points" — optional

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }
}
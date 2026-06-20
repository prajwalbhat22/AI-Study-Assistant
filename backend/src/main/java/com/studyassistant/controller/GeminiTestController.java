package com.studyassistant.controller;

import com.studyassistant.ai.service.GeminiAIService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GeminiTestController {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final GeminiAIService geminiAIService;

    public GeminiTestController(GeminiAIService geminiAIService) {
        this.geminiAIService = geminiAIService;
    }

    @GetMapping("/api/test-gemini-key")
    public String testKey() {
        return "Key loaded: " + (apiKey != null && !apiKey.isBlank());
    }

    @GetMapping("/api/test-gemini")
    public String testGemini() {
        return geminiAIService.generateSimpleText(
                "Explain microservices architecture in simple words"
        );
    }
}
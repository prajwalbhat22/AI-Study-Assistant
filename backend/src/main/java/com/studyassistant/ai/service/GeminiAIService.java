package com.studyassistant.ai.service;

import com.studyassistant.ai.dto.request.*;
import com.studyassistant.ai.dto.response.*;
import com.studyassistant.config.GeminiConfig;
import com.studyassistant.dto.gemini.GeminiRequest;
import com.studyassistant.dto.gemini.GeminiResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
@Primary
public class GeminiAIService implements AIService {

    private final RestTemplate restTemplate;
    private final GeminiConfig geminiConfig;
    private final MockAIService mockAIService;

    public GeminiAIService(
            RestTemplate restTemplate,
            GeminiConfig geminiConfig,
            @Qualifier("mockAIService") MockAIService mockAIService
    ) {
        this.restTemplate = restTemplate;
        this.geminiConfig = geminiConfig;
        this.mockAIService = mockAIService;
    }

    private String callGemini(String prompt) {
        String url = geminiConfig.getApiUrl() + "?key=" + geminiConfig.getApiKey();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        GeminiRequest request = new GeminiRequest(prompt);
        HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<GeminiResponse> response =
                restTemplate.postForEntity(url, entity, GeminiResponse.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Gemini API failed");
        }

        String text = response.getBody().extractText();

        if (text == null || text.isBlank()) {
            throw new RuntimeException("Gemini returned empty response");
        }

        return text.trim();
    }

    public String generateSimpleText(String prompt) {
    return callGemini(prompt);
}

    @Override
    public ChatResponse chat(ChatRequest request) {
        System.out.println("===== GEMINI SERVICE CALLED =====");
        try {
            String prompt = """
                    You are an AI Study Assistant for a Java Full Stack student.
                    Answer clearly, practically, and in a beginner-friendly way.

                    Student message:
                    %s

                    Keep the answer useful for learning and interview preparation.
                    """.formatted(request.getMessage());

            String aiResponse = callGemini(prompt);

            return new ChatResponse(
                    request.getMessage(),
                    aiResponse,
                    LocalDateTime.now()
            );

        } catch (Exception e) {
                e.printStackTrace();
                return mockAIService.chat(request);
        }
    }

    @Override
    public SummaryResponse generateSummary(SummaryRequest request) {
        return mockAIService.generateSummary(request);
    }

    @Override
    public QuizResponse generateQuiz(QuizRequest request) {
        return mockAIService.generateQuiz(request);
    }

    @Override
    public FlashcardsResultResponse generateFlashcards(FlashcardRequest request) {
        return mockAIService.generateFlashcards(request);
    }

    @Override
    public ExplainResponse explainTopic(ExplainRequest request) {
        return mockAIService.explainTopic(request);
    }

    @Override
    public StudyPlanResponse generateStudyPlan(StudyPlanRequest request) {
        return mockAIService.generateStudyPlan(request);
    }
}
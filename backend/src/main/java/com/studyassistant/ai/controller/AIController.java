package com.studyassistant.ai.controller;

import com.studyassistant.ai.dto.request.FlashcardRequest;
import com.studyassistant.ai.dto.request.QuizRequest;
import com.studyassistant.ai.dto.request.SummaryRequest;
import com.studyassistant.ai.dto.response.FlashcardsResultResponse;
import com.studyassistant.ai.dto.response.QuizResponse;
import com.studyassistant.ai.dto.response.SummaryResponse;
import com.studyassistant.ai.service.AIService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.studyassistant.ai.dto.request.ExplainRequest;
import com.studyassistant.ai.dto.response.ExplainResponse;
import com.studyassistant.ai.dto.request.StudyPlanRequest;
import com.studyassistant.ai.dto.response.StudyPlanResponse;
import com.studyassistant.ai.dto.request.ChatRequest;
import com.studyassistant.ai.dto.response.ChatResponse;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/summary")
    public ResponseEntity<?> generateSummary(
            @Valid @RequestBody SummaryRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        System.out.println("[AI] Summary requested by: " + username);

        SummaryResponse response = aiService.generateSummary(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/quiz")
    public ResponseEntity<QuizResponse> generateQuiz(
            @Valid @RequestBody QuizRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        System.out.println("[AI] Quiz requested by: " + username);

        QuizResponse response = aiService.generateQuiz(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/flashcards")
    public ResponseEntity<FlashcardsResultResponse> generateFlashcards(
            @Valid @RequestBody FlashcardRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        System.out.println("[AI] Flashcards requested by: " + username);

        FlashcardsResultResponse response = aiService.generateFlashcards(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/explain")
    public ResponseEntity<?> explainTopic(
             @Valid @RequestBody ExplainRequest request,
            Authentication authentication) {

         String username = authentication.getName();
        System.out.println("[AI] Explanation requested by: " + username);

        ExplainResponse response = aiService.explainTopic(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health(Authentication authentication) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "AI module is running");
        res.put("user", authentication.getName());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/study-plan")
    public ResponseEntity<StudyPlanResponse> generateStudyPlan(
        @Valid @RequestBody StudyPlanRequest request,
        Authentication authentication) {

    String username = authentication.getName();
    System.out.println("[AI] Study Plan requested by: " + username);

    StudyPlanResponse response = aiService.generateStudyPlan(request);
    return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
        @Valid @RequestBody ChatRequest request,
        Authentication authentication) {

    String username = authentication.getName();
    System.out.println("[AI] Chat requested by: " + username);

    ChatResponse response = aiService.chat(request);

    return ResponseEntity.ok(response);
    }
}
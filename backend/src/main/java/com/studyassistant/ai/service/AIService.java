package com.studyassistant.ai.service;

import com.studyassistant.ai.dto.request.SummaryRequest;
import com.studyassistant.ai.dto.response.SummaryResponse;
import com.studyassistant.ai.dto.request.ExplainRequest;
import com.studyassistant.ai.dto.request.FlashcardRequest;
import com.studyassistant.ai.dto.request.QuizRequest;
import com.studyassistant.ai.dto.response.ExplainResponse;
import com.studyassistant.ai.dto.response.FlashcardsResultResponse;
import com.studyassistant.ai.dto.response.QuizResponse;
import com.studyassistant.ai.dto.request.StudyPlanRequest;
import com.studyassistant.ai.dto.response.StudyPlanResponse;
import com.studyassistant.ai.dto.request.ChatRequest;
import com.studyassistant.ai.dto.response.ChatResponse;


public interface AIService {
    SummaryResponse generateSummary(SummaryRequest request);
    QuizResponse generateQuiz(QuizRequest request);
    FlashcardsResultResponse generateFlashcards(FlashcardRequest request);
    ExplainResponse explainTopic(ExplainRequest request);
    StudyPlanResponse generateStudyPlan(StudyPlanRequest request);
    ChatResponse chat(ChatRequest request);
}
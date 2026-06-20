package com.studyassistant.ai.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class QuizResponse {

    private List<QuizQuestionResponse> questions;
    private String difficulty;
    private int totalQuestions;
    private LocalDateTime generatedAt;

    public QuizResponse() {}

    public QuizResponse(List<QuizQuestionResponse> questions, String difficulty) {
        this.questions = questions;
        this.difficulty = difficulty;
        this.totalQuestions = questions.size();
        this.generatedAt = LocalDateTime.now();
    }

    public List<QuizQuestionResponse> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestionResponse> questions) {
        this.questions = questions;
        this.totalQuestions = questions != null ? questions.size() : 0;
    }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
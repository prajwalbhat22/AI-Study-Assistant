package com.studyassistant.ai.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class QuizRequest {

    @NotBlank(message = "Content must not be blank")
    private String content;

    @NotNull(message = "Difficulty is required")
    private String difficulty; // easy | medium | hard

    @Min(value = 1, message = "Minimum 1 question")
    @Max(value = 10, message = "Maximum 10 questions")
    private int numberOfQuestions = 5;

    public QuizRequest() {}

    public QuizRequest(String content, String difficulty, int numberOfQuestions) {
        this.content = content;
        this.difficulty = difficulty;
        this.numberOfQuestions = numberOfQuestions;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getNumberOfQuestions() { return numberOfQuestions; }
    public void setNumberOfQuestions(int numberOfQuestions) { this.numberOfQuestions = numberOfQuestions; }
}
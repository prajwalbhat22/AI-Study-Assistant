package com.studyassistant.ai.dto.response;

import java.util.List;

public class QuizQuestionResponse {

    private String question;
    private List<String> options;   // Always 4 options
    private String correctAnswer;   // Matches one of the options exactly
    private String explanation;

    public QuizQuestionResponse() {}

    public QuizQuestionResponse(String question, List<String> options,
                                 String correctAnswer, String explanation) {
        this.question = question;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
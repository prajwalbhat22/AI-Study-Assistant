package com.studyassistant.ai.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class FlashcardsResultResponse {

    private List<FlashcardResponse> flashcards;
    private int totalCards;
    private LocalDateTime generatedAt;

    public FlashcardsResultResponse() {}

    public FlashcardsResultResponse(List<FlashcardResponse> flashcards) {
        this.flashcards  = flashcards;
        this.totalCards  = flashcards != null ? flashcards.size() : 0;
        this.generatedAt = LocalDateTime.now();
    }

    public List<FlashcardResponse> getFlashcards() { return flashcards; }
    public void setFlashcards(List<FlashcardResponse> flashcards) {
        this.flashcards = flashcards;
        this.totalCards = flashcards != null ? flashcards.size() : 0;
    }

    public int getTotalCards() { return totalCards; }
    public void setTotalCards(int totalCards) { this.totalCards = totalCards; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}

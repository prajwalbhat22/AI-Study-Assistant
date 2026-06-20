package com.studyassistant.ai.dto.response;

public class SummaryResponse {

    private String summary;
    private int originalWordCount;
    private int summaryWordCount;
    private String tone;
    private String generatedAt;

    // Constructor
    public SummaryResponse(String summary, int originalWordCount,
                           int summaryWordCount, String tone, String generatedAt) {
        this.summary = summary;
        this.originalWordCount = originalWordCount;
        this.summaryWordCount = summaryWordCount;
        this.tone = tone;
        this.generatedAt = generatedAt;
    }

    public String getSummary() { return summary; }
    public int getOriginalWordCount() { return originalWordCount; }
    public int getSummaryWordCount() { return summaryWordCount; }
    public String getTone() { return tone; }
    public String getGeneratedAt() { return generatedAt; }
}
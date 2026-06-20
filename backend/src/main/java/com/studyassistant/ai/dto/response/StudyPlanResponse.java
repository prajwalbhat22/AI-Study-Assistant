package com.studyassistant.ai.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class StudyPlanResponse {

    private String topic;
    private int totalDays;
    private int hoursPerDay;
    private List<StudyPlanDayResponse> plan;
    private LocalDateTime generatedAt;

    public StudyPlanResponse() {}

    public StudyPlanResponse(String topic, int totalDays, int hoursPerDay,
                              List<StudyPlanDayResponse> plan, LocalDateTime generatedAt) {
        this.topic = topic;
        this.totalDays = totalDays;
        this.hoursPerDay = hoursPerDay;
        this.plan = plan;
        this.generatedAt = generatedAt;
    }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public int getTotalDays() { return totalDays; }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }

    public int getHoursPerDay() { return hoursPerDay; }
    public void setHoursPerDay(int hoursPerDay) { this.hoursPerDay = hoursPerDay; }

    public List<StudyPlanDayResponse> getPlan() { return plan; }
    public void setPlan(List<StudyPlanDayResponse> plan) { this.plan = plan; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}

package com.studyassistant.ai.dto.response;

import java.util.List;

public class StudyPlanDayResponse {

    private int dayNumber;
    private String title;
    private List<String> tasks;
    private double estimatedHours;

    public StudyPlanDayResponse() {}

    public StudyPlanDayResponse(int dayNumber, String title, List<String> tasks, double estimatedHours) {
        this.dayNumber = dayNumber;
        this.title = title;
        this.tasks = tasks;
        this.estimatedHours = estimatedHours;
    }

    public int getDayNumber() { return dayNumber; }
    public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<String> getTasks() { return tasks; }
    public void setTasks(List<String> tasks) { this.tasks = tasks; }

    public double getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(double estimatedHours) { this.estimatedHours = estimatedHours; }
}

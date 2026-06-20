package com.studyassistant.ai.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StudyPlanRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotNull(message = "Days available is required")
    @Min(value = 1, message = "Minimum 1 day required")
    @Max(value = 30, message = "Maximum 30 days allowed")
    private Integer daysAvailable;

    @NotNull(message = "Hours per day is required")
    @Min(value = 1, message = "Minimum 1 hour per day required")
    @Max(value = 12, message = "Maximum 12 hours per day allowed")
    private Integer hoursPerDay;

    public StudyPlanRequest() {}

    public StudyPlanRequest(String topic, Integer daysAvailable, Integer hoursPerDay) {
        this.topic = topic;
        this.daysAvailable = daysAvailable;
        this.hoursPerDay = hoursPerDay;
    }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public Integer getDaysAvailable() { return daysAvailable; }
    public void setDaysAvailable(Integer daysAvailable) { this.daysAvailable = daysAvailable; }

    public Integer getHoursPerDay() { return hoursPerDay; }
    public void setHoursPerDay(Integer hoursPerDay) { this.hoursPerDay = hoursPerDay; }
}

package com.studyassistant.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStatsDTO {

    // today
    private Integer todayFocusMinutes;
    private Integer todayPomodoros;

    // this week
    private Integer weekFocusMinutes;
    private Integer weekPomodoros;

    // streak
    private Integer currentStreakDays;
    private Integer longestStreakDays;

    // per-topic breakdown (last 30 days)
    private List<TopicTimeDTO> timeByTopic;

    // last 7 days for the mini bar chart on dashboard
    private List<DailyStatDTO> last7Days;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TopicTimeDTO {
        private Long topicId;
        private String topicTitle;
        private Integer totalMinutes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DailyStatDTO {
        private String date;          // "Mon", "Tue" etc.
        private Integer focusMinutes;
        private Integer pomodoros;
    }
}
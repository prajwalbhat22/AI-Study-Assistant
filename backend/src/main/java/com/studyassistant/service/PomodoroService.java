package com.studyassistant.service;

import com.studyassistant.dto.*;
import com.studyassistant.model.*;
import com.studyassistant.model.PomodoroSession.*;
import com.studyassistant.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PomodoroService {

    private final PomodoroSessionRepository pomodoroRepo;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final DailyStudyStatRepository dailyStatRepo;

    @Transactional
    public PomodoroSessionDTO startSession(String email, StartPomodoroRequest req) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        pomodoroRepo.findByUserIdAndEndTimeIsNull(userId).ifPresent(existing -> {
            throw new IllegalStateException("A pomodoro session is already running. Complete it first.");
        });

        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .sessionType(req.getSessionType())
                .plannedDurationMinutes(req.getPlannedDurationMinutes())
                .startTime(LocalDateTime.now())
                .status(SessionStatus.INTERRUPTED)
                .build();

        if (req.getTopicId() != null) {
            Topic topic = topicRepository.findById(req.getTopicId())
                    .orElseThrow(() -> new RuntimeException("Topic not found"));
            session.setTopic(topic);
        }

        return toDTO(pomodoroRepo.save(session));
    }

    @Transactional
    public PomodoroSessionDTO completeSession(String email, Long sessionId, CompletePomodoroRequest req) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PomodoroSession session = pomodoroRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }

        session.setEndTime(LocalDateTime.now());
        session.setStatus(req.getStatus());
        session.setActualDurationMinutes(req.getActualDurationMinutes());

        PomodoroSession saved = pomodoroRepo.save(session);

        if (req.getStatus() == SessionStatus.COMPLETED
                && session.getSessionType() == SessionType.FOCUS) {
            updateDailyStat(user, req.getActualDurationMinutes(), 1);
        }

        return toDTO(saved);
    }

    public List<PomodoroSessionDTO> getHistory(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return pomodoroRepo.findByUserIdOrderByStartTimeDesc(user.getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateDailyStat(User user, int focusMinutesToAdd, int pomodorosToAdd) {
        LocalDate today = LocalDate.now();

        DailyStudyStat stat = dailyStatRepo
                .findByUserIdAndStatDate(user.getId(), today)
                .orElseGet(() -> DailyStudyStat.builder()
                        .user(user)
                        .statDate(today)
                        .totalFocusMinutes(0)
                        .pomodorosCompleted(0)
                        .studySessionsCount(0)
                        .build());

        stat.setTotalFocusMinutes(stat.getTotalFocusMinutes() + focusMinutesToAdd);
        stat.setPomodorosCompleted(stat.getPomodorosCompleted() + pomodorosToAdd);
        dailyStatRepo.save(stat);
    }

    private PomodoroSessionDTO toDTO(PomodoroSession p) {
        return PomodoroSessionDTO.builder()
                .id(p.getId())
                .topicId(p.getTopic() != null ? p.getTopic().getId() : null)
                .topicTitle(p.getTopic() != null ? p.getTopic().getName() : null)
                .startTime(p.getStartTime())
                .endTime(p.getEndTime())
                .sessionType(p.getSessionType())
                .plannedDurationMinutes(p.getPlannedDurationMinutes())
                .actualDurationMinutes(p.getActualDurationMinutes())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
package com.studyassistant.service;

import com.studyassistant.dto.*;
import com.studyassistant.model.*;
import com.studyassistant.model.StudySession.StudySessionStatus;
import com.studyassistant.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository studySessionRepo;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final DailyStudyStatRepository dailyStatRepo;

    @Transactional
    public StudySessionDTO startSession(String email, StartStudySessionRequest req) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        studySessionRepo.findByUserIdAndStatus(userId, StudySessionStatus.ACTIVE)
                .ifPresent(active -> endSessionInternal(active, null, null));

        StudySession session = StudySession.builder()
                .user(user)
                .startTime(LocalDateTime.now())
                .status(StudySessionStatus.ACTIVE)
                .build();

        if (req.getTopicId() != null) {
            Topic topic = topicRepository.findById(req.getTopicId())
                    .orElseThrow(() -> new RuntimeException("Topic not found"));
            session.setTopic(topic);
        }

        return toDTO(studySessionRepo.save(session));
    }

    @Transactional
    public StudySessionDTO endSession(String email, Long sessionId, EndStudySessionRequest req) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudySession session = studySessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }

        if (session.getStatus() == StudySessionStatus.ENDED) {
            throw new IllegalStateException("Session already ended");
        }

        return toDTO(endSessionInternal(session, req.getNotes(), req.getProductivityRating()));
    }

    public List<StudySessionDTO> getHistory(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return studySessionRepo.findByUserIdOrderByStartTimeDesc(user.getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public StudySessionDTO getActiveSession(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return studySessionRepo
                .findByUserIdAndStatus(user.getId(), StudySessionStatus.ACTIVE)
                .map(this::toDTO)
                .orElse(null);
    }

    private StudySession endSessionInternal(StudySession session, String notes, Integer rating) {
        LocalDateTime now = LocalDateTime.now();
        int minutes = (int) ChronoUnit.MINUTES.between(session.getStartTime(), now);

        session.setEndTime(now);
        session.setDurationMinutes(minutes);
        session.setStatus(StudySessionStatus.ENDED);

        if (notes != null) {
            session.setNotes(notes);
        }

        if (rating != null) {
            session.setProductivityRating(rating);
        }

        StudySession saved = studySessionRepo.save(session);
        updateDailyStat(session.getUser());

        return saved;
    }

    private void updateDailyStat(User user) {
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

        stat.setStudySessionsCount(stat.getStudySessionsCount() + 1);
        dailyStatRepo.save(stat);
    }

    private StudySessionDTO toDTO(StudySession s) {
        return StudySessionDTO.builder()
                .id(s.getId())
                .topicId(s.getTopic() != null ? s.getTopic().getId() : null)
                .topicTitle(s.getTopic() != null ? s.getTopic().getName() : null)
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .durationMinutes(s.getDurationMinutes())
                .notes(s.getNotes())
                .productivityRating(s.getProductivityRating())
                .status(s.getStatus())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
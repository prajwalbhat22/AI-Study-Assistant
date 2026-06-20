package com.studyassistant.controller;

import com.studyassistant.dto.EndStudySessionRequest;
import com.studyassistant.dto.StartStudySessionRequest;
import com.studyassistant.dto.StudySessionDTO;
import com.studyassistant.service.StudySessionService;
import com.studyassistant.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    @PostMapping("/start")
    public ResponseEntity<StudySessionDTO> start(@RequestBody StartStudySessionRequest req) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(studySessionService.startSession(email, req));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<StudySessionDTO> end(
            @PathVariable Long id,
            @RequestBody EndStudySessionRequest req) {

        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(studySessionService.endSession(email, id, req));
    }

    @GetMapping("/active")
    public ResponseEntity<StudySessionDTO> active() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(studySessionService.getActiveSession(email));
    }

    @GetMapping("/history")
    public ResponseEntity<List<StudySessionDTO>> history() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(studySessionService.getHistory(email));
    }
}
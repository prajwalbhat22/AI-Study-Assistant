package com.studyassistant.controller;

import com.studyassistant.dto.CompletePomodoroRequest;
import com.studyassistant.dto.PomodoroSessionDTO;
import com.studyassistant.dto.StartPomodoroRequest;
import com.studyassistant.service.PomodoroService;
import com.studyassistant.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroService pomodoroService;

    @PostMapping("/start")
    public ResponseEntity<PomodoroSessionDTO> start(@RequestBody StartPomodoroRequest req) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(pomodoroService.startSession(email, req));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<PomodoroSessionDTO> complete(
            @PathVariable Long id,
            @RequestBody CompletePomodoroRequest req) {

        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(pomodoroService.completeSession(email, id, req));
    }

    @GetMapping("/history")
    public ResponseEntity<List<PomodoroSessionDTO>> history() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(pomodoroService.getHistory(email));
    }
}
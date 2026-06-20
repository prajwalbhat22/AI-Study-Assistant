package com.studyassistant.controller;

import com.studyassistant.dto.request.NoteRequest;
import com.studyassistant.dto.response.NoteResponse;
import com.studyassistant.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * NoteController — Handles HTTP requests for Note operations.
 */
@RestController
@RequestMapping("/api/topics/{topicId}/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    /**
     * GET /api/topics/0/notes/all
     * Returns all notes of the currently authenticated user.
     *
     * NOTE:
     * This route is added for the frontend Notes page.
     * The topicId value is ignored for this endpoint.
     */
    @GetMapping("/all")
    public ResponseEntity<List<NoteResponse>> getAllNotesForCurrentUser() {

        List<NoteResponse> notes = noteService.getAllNotesForCurrentUser();

        return ResponseEntity.ok(notes);
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @PathVariable Long topicId,
            @Valid @RequestBody NoteRequest noteRequest) {

        NoteResponse noteResponse = noteService.createNote(topicId, noteRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(noteResponse);
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getAllNotesByTopic(
            @PathVariable Long topicId) {

        List<NoteResponse> notes = noteService.getAllNotesByTopic(topicId);

        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<NoteResponse> getNoteById(
            @PathVariable Long topicId,
            @PathVariable Long noteId) {

        NoteResponse noteResponse = noteService.getNoteById(topicId, noteId);

        return ResponseEntity.ok(noteResponse);
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable Long topicId,
            @PathVariable Long noteId,
            @Valid @RequestBody NoteRequest noteRequest) {

        NoteResponse noteResponse =
                noteService.updateNote(topicId, noteId, noteRequest);

        return ResponseEntity.ok(noteResponse);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long topicId,
            @PathVariable Long noteId) {

        noteService.deleteNote(topicId, noteId);

        return ResponseEntity.noContent().build();
    }
}
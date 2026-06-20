package com.studyassistant.service;

import com.studyassistant.dto.request.NoteRequest;
import com.studyassistant.dto.response.NoteResponse;
import com.studyassistant.model.Note;
import com.studyassistant.model.Topic;
import com.studyassistant.model.User;
import com.studyassistant.repository.NoteRepository;
import com.studyassistant.repository.TopicRepository;
import com.studyassistant.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    public NoteService(NoteRepository noteRepository,
                       TopicRepository topicRepository,
                       UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }

    public NoteResponse createNote(Long topicId, NoteRequest noteRequest) {

        User currentUser = getCurrentUser();

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));

        if (!topic.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: Topic does not belong to the current user");
        }

        Note note = new Note(
                noteRequest.getTitle(),
                noteRequest.getContent(),
                topic
        );

        Note savedNote = noteRepository.save(note);

        return mapToResponse(savedNote);
    }

    public List<NoteResponse> getAllNotesForCurrentUser() {

        User currentUser = getCurrentUser();

        List<Topic> topics = topicRepository.findByUserId(currentUser.getId());

        return topics.stream()
                .flatMap(topic ->
                        noteRepository.findByTopicIdAndTopicUserId(
                                topic.getId(),
                                currentUser.getId()
                        ).stream()
                )
                .map(this::mapToResponse)
                .toList();
    }

    public List<NoteResponse> getAllNotesByTopic(Long topicId) {

        User currentUser = getCurrentUser();

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));

        if (!topic.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: Topic does not belong to the current user");
        }

        List<Note> notes = noteRepository.findByTopicIdAndTopicUserId(
                topicId,
                currentUser.getId()
        );

        return notes.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public NoteResponse getNoteById(Long topicId, Long noteId) {

        User currentUser = getCurrentUser();

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));

        if (!topic.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: Topic does not belong to the current user");
        }

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!note.getTopic().getId().equals(topicId)) {
            throw new RuntimeException("Note does not belong to the specified topic");
        }

        return mapToResponse(note);
    }

    public NoteResponse updateNote(Long topicId, Long noteId, NoteRequest noteRequest) {

        User currentUser = getCurrentUser();

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));

        if (!topic.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: Topic does not belong to the current user");
        }

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!note.getTopic().getId().equals(topicId)) {
            throw new RuntimeException("Note does not belong to the specified topic");
        }

        note.setTitle(noteRequest.getTitle());
        note.setContent(noteRequest.getContent());

        Note updatedNote = noteRepository.save(note);

        return mapToResponse(updatedNote);
    }

    public void deleteNote(Long topicId, Long noteId) {

        User currentUser = getCurrentUser();

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));

        if (!topic.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: Topic does not belong to the current user");
        }

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!note.getTopic().getId().equals(topicId)) {
            throw new RuntimeException("Note does not belong to the specified topic");
        }

        noteRepository.delete(note);
    }

    private User getCurrentUser() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private NoteResponse mapToResponse(Note note) {
        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getContent(),
                note.getCreatedAt(),
                note.getTopic().getId(),
                note.getTopic().getName()
        );
    }
}
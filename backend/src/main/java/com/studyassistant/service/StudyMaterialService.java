package com.studyassistant.service;

import com.studyassistant.dto.response.StudyMaterialResponse;
import com.studyassistant.dto.response.UploadStudyMaterialResponse;
import com.studyassistant.model.Note;
import com.studyassistant.model.StudyMaterial;
import com.studyassistant.repository.NoteRepository;
import com.studyassistant.repository.StudyMaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyMaterialService {

    private final StudyMaterialRepository studyMaterialRepository;
    private final NoteRepository noteRepository;

    @Value("${file.upload-dir:uploads/study-materials}")
    private String uploadDir;

    @Value("${file.max-size-bytes:10485760}")
    private long maxFileSizeBytes;

    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    public UploadStudyMaterialResponse uploadMaterial(Long noteId, MultipartFile file) {

        String currentUserEmail = getCurrentUserEmail();

        log.info("Upload request by user: {} for noteId: {}", currentUserEmail, noteId);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        String noteOwnerEmail = note.getTopic().getUser().getEmail();

        if (!noteOwnerEmail.equals(currentUserEmail)) {
            log.warn("Unauthorized upload attempt by {} on noteId {}", currentUserEmail, noteId);
            throw new RuntimeException("Access denied: You do not own this note");
        }

        validateFile(file);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = extractExtension(originalFileName);
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        Path savedFilePath = saveFileToDisk(uniqueFileName, file);

        StudyMaterial material = StudyMaterial.builder()
                .fileName(uniqueFileName)
                .originalFileName(originalFileName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(savedFilePath.toString())
                .note(note)
                .build();

        StudyMaterial savedMaterial = studyMaterialRepository.save(material);

        log.info("File saved: {} with id: {}", uniqueFileName, savedMaterial.getId());

        return UploadStudyMaterialResponse.builder()
                .message("File uploaded successfully")
                .id(savedMaterial.getId())
                .fileName(savedMaterial.getOriginalFileName())
                .fileType(savedMaterial.getFileType())
                .fileSize(formatFileSize(savedMaterial.getFileSize()))
                .downloadUrl("/api/notes/" + noteId + "/materials/" + savedMaterial.getId() + "/download")
                .noteId(noteId)
                .uploadedAt(savedMaterial.getUploadedAt())
                .build();
    }

    public List<StudyMaterialResponse> getMaterialsByNote(Long noteId) {

        String currentUserEmail = getCurrentUserEmail();

        log.info("Fetching materials for noteId: {} requested by: {}", noteId, currentUserEmail);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        String noteOwnerEmail = note.getTopic().getUser().getEmail();

        if (!noteOwnerEmail.equals(currentUserEmail)) {
            log.warn("Unauthorized access attempt by {} on noteId {}", currentUserEmail, noteId);
            throw new RuntimeException("Access denied: You do not own this note");
        }

        List<StudyMaterial> materials =
                studyMaterialRepository.findByNoteIdOrderByUploadedAtDesc(noteId);

        return materials.stream()
                .map(this::mapToStudyMaterialResponse)
                .toList();
    }

    public List<StudyMaterialResponse> getAllMaterialsForCurrentUser() {

        String currentUserEmail = getCurrentUserEmail();

        log.info("Fetching all materials for user: {}", currentUserEmail);

        List<StudyMaterial> materials =
                studyMaterialRepository.findByNoteTopicUserEmailOrderByUploadedAtDesc(currentUserEmail);

        return materials.stream()
                .map(this::mapToStudyMaterialResponse)
                .toList();
    }

    public StudyMaterialResponse getMaterialById(Long noteId, Long materialId) {

        String currentUserEmail = getCurrentUserEmail();

        log.info("Fetching materialId: {} for noteId: {} requested by: {}",
                materialId, noteId, currentUserEmail);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        String noteOwnerEmail = note.getTopic().getUser().getEmail();

        if (!noteOwnerEmail.equals(currentUserEmail)) {
            throw new RuntimeException("Access denied: You do not own this note");
        }

        StudyMaterial material = studyMaterialRepository
                .findByIdAndNoteId(materialId, noteId)
                .orElseThrow(() -> new RuntimeException(
                        "Study material not found with id: " + materialId + " for note: " + noteId
                ));

        return mapToStudyMaterialResponse(material);
    }

    public Resource downloadMaterial(Long noteId, Long materialId) throws MalformedURLException {

        String currentUserEmail = getCurrentUserEmail();

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!note.getTopic().getUser().getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("Access denied: You do not own this note");
        }

        StudyMaterial material = studyMaterialRepository
                .findByIdAndNoteId(materialId, noteId)
                .orElseThrow(() -> new RuntimeException(
                        "Study material not found with id: " + materialId
                ));

        Path filePath = Paths.get(material.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found on disk");
        }

        return resource;
    }

    public void deleteMaterial(Long noteId, Long materialId) {

        String currentUserEmail = getCurrentUserEmail();

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        String noteOwnerEmail = note.getTopic().getUser().getEmail();

        if (!noteOwnerEmail.equals(currentUserEmail)) {
            throw new RuntimeException("Access denied: You do not own this note");
        }

        StudyMaterial material = studyMaterialRepository
                .findByIdAndNoteId(materialId, noteId)
                .orElseThrow(() -> new RuntimeException(
                        "Study material not found with id: " + materialId + " for note: " + noteId
                ));

        try {
            Path filePath = Paths.get(material.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete the file from storage", e);
        }

        studyMaterialRepository.delete(material);
    }

    private StudyMaterialResponse mapToStudyMaterialResponse(StudyMaterial material) {

        Long noteId = null;
        Long topicId = null;
        String topicTitle = "General";
        String downloadUrl = null;

        if (material.getNote() != null) {
            noteId = material.getNote().getId();
            downloadUrl = "/api/notes/" + noteId + "/materials/" + material.getId() + "/download";

            if (material.getNote().getTopic() != null) {
                topicId = material.getNote().getTopic().getId();
                topicTitle = material.getNote().getTopic().getName();
            }
        }

        return StudyMaterialResponse.builder()
                .id(material.getId())
                .fileName(material.getOriginalFileName())
                .fileType(material.getFileType())
                .fileSize(formatFileSize(material.getFileSize()))
                .downloadUrl(downloadUrl)
                .noteId(noteId)
                .topicId(topicId)
                .topicTitle(topicTitle)
                .uploadedAt(material.getUploadedAt())
                .build();
    }

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File must not be empty");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new RuntimeException(
                    "File type not allowed: " + contentType +
                            ". Allowed types: PDF, JPEG, PNG, GIF, DOC, DOCX, TXT"
            );
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new RuntimeException(
                    "File size " + formatFileSize(file.getSize()) +
                            " exceeds the maximum allowed size of " + formatFileSize(maxFileSizeBytes)
            );
        }
    }

    private Path saveFileToDisk(String uniqueFileName, MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return targetPath;

        } catch (IOException e) {
            log.error("Failed to save file {} to disk: {}", uniqueFileName, e.getMessage());
            throw new RuntimeException("Could not save file to storage. Please try again.", e);
        }
    }

    private String extractExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.1f KB", bytes / 1024.0);
        } else {
            return String.format("%.1f MB", bytes / (1024.0 * 1024));
        }
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
}
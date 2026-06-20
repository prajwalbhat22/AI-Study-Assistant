package com.studyassistant.controller;

import com.studyassistant.dto.response.UploadStudyMaterialResponse;
import com.studyassistant.service.StudyMaterialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.studyassistant.dto.response.StudyMaterialResponse;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.DeleteMapping;

/**
 * StudyMaterialController — REST API layer for Study Material operations.
 *
 * Currently exposes:
 *   POST /api/notes/{noteId}/materials/upload
 *
 * The URL structure /api/notes/{noteId}/materials reflects the ownership hierarchy:
 *   a material always lives under a note, which lives under a topic, which belongs to a user.
 *
 * The controller's ONLY jobs are:
 *   1. Accept the HTTP request and extract parameters
 *   2. Delegate all logic to StudyMaterialService
 *   3. Wrap the result in the correct HTTP response code
 *
 * No business logic, no file handling, no validation lives here.
 */
@RestController
// @RestController = @Controller + @ResponseBody.
// Every method return value is automatically serialized to JSON.
// You don't need @ResponseBody on each method.

@RequestMapping("/api/notes/{noteId}/materials")
// All endpoints in this controller are prefixed with this path.
// {noteId} is a path variable shared by all methods — avoids repeating it on each method.
// This nesting makes ownership clear: materials live under notes.

@RequiredArgsConstructor
// Lombok: constructor injection for StudyMaterialService.

@Slf4j
// Lombok: provides the `log` logger.

public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;
    // The service handles all business logic — the controller just delegates.

    // ─────────────────────────────────────────
    // POST /api/notes/{noteId}/materials/upload
    // ─────────────────────────────────────────

    /**
     * Upload a study material file and attach it to the specified Note.
     *
     * HTTP Method : POST
     * URL         : /api/notes/{noteId}/materials/upload
     * Auth        : Required (JWT Bearer token in Authorization header)
     * Body        : multipart/form-data  →  key: "file",  value: <the file>
     * Returns     : 201 Created + UploadStudyMaterialResponse JSON
     *
     * @param noteId  Path variable — the ID of the Note to attach the file to
     * @param file    The uploaded file from the multipart request body
     */
    @PostMapping("/upload")
    // Maps HTTP POST requests to /api/notes/{noteId}/materials/upload.
    // "/upload" appends to the class-level @RequestMapping path.

    public ResponseEntity<UploadStudyMaterialResponse> uploadMaterial(

            @PathVariable Long noteId,
            // @PathVariable extracts {noteId} from the URL path.
            // Spring auto-converts the String segment to Long.
            // Example URL: POST /api/notes/5/materials/upload → noteId = 5

            @RequestParam("file") MultipartFile file
            // @RequestParam("file") binds the multipart file from the request body.
            // "file" must match the key name used in Postman / your frontend form.
            // MultipartFile gives you: getOriginalFilename(), getContentType(),
            //                          getSize(), getInputStream(), isEmpty()
    ) {
        log.info("Upload endpoint hit — noteId: {}, originalFilename: {}",
                noteId, file.getOriginalFilename());

        // Delegate entirely to the service layer.
        // The service handles: auth check, ownership check, validation, disk write, DB save.
        UploadStudyMaterialResponse response = studyMaterialService.uploadMaterial(noteId, file);

        // Return 201 Created (not 200 OK) — a new resource was created on the server.
        // ResponseEntity.status(HttpStatus.CREATED).body(...) gives us full control
        // over the HTTP status code, which 200-defaulting @RestController wouldn't give us.
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<StudyMaterialResponse>> getMaterialsByNote(
        @PathVariable Long noteId
    ) {
    log.info("GET all materials — noteId: {}", noteId);

    List<StudyMaterialResponse> response =
            studyMaterialService.getMaterialsByNote(noteId);

    return ResponseEntity.ok(response);
    }

    @GetMapping("/{materialId}")
    public ResponseEntity<StudyMaterialResponse> getMaterialById(
        @PathVariable Long noteId,
        @PathVariable Long materialId
    ) {
    log.info("GET single material — noteId: {}, materialId: {}", noteId, materialId);

    StudyMaterialResponse response =
            studyMaterialService.getMaterialById(noteId, materialId);

    return ResponseEntity.ok(response);
    }
    @GetMapping("/{materialId}/download")
    public ResponseEntity<Resource> downloadMaterial(
        @PathVariable Long noteId,
        @PathVariable Long materialId
    ) throws Exception {

    Resource resource =
            studyMaterialService.downloadMaterial(noteId, materialId);

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
    }

    @DeleteMapping("/{materialId}")
        public ResponseEntity<Void> deleteMaterial(
        @PathVariable Long noteId,
        @PathVariable Long materialId
        ) {
    log.info("DELETE material — noteId: {}, materialId: {}", noteId, materialId);

    studyMaterialService.deleteMaterial(noteId, materialId);

    return ResponseEntity.noContent().build();
        }
}
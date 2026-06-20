// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/controller/AuthController.java
//
// WHAT CHANGED FROM THE PREVIOUS VERSION?
//   The register() method is UNCHANGED — do not touch it.
//   We are only ADDING:
//     1. Three new imports  (LoginRequest, LoginResponse, HttpStatus.OK)
//     2. One new method     (login)
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.controller;

import com.studyassistant.dto.request.LoginRequest;
import com.studyassistant.dto.request.RegisterRequest;
import com.studyassistant.dto.response.LoginResponse;
import com.studyassistant.model.User;
import com.studyassistant.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // ENDPOINT 1: POST /api/auth/register  (UNCHANGED)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request) {

        User savedUser = authService.registerUser(request);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful");
        response.put("userId", savedUser.getId());
        response.put("fullName", savedUser.getFullName());
        response.put("email", savedUser.getEmail());
        response.put("createdAt", savedUser.getCreatedAt());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // ENDPOINT 2: POST /api/auth/login  (NEW)
    //
    // @PostMapping("/login")
    //   Maps HTTP POST requests to /api/auth/login → this method.
    //   Full URL = /api/auth  +  /login  =  /api/auth/login
    //
    //   Why POST for login?
    //   Credentials (email + password) go in the request BODY.
    //   GET requests have no body — credentials would end up in
    //   the URL, which is visible in browser history and server logs.
    //   POST keeps credentials private. Always use POST for login.
    //
    // Return type: ResponseEntity<LoginResponse>
    //   Unlike register() which returns Map<String, Object>, here we
    //   return a typed ResponseEntity<LoginResponse>. This is the
    //   better practice — the return type is self-documenting and
    //   type-safe. The LoginResponse is serialized to JSON by Jackson.
    //
    // @Valid
    //   Activates validation on LoginRequest before this method runs:
    //     @NotBlank on email   → rejects empty email
    //     @Email on email      → rejects "notanemail"
    //     @NotBlank on password → rejects empty password
    //   If any fail → 400 Bad Request from GlobalExceptionHandler.
    //   This method body is never reached.
    //
    // @RequestBody LoginRequest request
    //   Spring deserializes the JSON body:
    //   { "email": "ravi@test.com", "password": "securepass123" }
    //   → LoginRequest with email and password fields populated.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        // ─────────────────────────────────────────────────────────
        // DELEGATE TO SERVICE
        //
        // authService.loginUser(request)
        //   AuthService does all the real work:
        //     1. Finds the user by email
        //     2. Verifies the password with BCrypt
        //     3. Returns a LoginResponse on success
        //     4. Throws UnauthorizedException on failure
        //
        // The Controller knows NOTHING about how login works.
        // It just passes the request and returns whatever the
        // service gives back (or lets the exception propagate to
        // GlobalExceptionHandler automatically).
        //
        // ResponseEntity.ok(loginResponse)
        //   .ok() is a shortcut for .status(HttpStatus.OK).body(...)
        //   HTTP 200 OK is correct here — the resource (user session)
        //   was not CREATED (that would be 201), it was ACCESSED.
        //   Successful login = 200 OK.
        // ─────────────────────────────────────────────────────────
        LoginResponse loginResponse = authService.loginUser(request);

        return ResponseEntity.ok(loginResponse);
    }

}

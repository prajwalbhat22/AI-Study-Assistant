// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/exception/GlobalExceptionHandler.java
//
// WHAT CHANGED FROM THE PREVIOUS VERSION?
//   Only ONE addition: handleUnauthorizedException() method.
//   All three existing handlers are UNCHANGED.
//   Add the new method between the imports block and handleRuntimeException.
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.exception;

import jakarta.servlet.http.HttpServletRequest;
import com.studyassistant.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {


    // ─────────────────────────────────────────────────────────────────────────
    // HANDLER 1: Validation Errors  →  400 Bad Request  (UNCHANGED)
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String errorMessage = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

       ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            errorMessage,
            request.getRequestURI(),
            LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // HANDLER 2: Unauthorized / Invalid Credentials  →  401  (NEW)
    //
    // @ExceptionHandler(UnauthorizedException.class)
    //   Spring checks exception type from most-specific to least-specific.
    //   UnauthorizedException is MORE specific than RuntimeException,
    //   so this handler is checked FIRST by Spring before Handler 3.
    //   Placing it before handleRuntimeException() makes the ordering
    //   visually clear as well.
    //
    // WHEN IS THIS TRIGGERED?
    //   In AuthService.loginUser() when:
    //     - No user found with the given email
    //     - Password doesn't match the stored BCrypt hash
    //   Both cases throw UnauthorizedException("Invalid email or password")
    //   which flows: AuthService → AuthController → here.
    //   AuthController never sees it — it propagates automatically.
    //
    // HttpStatus.UNAUTHORIZED  →  HTTP 401
    //   The standard code meaning: "I don't know who you are,
    //   or the credentials you provided are wrong."
    //   401 ≠ 403. 403 Forbidden means "I know who you are,
    //   but you're not allowed." 401 means "prove who you are first."
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(
            UnauthorizedException ex,
            HttpServletRequest request) {

       ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            ex.getMessage(),
            request.getRequestURI(),
            LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(errorResponse);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // HANDLER 3: Business Rule Violations  →  409 Conflict  (UNCHANGED)
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            request.getRequestURI(),
            LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // HANDLER 4: Everything Else  →  500 Internal Server Error  (UNCHANGED)
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        System.err.println("Unexpected error at " + request.getRequestURI()
                + " → " + ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred. Please try again later.",
            request.getRequestURI(),
            LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

}
// ─────────────────────────────────────────────────────────────────────────────
// SPRING'S EXCEPTION HANDLER SELECTION RULES
//
// Spring always picks the MOST SPECIFIC matching handler:
//
// Exception thrown                         Handler called    HTTP status
// ──────────────────────────────────────── ────────────────  ───────────
// MethodArgumentNotValidException          Handler 1         400
// UnauthorizedException                   Handler 2         401
// RuntimeException (and subclasses)        Handler 3         409
// Any other Exception                      Handler 4         500
//
// UnauthorizedException IS-A RuntimeException (it extends it).
// Without Handler 2, it would fall to Handler 3 and return 409.
// Handler 2 intercepts it first because it is more specific.
// ─────────────────────────────────────────────────────────────────────────────

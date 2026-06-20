// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/exception/UnauthorizedException.java
//
// WHAT IS THIS?
//   A custom exception class. It extends RuntimeException which means:
//     1. It IS-A RuntimeException — GlobalExceptionHandler can catch it
//     2. It is unchecked — you don't need try-catch everywhere it's thrown
//     3. It carries a message — the string passed to super(message)
//
// WHY CREATE A CUSTOM EXCEPTION AT ALL?
//   Java's built-in RuntimeException is generic. It doesn't communicate
//   WHAT went wrong, only THAT something went wrong.
//   When GlobalExceptionHandler has multiple @ExceptionHandler methods,
//   it needs distinct exception types to route to the right handler.
//
//   Without this class:
//     All failures → RuntimeException → GlobalExceptionHandler → 409
//     (wrong for login — should be 401)
//
//   With this class:
//     Login failures → UnauthorizedException → dedicated handler → 401 ✅
//     Duplicate email → RuntimeException → existing handler → 409 ✅
//
// HOW CUSTOM EXCEPTIONS GROW IN REAL PROJECTS:
//   exception/
//   ├── GlobalExceptionHandler.java
//   ├── ErrorResponse.java
//   ├── UnauthorizedException.java     ← 401 — invalid credentials
//   ├── EmailAlreadyExistsException.java ← 409 — duplicate email (later)
//   ├── ResourceNotFoundException.java  ← 404 — topic/quiz not found (later)
//   └── ValidationException.java        ← 400 — custom business validation (later)
//   Each exception maps to exactly one HTTP status code. Clean. Precise.
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.exception;

// ─────────────────────────────────────────────────────────────────────────────
// extends RuntimeException
//   RuntimeException is the base class for all unchecked exceptions in Java.
//   "Unchecked" means you are NOT forced to declare it in a throws clause
//   or wrap every call in try-catch. It simply propagates up the call stack
//   until something catches it — in our case, GlobalExceptionHandler.
// ─────────────────────────────────────────────────────────────────────────────
public class UnauthorizedException extends RuntimeException {

    // ─────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    //
    // public UnauthorizedException(String message)
    //   Takes a message string and passes it to RuntimeException's
    //   constructor via super(message).
    //   This message is stored inside the exception and retrieved
    //   later with ex.getMessage() in GlobalExceptionHandler.
    //
    // Usage in AuthService:
    //   throw new UnauthorizedException("Invalid email or password");
    //
    // In GlobalExceptionHandler:
    //   ex.getMessage() → "Invalid email or password"
    //   → goes into the "error" field of ErrorResponse
    // ─────────────────────────────────────────────────────────────
    public UnauthorizedException(String message) {
        super(message);
    }

}

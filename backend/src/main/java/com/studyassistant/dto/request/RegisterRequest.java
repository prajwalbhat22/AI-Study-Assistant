// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/dto/request/RegisterRequest.java
//
// WHAT IS A DTO?
//   DTO = Data Transfer Object.
//   It is a simple Java class whose ONLY job is to carry data
//   between layers — like a form that the user fills out.
//   It is NOT saved to the database. It has no @Entity annotation.
//   It holds exactly what arrives from the outside world (the
//   Controller will pass this to AuthService later).
//
// WHY NOT JUST PASS THE User ENTITY DIRECTLY?
//   Your User entity has fields like `id` and `createdAt` that
//   the user never sends — those are set by the system.
//   If you passed a User object from outside, you'd have to
//   leave those fields null and hope nothing breaks. A DTO
//   contains ONLY what the caller should provide. Clean and safe.
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ─────────────────────────────────────────────────────────────────────────────
// @Getter / @Setter
//   Lombok generates getFullName(), getEmail(), getPassword(),
//   setFullName(...) etc. at compile time.
//   We use @Getter + @Setter separately instead of @Data because
//   DTOs don't need equals/hashCode/toString from @Data.
//
// @NoArgsConstructor
//   Generates: public RegisterRequest() {}
//   Required by Spring when it deserializes incoming JSON
//   into this object — it creates a blank instance first,
//   then sets each field. Without this, JSON parsing crashes.
//
// @AllArgsConstructor
//   Generates a constructor with all three fields.
//   Useful in tests: new RegisterRequest("Ravi", "r@t.com", "pass123")
// ─────────────────────────────────────────────────────────────────────────────
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    // ─────────────────────────────────────────────────────────────
    // @NotBlank  → cannot be null, empty, or only spaces
    // @Size      → must be between 2 and 100 characters
    // These run BEFORE AuthService is called — Spring rejects
    // the request early if these rules are violated.
    // ─────────────────────────────────────────────────────────────
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    // ─────────────────────────────────────────────────────────────
    // Password minimum 8 characters.
    // The @Size here validates the RAW password that arrives
    // from the user. After this, AuthService will hash it with
    // BCrypt before saving. The DB never stores the raw value.
    // ─────────────────────────────────────────────────────────────
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

}

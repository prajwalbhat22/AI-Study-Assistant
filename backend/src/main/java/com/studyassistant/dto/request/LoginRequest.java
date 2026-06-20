// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/dto/request/LoginRequest.java
//
// WHAT IS THIS?
//   The DTO that carries login credentials from the HTTP request body
//   into AuthService. It holds exactly two fields — email and password.
//   Nothing else. No id, no name. That's the principle of least data:
//   carry only what is needed for the task.
//
// WHY A SEPARATE DTO AND NOT REUSE RegisterRequest?
//   RegisterRequest has a fullName field that login doesn't need.
//   Using it for login would be misleading and confusing.
//   Each operation gets its own DTO — clean, explicit, maintainable.
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    // ─────────────────────────────────────────────────────────────
    // @NotBlank  → email cannot be null, empty, or just whitespace.
    //              Caught by @Valid in the Controller before
    //              AuthService is ever called.
    //
    // @Email     → validates format — must contain @ and a domain.
    //              "ravi@test.com" passes. "ravitestcom" fails.
    //              Spring returns 400 automatically if this fails.
    // ─────────────────────────────────────────────────────────────
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    // ─────────────────────────────────────────────────────────────
    // @NotBlank  → password cannot be empty.
    //
    // WHY NO @Size(min=8) HERE?
    //   During login, we don't validate password length.
    //   We just take whatever the user typed and check it against
    //   the stored BCrypt hash. Even if it's 2 characters, we let
    //   AuthService handle it — it simply won't match the hash.
    //   Adding @Size here would expose that "passwords must be ≥8 chars"
    //   which is minor information leakage. More importantly, it creates
    //   a confusing UX: the user typed their correct password but gets
    //   a 400 validation error instead of a 401 auth error.
    // ─────────────────────────────────────────────────────────────
    @NotBlank(message = "Password is required")
    private String password;

}

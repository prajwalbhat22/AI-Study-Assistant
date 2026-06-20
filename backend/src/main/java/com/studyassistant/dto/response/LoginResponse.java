// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/dto/response/LoginResponse.java
//
// WHAT IS THIS?
//   The DTO that carries login results back to the caller (Postman/React).
//   It defines EXACTLY what a successful login response looks like.
//
// WHY A DEDICATED RESPONSE DTO INSTEAD OF Map<String, Object>?
//   In AuthController's register endpoint, we used a raw Map.
//   That was fine for a quick start. But for reusable, production-quality
//   code, a dedicated DTO is better because:
//
//   1. TYPE SAFETY
//      Map<String, Object> accepts anything — you could accidentally
//      put ("userId", "hello") and Java won't complain.
//      LoginResponse.userId is Long — wrong types are caught at compile time.
//
//   2. DOCUMENTATION
//      When another developer (or future you) reads AuthService, the
//      return type LoginResponse immediately tells them what fields
//      a login response contains. A Map tells them nothing.
//
//   3. REUSABILITY
//      If ten different places in your code need to return login data,
//      they all use LoginResponse. Change the class once, all ten update.
//
//   4. JSON FIELD CONTROL
//      With @JsonProperty you can rename fields in JSON without
//      renaming your Java field. Useful for API versioning later.
//
// WHAT IT PRODUCES (example JSON):
//   {
//     "message":  "Login successful",
//     "userId":   1,
//     "fullName": "Ravi Kumar",
//     "email":    "ravi@test.com"
//   }
//
// NOTICE: No password field. No createdAt. Only what the frontend needs.
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ─────────────────────────────────────────────────────────────────────────────
// @Getter / @Setter
//   Lombok generates all getters and setters automatically.
//   Jackson (Spring's JSON library) uses getters to serialize
//   the object into JSON. Without getters, the JSON would be empty {}.
//
// @NoArgsConstructor
//   Generates: public LoginResponse() {}
//   Required by Jackson when deserializing JSON back into this object
//   (less common for responses, but good practice to always include).
//
// @AllArgsConstructor
//   Generates a constructor taking all four fields.
//   Used with @Builder — @Builder calls this internally.
//
// @Builder
//   Enables the fluent builder pattern in AuthService:
//     return LoginResponse.builder()
//         .message("Login successful")
//         .userId(user.getId())
//         .fullName(user.getFullName())
//         .email(user.getEmail())
//         .build();
//   Clean and readable. Especially useful as this class grows.
// ─────────────────────────────────────────────────────────────────────────────
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    // ─────────────────────────────────────────────────────────────
    // message: human-readable confirmation
    //   Displayed to the user or logged by the frontend.
    //   "Login successful" on success.
    //   (Error messages come from ErrorResponse, not here.)
    // ─────────────────────────────────────────────────────────────
    private String message;

    // ─────────────────────────────────────────────────────────────
    // userId: the user's database id
    //   The React frontend stores this to identify the logged-in
    //   user in subsequent API calls.
    //   Using Long to match the id field type in User.java.
    // ─────────────────────────────────────────────────────────────
    private Long userId;

    // ─────────────────────────────────────────────────────────────
    // fullName: used to personalise the UI
    //   React can display "Welcome back, Ravi!" immediately
    //   after login without making a separate API call.
    // ─────────────────────────────────────────────────────────────
    private String fullName;

    // ─────────────────────────────────────────────────────────────
    // email: echoed back for confirmation
    //   The frontend can show the logged-in email in the profile
    //   section or store it in local state.
    //
    // NOTE ON WHAT IS MISSING:
    //   password   → NEVER returned. Not even the hash. Ever.
    //   createdAt  → Not needed for login. Omit anything unused.
    //   token      → Will be added here when JWT is implemented.
    //                You'll simply add: private String token;
    // ─────────────────────────────────────────────────────────────
    private String email;
    // ─────────────────────────────────────────────────────────────
    // token: JWT returned after successful login
    //   The frontend stores this token and sends it in the
    //   Authorization header for future protected requests.
    // ─────────────────────────────────────────────────────────────
    private String token;

}

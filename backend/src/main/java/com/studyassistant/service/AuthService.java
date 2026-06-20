// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/service/AuthService.java
//
// WHAT CHANGED FROM THE PREVIOUS VERSION?
//   The registerUser() method is UNCHANGED — do not touch it.
//   We are only ADDING:
//     1. Two new imports  (LoginRequest, LoginResponse)
//     2. One new method   (loginUser)
//
//   This is the Open/Closed Principle in practice:
//   open for extension (add loginUser), closed for modification
//   (don't change the working registerUser method).
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.service;

import com.studyassistant.dto.request.LoginRequest;
import com.studyassistant.dto.request.RegisterRequest;
import com.studyassistant.dto.response.LoginResponse;
import com.studyassistant.exception.UnauthorizedException;
import com.studyassistant.model.User;
import com.studyassistant.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.studyassistant.security.JwtUtil;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                   PasswordEncoder passwordEncoder,
                   JwtUtil jwtUtil) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
}


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: registerUser  (UNCHANGED from previous step)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public User registerUser(RegisterRequest request) {

        log.info("Attempting to register user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed — email already exists: {}", request.getEmail());
            throw new RuntimeException("Email is already registered: " + request.getEmail());
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(hashedPassword)
                .build();

        User savedUser = userRepository.save(newUser);

        log.info("User registered successfully — id: {}, email: {}",
                savedUser.getId(), savedUser.getEmail());

        return savedUser;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: loginUser  (NEW)
    //
    // @Transactional(readOnly = true)
    //   This method only READS from the database — it never writes.
    //   readOnly = true tells Hibernate to skip "dirty checking"
    //   (the process of tracking changes to entities for updates).
    //   This makes read-only operations faster and safer.
    //   Always use readOnly=true on methods that only SELECT data.
    //
    // Return type: LoginResponse
    //   We return our dedicated response DTO, not the raw User entity.
    //   The raw User entity contains the password hash. We never want
    //   to accidentally pass that up to the Controller and beyond.
    //   LoginResponse contains only safe, UI-friendly fields.
    //
    // Parameter: LoginRequest request
    //   The DTO from the Controller carrying email and password.
    //   Already @Valid-checked before this method is called.
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public LoginResponse loginUser(LoginRequest request) {

        log.info("Login attempt for email: {}", request.getEmail());

        // ─────────────────────────────────────────────────────────
        // STEP 1: LOOK UP THE USER BY EMAIL
        //
        // userRepository.findByEmail(request.getEmail())
        //   Runs: SELECT * FROM users WHERE email = ?
        //   Returns Optional<User> — either contains a User or is empty.
        //
        // .orElseThrow(...)
        //   If the Optional is empty (no user found), immediately
        //   throw the exception inside the lambda.
        //   If the Optional has a value, unwrap it and assign to 'user'.
        //   This is cleaner than:
        //     Optional<User> opt = repo.findByEmail(email);
        //     if (opt.isEmpty()) { throw ...; }
        //     User user = opt.get();
        //
        // WHY "Invalid email or password" AND NOT "User not found"?
        //   SECURITY: never reveal which part of the credentials failed.
        //   If you say "User not found", attackers learn which emails
        //   are NOT registered. They can then focus brute-force attempts
        //   only on confirmed registered emails.
        //   Always use the same generic message for both failure cases.
        //
        // WHY RuntimeException AND NOT A CUSTOM EXCEPTION CLASS?
        //   We are using RuntimeException for now as a learning step.
        //   GlobalExceptionHandler catches it and returns 409.
        //   BUT — 409 Conflict is semantically wrong for a bad login.
        //   The correct code is 401 Unauthorized.
        //   We fix this immediately below by creating a small custom
        //   exception class. See the comment at the bottom of this file.
        //
        //   For now the flow works — we will refine the status code next.
        // ─────────────────────────────────────────────────────────
        User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));


        // ─────────────────────────────────────────────────────────
        // STEP 2: VERIFY THE PASSWORD
        //
        // passwordEncoder.matches(rawPassword, storedHash)
        //   This is BCrypt's comparison method.
        //   It takes:
        //     rawPassword  → what the user just typed: "mypassword123"
        //     storedHash   → what is in the database: "$2a$10$xyz..."
        //
        //   Internally BCrypt extracts the salt from the stored hash,
        //   applies the same hashing algorithm to the raw password
        //   using that salt, and compares the result to the stored hash.
        //   If they match → true. If not → false.
        //
        //   This is the ONLY correct way to compare BCrypt passwords.
        //   You cannot do: user.getPassword().equals(request.getPassword())
        //   because the stored value is a hash, not the original text.
        //
        // !passwordEncoder.matches(...)
        //   The ! means "if they do NOT match" → wrong password.
        //
        // Same generic error message as step 1 — for the same
        // security reason explained above.
        // ─────────────────────────────────────────────────────────
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed — incorrect password for email: {}",
                     request.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }


        // ─────────────────────────────────────────────────────────
        // STEP 3: BUILD AND RETURN THE LOGIN RESPONSE
        //
        // We reach here only if BOTH checks passed:
        //   ✅ Email exists in the database
        //   ✅ Password matches the stored hash
        //
        // LoginResponse.builder()
        //   Uses Lombok's @Builder pattern to construct the response.
        //   We cherry-pick only the safe fields from the User entity.
        //   user.getPassword() is deliberately never referenced here.
        //
        // log.info() confirms the successful login in the terminal.
        // ─────────────────────────────────────────────────────────
        log.info("Login successful for userId: {}, email: {}",
                 user.getId(), user.getEmail());
        
        String token = jwtUtil.generateToken(user.getEmail());

        return LoginResponse.builder()
                .message("Login successful")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .token(token)
                .build();
    }

}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT NOTE: GETTING THE RIGHT HTTP STATUS CODE (401 vs 409)
//
// Right now, RuntimeException → GlobalExceptionHandler → 409 Conflict.
// But a failed login should return 401 Unauthorized, not 409.
//
// The cleanest fix is one small custom exception class.
// Create this file:
//
//   src/main/java/com/studyassistant/exception/UnauthorizedException.java
//
//   package com.studyassistant.exception;
//   public class UnauthorizedException extends RuntimeException {
//       public UnauthorizedException(String message) {
//           super(message);
//       }
//   }
//
// Then in GlobalExceptionHandler, add a new handler ABOVE handleRuntimeException:
//
//   @ExceptionHandler(UnauthorizedException.class)
//   public ResponseEntity<ErrorResponse> handleUnauthorized(
//           UnauthorizedException ex, HttpServletRequest request) {
//       ErrorResponse err = new ErrorResponse(
//           HttpStatus.UNAUTHORIZED.value(),   // 401
//           ex.getMessage(),
//           request.getRequestURI()
//       );
//       return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
//   }
//
// Then replace both:
//   throw new RuntimeException("Invalid email or password");
// with:
//   throw new UnauthorizedException("Invalid email or password");
//
// This is exactly how real Spring Boot projects grow — start simple,
// then extract a clean custom exception as needed.
// ─────────────────────────────────────────────────────────────────────────────

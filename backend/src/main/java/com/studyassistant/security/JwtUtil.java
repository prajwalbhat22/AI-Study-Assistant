// ─────────────────────────────────────────────────────────────────────────────
// FILE LOCATION:
//   src/main/java/com/studyassistant/security/JwtUtil.java
//
// WHAT IS THIS FILE?
//   JwtUtil is a Spring @Component (a helper bean) that contains every
//   JWT operation your application needs in one place:
//
//     1. generateToken(email)        → create a signed JWT string
//     2. extractEmail(token)         → read the email out of a token
//     3. isTokenExpired(token)       → has the token passed its expiry time?
//     4. isTokenValid(token, email)  → is this token genuine and for this user?
//
//   No other class needs to know how JWT works internally.
//   AuthService calls generateToken(). JwtFilter (built later) calls
//   isTokenValid(). Everything else is an implementation detail hidden here.
//
// THE JJWT LIBRARY (io.jsonwebtoken)
//   JJWT is the most widely used JWT library for Java. It provides:
//     - Jwts.builder()   → fluent API to construct and sign a token
//     - Jwts.parserBuilder() → fluent API to verify and parse a token
//     - Keys              → helper to build cryptographic keys from strings
//     - SignatureAlgorithm → enum of supported algorithms (HS256, RS256…)
//   Version 0.11.5 is stable and well-documented. Version 0.12.x changes
//   the API slightly — stick with 0.11.5 while learning.
// ─────────────────────────────────────────────────────────────────────────────

package com.studyassistant.security;

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS EXPLAINED — every single one
//
// io.jsonwebtoken.Claims
//   The "payload" part of the JWT. After parsing a token, you get a
//   Claims object from which you can read any field:
//     claims.getSubject()     → the email we stored in "sub"
//     claims.getExpiration()  → the Date this token expires
//     claims.getIssuedAt()    → the Date this token was created
//
// io.jsonwebtoken.Jwts
//   The main entry point of the JJWT library.
//   Jwts.builder()        → start constructing a new token
//   Jwts.parserBuilder()  → start parsing/verifying an existing token
//
// io.jsonwebtoken.SignatureAlgorithm
//   Enum of algorithms for signing the token.
//   We use HS256 (HMAC with SHA-256) — the most common for REST APIs.
//   HS256 uses a SYMMETRIC key: same key to sign AND verify.
//   (RS256 uses asymmetric keys — too complex for this stage.)
//
// io.jsonwebtoken.security.Keys
//   A utility class that creates a proper cryptographic Key object
//   from a plain byte array. We need this because JJWT 0.11.5 requires
//   a Key object, not a raw string, for signing.
//
// org.springframework.beans.factory.annotation.Value
//   Injects a value from application.properties into a Java field.
//   @Value("${jwt.secret}") reads the key "jwt.secret" from the file.
//   This is how Spring externalises configuration — no hardcoded values.
//
// org.springframework.stereotype.Component
//   Registers this class as a Spring-managed bean, just like @Service
//   or @Repository. @Component is the generic version — it doesn't
//   imply a specific layer role, just "manage this as a bean."
//   Use @Component for utility/helper classes that don't fit
//   @Service (business logic) or @Repository (database access).
//
// java.security.Key
//   The Java standard interface for cryptographic keys.
//   JJWT's signing and parsing methods accept Key, not a raw String.
//
// java.util.Date
//   Used for token issue time and expiry time.
//   JJWT uses java.util.Date (not the newer LocalDateTime) for its
//   setExpiration() and setIssuedAt() methods. We work with it here
//   and can convert to LocalDateTime elsewhere if needed.
//
// java.util.function.Function
//   A functional interface: takes one input, returns one output.
//   Used in extractClaim() to pass any getter method as a parameter.
//   e.g. Function<Claims, String> extracts Subject
//        Function<Claims, Date>   extracts Expiration
//   This lets us write ONE generic extraction method instead of one
//   method per field we want to read from the Claims object.
// ─────────────────────────────────────────────────────────────────────────────

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;


// ─────────────────────────────────────────────────────────────────────────────
// @Component
//   Tells Spring: "Create one instance of JwtUtil at startup and keep
//   it in the Application Context." When AuthService (updated later)
//   or JwtFilter needs a JwtUtil, Spring injects this same instance.
//   You never write: new JwtUtil() — Spring handles instantiation.
// ─────────────────────────────────────────────────────────────────────────────
@Component
public class JwtUtil {


    // ─────────────────────────────────────────────────────────────────────────
    // FIELD: secretKey (the signing key)
    //
    // @Value("${jwt.secret}")
    //   Reads the value of "jwt.secret" from application.properties.
    //   At startup, Spring replaces this annotation with the actual string:
    //   "StudyAssistantSuperSecretKeyForJWTSigning2024PleaseChangeThis"
    //   If the key is missing from application.properties, Spring fails
    //   to start with a clear error. No silent failures.
    //
    // Why not hardcode the secret here?
    //   1. SECURITY  — hardcoded secrets get committed to GitHub accidentally
    //   2. FLEXIBILITY — in production, use an env variable or secrets manager
    //                    without changing any Java code
    //   3. BEST PRACTICE — configuration belongs in config files, not code
    //
    // Why private String and not directly a Key?
    //   @Value injects a String. We convert it to a Key object in
    //   getSigningKey() below. Keeping them separate is cleaner.
    // ─────────────────────────────────────────────────────────────────────────
    @Value("${jwt.secret}")
    private String secretKey;


    // ─────────────────────────────────────────────────────────────────────────
    // FIELD: jwtExpiration (token lifetime in milliseconds)
    //
    // @Value("${jwt.expiration}")
    //   Reads "jwt.expiration" from application.properties.
    //   Value: 86400000 (milliseconds) = 60 × 60 × 24 × 1000 = 24 hours.
    //
    // Why long and not int?
    //   86400000 fits in an int (max ~2.1 billion), but using long
    //   is safer — if you ever set expiration to 30 days (2592000000),
    //   it overflows int silently. long handles it correctly.
    // ─────────────────────────────────────────────────────────────────────────
    @Value("${jwt.expiration}")
    private long jwtExpiration;


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: generateToken
    //
    // PURPOSE:
    //   Creates a new signed JWT token for a given email address.
    //   Called by AuthService after a successful login.
    //
    // PARAMETER: String email
    //   The logged-in user's email. This becomes the "subject" (sub)
    //   of the token — the primary identifier.
    //   Why email and not userId? Email is human-readable and easy to
    //   look up. You can switch to userId later if preferred.
    //
    // RETURN: String
    //   The complete JWT string, ready to send to the client.
    //   Format: xxxxx.yyyyy.zzzzz
    //   (header.payload.signature — all Base64url-encoded)
    //
    // JJWT BUILDER — line by line:
    //
    //   Jwts.builder()
    //     Starts a new JwtBuilder. Fluent API — each method call
    //     returns the builder itself, so you can chain calls.
    //
    //   .setSubject(email)
    //     Sets the "sub" (subject) claim in the payload.
    //     The subject is the identity this token represents.
    //     Standard JWT convention: sub = who the token is about.
    //
    //   .setIssuedAt(new Date(System.currentTimeMillis()))
    //     Sets the "iat" (issued at) claim.
    //     System.currentTimeMillis() = right now in milliseconds.
    //     new Date(...) wraps it as a java.util.Date.
    //     Records WHEN this token was created.
    //
    //   .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
    //     Sets the "exp" (expiration) claim.
    //     Current time + 86400000ms = 24 hours from now.
    //     After this time, the token is rejected automatically by
    //     JJWT's parser — you don't need to check it manually.
    //
    //   .signWith(getSigningKey(), SignatureAlgorithm.HS256)
    //     Signs the token using your secret key and the HS256 algorithm.
    //     This is what prevents tampering. Without the correct key,
    //     no one can produce a signature that your server will accept.
    //     SignatureAlgorithm.HS256 = HMAC-SHA256.
    //
    //   .compact()
    //     Finalises the builder and returns the complete JWT string.
    //     Without .compact(), nothing is built — it's the "build()" call.
    // ─────────────────────────────────────────────────────────────────────────
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: extractEmail
    //
    // PURPOSE:
    //   Reads the email address (stored in the "sub" claim) from a token.
    //   Called by JwtFilter (built in the next step) on every protected
    //   request to identify which user is making the call.
    //
    // HOW IT WORKS:
    //   Delegates to extractClaim() — the generic extraction method below.
    //   Claims::getSubject is a method reference:
    //     Function<Claims, String> that calls claims.getSubject()
    //   This returns whatever string was set in .setSubject() during
    //   token generation — which is the user's email.
    // ─────────────────────────────────────────────────────────────────────────
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: extractExpiration
    //
    // PURPOSE:
    //   Reads the expiration Date from a token.
    //   Used by isTokenExpired() below.
    //   private because nothing outside JwtUtil needs to call this directly.
    //
    // Claims::getExpiration
    //   Method reference for claims.getExpiration() → returns a Date.
    // ─────────────────────────────────────────────────────────────────────────
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: extractClaim  (generic utility)
    //
    // PURPOSE:
    //   A single method that can extract ANY field from the JWT payload.
    //   Without this, you'd need a separate method for every claim field:
    //     extractSubject(), extractExpiration(), extractIssuedAt()...
    //   With this one generic method, all three become one-liners.
    //
    // SIGNATURE EXPLAINED:
    //   public <T> T extractClaim(String token, Function<Claims, T> claimsResolver)
    //
    //   <T>                   → generic type parameter. T can be String,
    //                           Date, or any other type.
    //   T                     → the return type (whatever T resolves to)
    //   Function<Claims, T>   → a function that takes Claims, returns T
    //   claimsResolver        → the specific getter to call on Claims
    //
    // HOW IT WORKS:
    //   1. extractAllClaims(token) parses and verifies the token,
    //      returning the full Claims object (the payload).
    //   2. claimsResolver.apply(claims) calls the specific getter
    //      you passed in — e.g. Claims::getSubject.
    //   3. Returns the result of that getter.
    //
    // EXAMPLE CALLS:
    //   extractClaim(token, Claims::getSubject)    → returns String (email)
    //   extractClaim(token, Claims::getExpiration) → returns Date
    //   extractClaim(token, Claims::getIssuedAt)   → returns Date
    // ─────────────────────────────────────────────────────────────────────────
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: extractAllClaims  (core parsing and verification)
    //
    // PURPOSE:
    //   Parses the token string, VERIFIES the signature, and returns
    //   the entire Claims (payload) object.
    //   This is the most important method internally — all extraction
    //   methods call this.
    //
    // WHY private?
    //   The raw Claims object is an internal detail. Outside callers
    //   should use extractEmail(), isTokenValid() etc. — not poke
    //   around in Claims directly.
    //
    // JJWT PARSER — line by line:
    //
    //   Jwts.parserBuilder()
    //     Starts a new JWT parser. Fluent API, just like the builder.
    //
    //   .setSigningKey(getSigningKey())
    //     Provides the key to verify the signature with.
    //     JJWT checks: does the signature in the token match what
    //     this key would produce for this header+payload?
    //     If yes → token is genuine and unmodified.
    //     If no  → throws JwtException (caught by JwtFilter later).
    //
    //   .build()
    //     Builds the parser with the key configured above.
    //
    //   .parseClaimsJws(token)
    //     Parses the token string. This single call does THREE things:
    //       1. Decodes the Base64url parts
    //       2. Verifies the signature (throws if invalid)
    //       3. Checks the expiration date (throws ExpiredJwtException if past)
    //     Returns a Jws<Claims> — a wrapper around the verified Claims.
    //
    //   .getBody()
    //     Extracts the Claims object from the Jws wrapper.
    //     This is the actual payload: sub, iat, exp, and any custom claims.
    //
    // WHAT IF THE TOKEN IS INVALID?
    //   JJWT throws:
    //     ExpiredJwtException     → token is past its expiry date
    //     MalformedJwtException   → token string is not valid JWT format
    //     SignatureException      → signature doesn't match (tampered)
    //     UnsupportedJwtException → token type not supported
    //   JwtFilter (next step) will catch these and return 401.
    // ─────────────────────────────────────────────────────────────────────────
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: isTokenExpired
    //
    // PURPOSE:
    //   Checks if a token's expiration date is in the past.
    //   Returns true if expired (token should be rejected).
    //   Returns false if still valid (token can be used).
    //
    // extractExpiration(token).before(new Date())
    //   extractExpiration → gets the Date stored in the "exp" claim
    //   .before(new Date()) → is that Date before RIGHT NOW?
    //   If the expiry date is before now → the token has expired → true.
    //   If the expiry date is after now  → the token is still valid → false.
    //
    // NOTE: JJWT's parseClaimsJws() already throws ExpiredJwtException
    //   before this method can even run if the token is expired during parsing.
    //   This method is an additional explicit check used inside isTokenValid()
    //   for clarity and safety.
    // ─────────────────────────────────────────────────────────────────────────
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: isTokenValid
    //
    // PURPOSE:
    //   The single method JwtFilter will call on every protected request.
    //   It answers: "Is this token genuine, unexpired, and for this user?"
    //   Returns true only if ALL three conditions are met.
    //
    // PARAMETERS:
    //   token → the JWT string from the Authorization header
    //   email → the email of the user we're authenticating
    //           (JwtFilter extracts this from the token first,
    //            loads the user from DB, then calls isTokenValid
    //            with both the token and the user's stored email)
    //
    // THE TWO CHECKS:
    //
    //   1. extractEmail(token).equals(email)
    //      The email stored in the token's "sub" claim must match
    //      the email of the user we loaded from the database.
    //      This prevents one user's token from being used as another.
    //
    //   2. !isTokenExpired(token)
    //      The token must not have passed its expiration time.
    //      The ! means "NOT expired" — we want it to still be valid.
    //
    //   Both must be true (&&) for the method to return true.
    //   If either fails → returns false → JwtFilter returns 401.
    // ─────────────────────────────────────────────────────────────────────────
    public boolean isTokenValid(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(email) && !isTokenExpired(token));
    }


    // ─────────────────────────────────────────────────────────────────────────
    // METHOD: getSigningKey  (private helper)
    //
    // PURPOSE:
    //   Converts the plain String secret from application.properties
    //   into a cryptographic Key object that JJWT can use.
    //   Called by generateToken() and extractAllClaims().
    //
    // WHY IS THIS NEEDED?
    //   JJWT 0.11.5 does not accept a raw String for signing.
    //   It requires a java.security.Key object for type safety and to
    //   enforce minimum key length requirements for each algorithm.
    //   For HS256, the key must be at least 256 bits (32 bytes).
    //   If your secret string is too short, JJWT throws WeakKeyException
    //   at startup — a helpful fail-fast mechanism.
    //
    // HOW IT WORKS:
    //
    //   secretKey.getBytes()
    //     Converts the String "StudyAssistant..." to a byte array.
    //     This is the raw key material.
    //
    //   Keys.hmacShaKeyFor(bytes)
    //     Takes the byte array and creates an HmacKey suitable for
    //     HMAC-SHA signing algorithms (HS256, HS384, HS512).
    //     Returns a javax.crypto.SecretKey (which implements Key).
    //
    // WHY private?
    //   This is an implementation detail. Nothing outside JwtUtil
    //   should ever handle the raw cryptographic key.
    //   Encapsulation keeps the key safely inside this class.
    // ─────────────────────────────────────────────────────────────────────────
    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
// ─────────────────────────────────────────────────────────────────────────────
// WHAT EACH PUBLIC METHOD IS USED FOR — UPCOMING STEPS
//
// generateToken(email)
//   Called in:   AuthService.loginUser()    (next step)
//   Purpose:     Create a token after successful login, add it to
//                LoginResponse so the client can store and send it.
//
// extractEmail(token)
//   Called in:   JwtFilter.doFilterInternal()  (step after next)
//   Purpose:     On every protected request, read who the token
//                belongs to, then load that user from the database.
//
// isTokenValid(token, email)
//   Called in:   JwtFilter.doFilterInternal()  (step after next)
//   Purpose:     Final gate check before allowing the request through.
//                If false → respond with 401 immediately.
//
// extractClaim(token, resolver)
//   Could be called anywhere that needs a custom claim field.
//   Available as public for future extensibility.
// ─────────────────────────────────────────────────────────────────────────────

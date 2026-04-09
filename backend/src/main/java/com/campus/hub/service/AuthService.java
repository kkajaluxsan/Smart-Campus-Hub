package com.campus.hub.service;

import com.campus.hub.dto.AuthResponse;
import com.campus.hub.dto.GoogleLoginRequest;
import com.campus.hub.dto.GoogleUserInfo;
import com.campus.hub.dto.LoginRequest;
import com.campus.hub.dto.RegisterPendingResponse;
import com.campus.hub.dto.RegisterRequest;
import com.campus.hub.dto.ResendVerificationRequest;
import com.campus.hub.dto.UpdateStudentProfileRequest;
import com.campus.hub.dto.UserProfileDto;
import com.campus.hub.dto.VerifyEmailResponse;
import com.campus.hub.exception.ApiException;
import com.campus.hub.model.AuthProvider;
import com.campus.hub.model.Role;
import com.campus.hub.model.User;
import com.campus.hub.repository.UserRepository;
import com.campus.hub.security.JwtTokenProvider;
import com.campus.hub.util.TokenHashUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int VERIFICATION_HOURS = 48;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleOAuthService googleOAuthService;
    private final VerificationEmailService verificationEmailService;

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public RegisterPendingResponse register(RegisterRequest req) {
        String email = normalizeEmail(req.email());
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (userRepository.existsByStudentIndexNumber(req.studentIndexNumber().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "This index number is already registered");
        }
        User u = User.builder()
                .email(email)
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .role(Role.USER)
                .authProvider(AuthProvider.LOCAL)
                .emailVerified(false)
                .studentIndexNumber(req.studentIndexNumber().trim())
                .academicYear(req.academicYear())
                .semester(req.semester())
                .department(req.department())
                .build();
        String plainToken = TokenHashUtils.randomVerificationToken();
        u.setEmailVerificationTokenHash(TokenHashUtils.sha256Hex(plainToken));
        u.setEmailVerificationExpiresAt(Instant.now().plus(VERIFICATION_HOURS, ChronoUnit.HOURS));
        userRepository.save(u);
        verificationEmailService.sendVerificationEmail(u, plainToken);
        return new RegisterPendingResponse(
                "We sent a verification link to your email. Please confirm before signing in.",
                email
        );
    }

    @Transactional
    public VerifyEmailResponse verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Missing verification token");
        }
        String hash = TokenHashUtils.sha256Hex(token);
        User u = userRepository.findByEmailVerificationTokenHash(hash)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid verification link"));
        if (u.getEmailVerificationExpiresAt() == null || u.getEmailVerificationExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "This verification link has expired. Sign in and request a new verification email.");
        }
        u.setEmailVerified(true);
        u.setEmailVerificationTokenHash(null);
        u.setEmailVerificationExpiresAt(null);
        userRepository.save(u);
        return new VerifyEmailResponse("Your email is verified. You can sign in now.", u.getEmail());
    }

    @Transactional
    public void resendVerification(ResendVerificationRequest req) {
        String email = normalizeEmail(req.email());
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (u.getPassword() == null || !passwordEncoder.matches(req.password(), u.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (u.getAuthProvider() != AuthProvider.LOCAL) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This account does not use email verification");
        }
        if (u.isEmailVerified()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is already verified");
        }
        String plainToken = TokenHashUtils.randomVerificationToken();
        u.setEmailVerificationTokenHash(TokenHashUtils.sha256Hex(plainToken));
        u.setEmailVerificationExpiresAt(Instant.now().plus(VERIFICATION_HOURS, ChronoUnit.HOURS));
        userRepository.save(u);
        verificationEmailService.sendVerificationEmail(u, plainToken);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = normalizeEmail(req.email());
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (u.getPassword() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "This account uses Google sign-in");
        }
        if (!passwordEncoder.matches(req.password(), u.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (u.getAuthProvider() == AuthProvider.LOCAL && !u.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Please verify your email before signing in. Check your inbox or use \"Resend verification\".");
        }
        String token = jwtTokenProvider.createToken(u.getEmail(), u.getId(), u.getRole());
        return UserProfileMapper.toAuthResponse(u, token);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest req) {
        GoogleUserInfo info = googleOAuthService.verify(req.credential());
        if (!info.emailVerified()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google email must be verified");
        }
        String email = normalizeEmail(info.email());
        Optional<User> bySub = userRepository.findByOauthSubject(info.subject());
        if (bySub.isPresent()) {
            return issueToken(bySub.get());
        }
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User u = byEmail.get();
            if (u.getAuthProvider() == AuthProvider.LOCAL) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "This email is already registered with a password. Sign in with email and password.");
            }
            if (u.getOauthSubject() == null) {
                u.setOauthSubject(info.subject());
                userRepository.save(u);
            }
            return issueToken(u);
        }
        if (!hasCompleteStudentRegistration(req)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "To register with Google, provide your full name, index number, year, semester, and department "
                            + "(use the Register tab, fill the form, then continue with Google).");
        }
        String idx = req.studentIndexNumber().trim();
        if (idx.length() < 3 || idx.length() > 64) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Index number must be between 3 and 64 characters");
        }
        if (userRepository.existsByStudentIndexNumber(idx)) {
            throw new ApiException(HttpStatus.CONFLICT, "This index number is already registered");
        }
        int year = req.academicYear();
        int sem = req.semester();
        if (year < 1 || year > 4 || sem < 1 || sem > 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid academic year or semester");
        }
        String displayName = (req.fullName() != null && !req.fullName().isBlank())
                ? req.fullName().trim()
                : info.fullName();
        if (displayName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Full name is required");
        }
        User u = User.builder()
                .email(email)
                .password(null)
                .fullName(displayName)
                .role(Role.USER)
                .authProvider(AuthProvider.GOOGLE)
                .oauthSubject(info.subject())
                .emailVerified(true)
                .studentIndexNumber(idx)
                .academicYear(year)
                .semester(sem)
                .department(req.department())
                .build();
        userRepository.save(u);
        return issueToken(u);
    }

    private static boolean hasCompleteStudentRegistration(GoogleLoginRequest req) {
        return req.fullName() != null && !req.fullName().isBlank()
                && req.studentIndexNumber() != null && !req.studentIndexNumber().isBlank()
                && req.academicYear() != null
                && req.semester() != null
                && req.department() != null;
    }

    private AuthResponse issueToken(User u) {
        String token = jwtTokenProvider.createToken(u.getEmail(), u.getId(), u.getRole());
        return UserProfileMapper.toAuthResponse(u, token);
    }

    @Transactional
    public UserProfileDto updateStudentProfile(User current, UpdateStudentProfileRequest req) {
        if (current.getRole() != Role.USER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Student profile applies to student accounts only");
        }
        boolean any = req.studentIndexNumber() != null || req.academicYear() != null
                || req.semester() != null || req.department() != null;
        if (!any) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No fields to update");
        }
        if (req.studentIndexNumber() == null || req.academicYear() == null
                || req.semester() == null || req.department() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Provide index number, academic year, semester, and department together");
        }
        String idx = req.studentIndexNumber().trim();
        if (userRepository.existsByStudentIndexNumberAndIdNot(idx, current.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "This index number is already registered");
        }
        current.setStudentIndexNumber(idx);
        current.setAcademicYear(req.academicYear());
        current.setSemester(req.semester());
        current.setDepartment(req.department());
        userRepository.save(current);
        return UserProfileMapper.toProfileDto(current);
    }

    @Transactional(readOnly = true)
    public UserProfileDto currentProfile(User user) {
        return UserProfileMapper.toProfileDto(user);
    }
}

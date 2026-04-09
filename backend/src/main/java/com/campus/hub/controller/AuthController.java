package com.campus.hub.controller;

import com.campus.hub.dto.AuthResponse;
import com.campus.hub.dto.GoogleLoginRequest;
import com.campus.hub.dto.LoginRequest;
import com.campus.hub.dto.RegisterPendingResponse;
import com.campus.hub.dto.RegisterRequest;
import com.campus.hub.dto.ResendVerificationRequest;
import com.campus.hub.dto.UpdateStudentProfileRequest;
import com.campus.hub.dto.UserProfileDto;
import com.campus.hub.dto.VerifyEmailResponse;
import com.campus.hub.service.AuthService;
import com.campus.hub.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterPendingResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @GetMapping("/verify-email")
    public VerifyEmailResponse verifyEmail(@RequestParam String token) {
        return authService.verifyEmail(token);
    }

    @PostMapping("/resend-verification")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resendVerification(@Valid @RequestBody ResendVerificationRequest req) {
        authService.resendVerification(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleLoginRequest req) {
        return authService.loginWithGoogle(req);
    }

    @PatchMapping("/profile")
    public UserProfileDto updateProfile(@Valid @RequestBody UpdateStudentProfileRequest req) {
        return authService.updateStudentProfile(currentUserService.requireCurrentUser(), req);
    }

    @GetMapping("/me")
    public UserProfileDto me() {
        return authService.currentProfile(currentUserService.requireCurrentUser());
    }
}

package com.campus.hub.controller;

import com.campus.hub.dto.AuthResponse;
import com.campus.hub.dto.LoginRequest;
import com.campus.hub.dto.RegisterRequest;
import com.campus.hub.dto.UserProfileDto;
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
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UserProfileDto me() {
        return authService.currentProfile(currentUserService.requireCurrentUser());
    }
}

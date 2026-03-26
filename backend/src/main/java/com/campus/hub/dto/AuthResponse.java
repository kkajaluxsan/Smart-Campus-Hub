package com.campus.hub.dto;

import com.campus.hub.model.Role;

public record AuthResponse(
        String token,
        Long userId,
        String email,
        String fullName,
        Role role
) {}

package com.campus.hub.dto;

import com.campus.hub.model.Role;

public record UserProfileDto(
        Long userId,
        String email,
        String fullName,
        Role role,
        String studentIndexNumber,
        Integer academicYear,
        Integer semester,
        String department,
        String authProvider,
        boolean emailVerified
) {}

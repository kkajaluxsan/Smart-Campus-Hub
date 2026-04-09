package com.campus.hub.service;

import com.campus.hub.dto.AuthResponse;
import com.campus.hub.dto.UserProfileDto;
import com.campus.hub.model.User;

public final class UserProfileMapper {

    private UserProfileMapper() {}

    public static AuthResponse toAuthResponse(User u, String token) {
        return new AuthResponse(
                token,
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getRole(),
                u.getStudentIndexNumber(),
                u.getAcademicYear(),
                u.getSemester(),
                u.getDepartment() != null ? u.getDepartment().name() : null,
                u.getAuthProvider() != null ? u.getAuthProvider().name() : "LOCAL",
                u.isEmailVerified()
        );
    }

    public static UserProfileDto toProfileDto(User u) {
        return new UserProfileDto(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getRole(),
                u.getStudentIndexNumber(),
                u.getAcademicYear(),
                u.getSemester(),
                u.getDepartment() != null ? u.getDepartment().name() : null,
                u.getAuthProvider() != null ? u.getAuthProvider().name() : "LOCAL",
                u.isEmailVerified()
        );
    }
}

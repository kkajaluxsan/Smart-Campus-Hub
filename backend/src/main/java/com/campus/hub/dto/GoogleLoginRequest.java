package com.campus.hub.dto;

import com.campus.hub.model.Department;
import jakarta.validation.constraints.NotBlank;

/**
 * Login: send only {@code credential}. Register (new Google user): send credential plus student fields.
 */
public record GoogleLoginRequest(
        @NotBlank String credential,
        String fullName,
        String studentIndexNumber,
        Integer academicYear,
        Integer semester,
        Department department
) {}

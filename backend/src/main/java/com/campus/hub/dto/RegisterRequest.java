package com.campus.hub.dto;

import com.campus.hub.model.Department;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank
        @Email(message = "Must be a valid email address")
        @Pattern(
                regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$",
                message = "Email format is invalid"
        )
        @Size(max = 254)
        String email,
        @NotBlank @Size(min = 6, max = 100) String password,
        @NotBlank @Size(max = 200) String fullName,
        @NotBlank @Size(min = 3, max = 64) String studentIndexNumber,
        @NotNull @Min(1) @Max(4) Integer academicYear,
        @NotNull @Min(1) @Max(2) Integer semester,
        @NotNull Department department
) {}

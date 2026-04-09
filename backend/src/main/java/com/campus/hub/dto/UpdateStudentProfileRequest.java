package com.campus.hub.dto;

import com.campus.hub.model.Department;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateStudentProfileRequest(
        @Size(min = 3, max = 64) String studentIndexNumber,
        @Min(1) @Max(4) Integer academicYear,
        @Min(1) @Max(2) Integer semester,
        Department department
) {}

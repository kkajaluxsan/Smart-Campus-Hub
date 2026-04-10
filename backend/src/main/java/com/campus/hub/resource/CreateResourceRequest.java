package com.campus.hub.resource;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateResourceRequest(
        @NotBlank String name,
        @NotNull ResourceType type,
        @PositiveOrZero Integer capacity,
        @NotBlank String location,
        @NotNull ResourceStatus status
) {}

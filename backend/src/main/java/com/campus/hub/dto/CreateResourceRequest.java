package com.campus.hub.dto;

import com.campus.hub.model.ResourceStatus;
import com.campus.hub.model.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateResourceRequest(
        @NotBlank String name,
        @NotNull ResourceType type,
        Integer capacity,
        @NotBlank String location,
        @NotNull ResourceStatus status
) {}

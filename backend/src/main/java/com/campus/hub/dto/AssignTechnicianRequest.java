package com.campus.hub.dto;

import jakarta.validation.constraints.NotNull;

public record AssignTechnicianRequest(
        @NotNull Long technicianId
) {}

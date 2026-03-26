package com.campus.hub.dto;

import jakarta.validation.constraints.Size;

public record BookingDecisionRequest(
        @Size(max = 1000) String reason
) {}

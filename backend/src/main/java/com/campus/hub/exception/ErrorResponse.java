package com.campus.hub.exception;

import lombok.Builder;

import java.time.Instant;

@Builder
public record ErrorResponse(
        Instant timestamp,
        int status,
        String message
) {}

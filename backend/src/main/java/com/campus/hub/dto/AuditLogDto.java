package com.campus.hub.dto;

import java.time.Instant;

public record AuditLogDto(
        Long id,
        Long userId,
        String userEmail,
        String action,
        String entityType,
        Long entityId,
        String details,
        Instant createdAt
) {}

package com.campus.hub.dto;

import com.campus.hub.model.NotificationType;

import java.time.Instant;

public record NotificationDto(
        Long id,
        String message,
        NotificationType type,
        boolean read,
        Instant createdAt,
        String referenceType,
        Long referenceId
) {}

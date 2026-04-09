package com.campus.hub.dto;

import java.time.Instant;

public record AttachmentDto(
        Long id,
        String originalFilename,
        String contentType,
        long sizeBytes,
        Instant uploadedAt,
        String downloadUrl
) {}

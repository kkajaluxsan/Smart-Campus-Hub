package com.campus.hub.dto;

import java.time.Instant;

public record CommentDto(
        Long id,
        Long userId,
        String userEmail,
        String content,
        Instant createdAt,
        Instant updatedAt
) {}

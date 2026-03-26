package com.campus.hub.dto;

import com.campus.hub.model.TicketPriority;
import com.campus.hub.model.TicketStatus;

import java.time.Instant;
import java.util.List;

public record TicketDto(
        Long id,
        Long resourceId,
        String resourceName,
        Long createdById,
        String createdByEmail,
        Long assignedTechnicianId,
        String assignedTechnicianEmail,
        String description,
        TicketPriority priority,
        TicketStatus status,
        Instant createdAt,
        Instant updatedAt,
        List<CommentDto> comments,
        List<AttachmentDto> attachments
) {}

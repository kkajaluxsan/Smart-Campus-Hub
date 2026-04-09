package com.campus.hub.dto;

import com.campus.hub.model.BookingStatus;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record BookingDto(
        Long id,
        Long userId,
        String userEmail,
        Long resourceId,
        String resourceName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String purpose,
        Integer attendees,
        BookingStatus status,
        String adminReason,
        Instant createdAt,
        List<String> seatLabels,
        String requesterStudentIndexNumber,
        String requesterDepartment
) {}

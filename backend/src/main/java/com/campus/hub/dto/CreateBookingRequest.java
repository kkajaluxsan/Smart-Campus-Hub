package com.campus.hub.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public record CreateBookingRequest(
        @NotNull Long resourceId,
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime,
        String purpose,
        Integer attendees,
        @Size(max = 50) List<Long> seatIds,
        /** NONE, WEEKLY, or BIWEEKLY — omit or NONE for a single booking */
        String recurrence,
        /** Total occurrences including the first (2–26 when recurring) */
        Integer recurrenceOccurrences
) {}

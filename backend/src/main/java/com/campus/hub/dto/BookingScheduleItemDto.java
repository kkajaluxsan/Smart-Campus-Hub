package com.campus.hub.dto;

import com.campus.hub.model.BookingStatus;

import java.time.LocalDateTime;

public record BookingScheduleItemDto(
        Long id,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BookingStatus status,
        String label
) {}

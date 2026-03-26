package com.campus.hub.dto;

import com.campus.hub.model.SeatAvailability;

public record SeatDto(
        Long id,
        String seatLabel,
        SeatAvailability availability
) {}

package com.campus.hub.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkBookingIdsRequest(
        @NotEmpty List<Long> bookingIds,
        String reason
) {}

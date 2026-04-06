package com.campus.hub.service;

import com.campus.hub.model.TicketPriority;

import java.time.Duration;
import java.time.Instant;

public final class TicketSlaCalculator {

    private TicketSlaCalculator() {}

    public static Instant computeDue(Instant from, TicketPriority priority) {
        Duration d = switch (priority) {
            case LOW -> Duration.ofHours(72);
            case MEDIUM -> Duration.ofHours(48);
            case HIGH -> Duration.ofHours(24);
            case CRITICAL -> Duration.ofHours(8);
        };
        return from.plus(d);
    }
}

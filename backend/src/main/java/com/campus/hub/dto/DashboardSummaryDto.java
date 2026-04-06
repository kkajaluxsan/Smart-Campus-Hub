package com.campus.hub.dto;

import java.util.List;

public record DashboardSummaryDto(
        long pendingBookings,
        long openTickets,
        long unreadNotifications,
        List<BookingDto> upcomingBookings,
        List<TicketDto> priorityTickets
) {}

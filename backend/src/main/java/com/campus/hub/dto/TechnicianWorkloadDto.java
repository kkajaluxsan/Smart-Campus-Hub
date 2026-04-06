package com.campus.hub.dto;

import java.util.List;

public record TechnicianWorkloadDto(
        long assignedOpenTickets,
        long slaBreachedOpenTickets,
        List<TicketDto> tickets
) {}

package com.campus.hub.dto;

import com.campus.hub.model.TicketPriority;
import com.campus.hub.model.TicketStatus;
import jakarta.validation.constraints.Size;

public record UpdateTicketRequest(
        TicketStatus status,
        TicketPriority priority,
        @Size(max = 4000) String description
) {}

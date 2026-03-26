package com.campus.hub.dto;

import com.campus.hub.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
        @NotNull Long resourceId,
        @NotBlank @Size(max = 4000) String description,
        @NotNull TicketPriority priority
) {}

package com.campus.hub.controller;

import com.campus.hub.dto.TechnicianWorkloadDto;
import com.campus.hub.service.CurrentUserService;
import com.campus.hub.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tech")
@RequiredArgsConstructor
public class TechnicianWorkloadController {

    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    @GetMapping("/workload")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public TechnicianWorkloadDto workload() {
        return ticketService.workloadForTechnician(currentUserService.requireCurrentUser());
    }
}

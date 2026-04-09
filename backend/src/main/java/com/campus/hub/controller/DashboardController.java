package com.campus.hub.controller;

import com.campus.hub.dto.DashboardSummaryDto;
import com.campus.hub.service.CurrentUserService;
import com.campus.hub.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @GetMapping("/summary")
    public DashboardSummaryDto summary() {
        return dashboardService.summary(currentUserService.requireCurrentUser());
    }
}

package com.campus.hub.controller;

import com.campus.hub.dto.SeatDto;
import com.campus.hub.service.CurrentUserService;
import com.campus.hub.service.SeatAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/resources/{resourceId}/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatAvailabilityService seatAvailabilityService;
    private final CurrentUserService currentUserService;

    @GetMapping("/availability")
    public List<SeatDto> availability(
            @PathVariable Long resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        currentUserService.requireCurrentUser();
        return seatAvailabilityService.availability(resourceId, start, end);
    }
}

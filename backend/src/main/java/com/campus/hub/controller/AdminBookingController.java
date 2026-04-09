package com.campus.hub.controller;

import com.campus.hub.dto.BookingDto;
import com.campus.hub.dto.BulkBookingIdsRequest;
import com.campus.hub.service.BookingService;
import com.campus.hub.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;
    private final CurrentUserService currentUserService;

    @PostMapping("/bulk-approve")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingDto> bulkApprove(@Valid @RequestBody BulkBookingIdsRequest req) {
        return bookingService.bulkApprove(req, currentUserService.requireCurrentUser());
    }

    @PostMapping("/bulk-reject")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingDto> bulkReject(@Valid @RequestBody BulkBookingIdsRequest req) {
        return bookingService.bulkReject(req, currentUserService.requireCurrentUser());
    }
}

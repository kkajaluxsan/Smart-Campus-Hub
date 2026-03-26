package com.campus.hub.controller;

import com.campus.hub.dto.BookingDecisionRequest;
import com.campus.hub.dto.BookingDto;
import com.campus.hub.dto.CreateBookingRequest;
import com.campus.hub.service.BookingService;
import com.campus.hub.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<BookingDto> list() {
        return bookingService.listFor(currentUserService.requireCurrentUser());
    }

    @GetMapping("/{id}")
    public BookingDto get(@PathVariable Long id) {
        return bookingService.getById(id, currentUserService.requireCurrentUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingDto create(@Valid @RequestBody CreateBookingRequest req) {
        return bookingService.create(req, currentUserService.requireCurrentUser());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public BookingDto approve(@PathVariable Long id, @RequestBody(required = false) BookingDecisionRequest decision) {
        BookingDecisionRequest d = decision != null ? decision : new BookingDecisionRequest(null);
        return bookingService.approve(id, d, currentUserService.requireCurrentUser());
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public BookingDto reject(@PathVariable Long id, @RequestBody(required = false) BookingDecisionRequest decision) {
        BookingDecisionRequest d = decision != null ? decision : new BookingDecisionRequest(null);
        return bookingService.reject(id, d, currentUserService.requireCurrentUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable Long id) {
        bookingService.cancel(id, currentUserService.requireCurrentUser());
    }
}

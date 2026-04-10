package com.campus.hub.service;

import com.campus.hub.dto.SeatDto;
import com.campus.hub.exception.ApiException;
import com.campus.hub.model.BookingStatus;
import com.campus.hub.model.SeatAvailability;
import com.campus.hub.repository.BookingRepository;
import com.campus.hub.repository.SeatRepository;
import com.campus.hub.resource.CampusResource;
import com.campus.hub.resource.CampusResourceRepository;
import com.campus.hub.resource.ResourceType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatAvailabilityService {

    private final CampusResourceRepository resourceRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    private static final List<BookingStatus> ACTIVE = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    @Transactional(readOnly = true)
    public List<SeatDto> availability(Long resourceId, LocalDateTime start, LocalDateTime end) {
        CampusResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));
        if (resource.getType() != ResourceType.AUDITORIUM) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Seat map only for auditoriums");
        }
        if (!end.isAfter(start)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
        return seatRepository.findByResourceIdOrderBySeatLabelAsc(resourceId).stream()
                .map(seat -> {
                    boolean booked = !bookingRepository.findOverlappingForSeat(
                            seat.getId(), start, end, ACTIVE).isEmpty();
                    return new SeatDto(seat.getId(), seat.getSeatLabel(),
                            booked ? SeatAvailability.BOOKED : SeatAvailability.AVAILABLE);
                })
                .toList();
    }
}

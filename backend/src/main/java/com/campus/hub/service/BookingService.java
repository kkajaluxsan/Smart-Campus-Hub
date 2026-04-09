package com.campus.hub.service;

import com.campus.hub.dto.*;
import com.campus.hub.exception.ApiException;
import com.campus.hub.model.*;
import com.campus.hub.repository.BookingRepository;
import com.campus.hub.repository.CampusResourceRepository;
import com.campus.hub.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CampusResourceRepository resourceRepository;
    private final SeatRepository seatRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    private static final List<BookingStatus> ACTIVE = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
    private static final List<BookingStatus> SCHEDULE_STATUSES =
            List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    @Transactional(readOnly = true)
    public List<BookingDto> upcomingForUser(User user) {
        return bookingRepository
                .findTop5ByUserIdAndStartTimeAfterOrderByStartTimeAsc(user.getId(), LocalDateTime.now())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDto> listFor(User currentUser) {
        List<Booking> list = currentUser.getRole() == Role.ADMIN
                ? bookingRepository.findAllByOrderByStartTimeDesc()
                : bookingRepository.findByUserIdOrderByStartTimeDesc(currentUser.getId());
        return list.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public BookingDto getById(Long id, User currentUser) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (currentUser.getRole() != Role.ADMIN && !b.getUser().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot view this booking");
        }
        return toDto(b);
    }

    @Transactional
    public List<BookingDto> create(CreateBookingRequest req, User currentUser) {
        LocalDateTime now = LocalDateTime.now();
        if (!req.startTime().isAfter(now)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Start time must be in the future");
        }
        if (!req.endTime().isAfter(req.startTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        String rec = req.recurrence() == null ? "NONE" : req.recurrence().trim();
        if (rec.isEmpty()) {
            rec = "NONE";
        }
        int occurrences = req.recurrenceOccurrences() == null ? 1 : req.recurrenceOccurrences();
        if ("NONE".equalsIgnoreCase(rec)) {
            occurrences = 1;
        } else {
            if (occurrences < 2 || occurrences > 26) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Recurrence count must be between 2 and 26");
            }
            if (!"WEEKLY".equalsIgnoreCase(rec) && !"BIWEEKLY".equalsIgnoreCase(rec)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Recurrence must be WEEKLY or BIWEEKLY");
            }
        }

        List<BookingDto> created = new ArrayList<>();
        for (int i = 0; i < occurrences; i++) {
            long weekStep = "BIWEEKLY".equalsIgnoreCase(rec) ? 2L * i : i;
            LocalDateTime start = req.startTime().plusWeeks(weekStep);
            LocalDateTime end = req.endTime().plusWeeks(weekStep);
            if (!start.isAfter(now)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Each occurrence must start in the future");
            }
            if (!end.isAfter(start)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid recurrence window");
            }
            created.add(createBookingInternal(req, start, end, currentUser));
        }
        return created;
    }

    private BookingDto createBookingInternal(CreateBookingRequest req, LocalDateTime start, LocalDateTime end, User currentUser) {
        CampusResource resource = resourceRepository.findById(req.resourceId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));

        if (resource.getStatus() != ResourceStatus.AVAILABLE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Resource is not available for booking");
        }

        int headcount;
        if (resource.getType() == ResourceType.AUDITORIUM) {
            headcount = req.attendees() != null ? req.attendees() : (req.seatIds() != null ? req.seatIds().size() : 0);
        } else {
            if (req.attendees() == null || req.attendees() < 1) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Attendees (at least 1) is required for this resource");
            }
            headcount = req.attendees();
        }
        if (resource.getCapacity() != null && headcount > resource.getCapacity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Attendees exceed resource capacity");
        }

        if (resource.getType() == ResourceType.AUDITORIUM) {
            if (req.seatIds() == null || req.seatIds().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Auditorium bookings require seat selection");
            }
            long distinct = req.seatIds().stream().distinct().count();
            if (distinct != req.seatIds().size()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Duplicate seats are not allowed");
            }
            if (req.attendees() != null && !req.attendees().equals(req.seatIds().size())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Attendees count must match selected seats");
            }
            validateAuditoriumSeats(resource, req.seatIds(), start, end);
        } else {
            if (req.seatIds() != null && !req.seatIds().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Seats only apply to auditoriums");
            }
            validateResourceOverlap(resource.getId(), start, end);
        }

        Booking booking = Booking.builder()
                .user(currentUser)
                .resource(resource)
                .startTime(start)
                .endTime(end)
                .purpose(req.purpose())
                .attendees(headcount)
                .status(BookingStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        if (resource.getType() == ResourceType.AUDITORIUM) {
            List<SeatBooking> sbs = new ArrayList<>();
            for (Long seatId : req.seatIds()) {
                Seat seat = seatRepository.findByIdAndResourceId(seatId, resource.getId())
                        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid seat for resource"));
                sbs.add(SeatBooking.builder().booking(booking).seat(seat).build());
            }
            booking.setSeatBookings(sbs);
        }

        bookingRepository.save(booking);
        auditService.log(currentUser, "BOOKING_CREATED", "Booking", booking.getId(),
                "Resource " + resource.getId());
        return toDto(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingScheduleItemDto> scheduleForResource(Long resourceId, LocalDateTime rangeStart, LocalDateTime rangeEnd) {
        if (!rangeEnd.isAfter(rangeStart)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "rangeEnd must be after rangeStart");
        }
        resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));
        List<Booking> rows = bookingRepository.findScheduleForResource(resourceId, SCHEDULE_STATUSES, rangeStart, rangeEnd);
        return rows.stream()
                .map(b -> new BookingScheduleItemDto(
                        b.getId(),
                        b.getStartTime(),
                        b.getEndTime(),
                        b.getStatus(),
                        "Booking #" + b.getId()))
                .toList();
    }

    @Transactional
    public List<BookingDto> bulkApprove(BulkBookingIdsRequest req, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin only");
        }
        List<BookingDto> out = new ArrayList<>();
        for (Long id : req.bookingIds()) {
            out.add(approve(id, new BookingDecisionRequest(req.reason()), admin));
        }
        return out;
    }

    @Transactional
    public List<BookingDto> bulkReject(BulkBookingIdsRequest req, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin only");
        }
        List<BookingDto> out = new ArrayList<>();
        for (Long id : req.bookingIds()) {
            out.add(reject(id, new BookingDecisionRequest(req.reason()), admin));
        }
        return out;
    }

    private void validateResourceOverlap(Long resourceId, LocalDateTime start, LocalDateTime end) {
        List<Booking> overlaps = bookingRepository.findOverlappingForResource(resourceId, start, end, ACTIVE);
        if (!overlaps.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "Time slot overlaps an existing booking");
        }
    }

    private void validateAuditoriumSeats(CampusResource resource, List<Long> seatIds, LocalDateTime start, LocalDateTime end) {
        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findByIdAndResourceId(seatId, resource.getId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid seat"));
            List<Booking> conflicts = bookingRepository.findOverlappingForSeat(
                    seat.getId(), start, end, ACTIVE);
            if (!conflicts.isEmpty()) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Seat " + seat.getSeatLabel() + " is already booked for this time range");
            }
        }
    }

    @Transactional
    public BookingDto approve(Long id, BookingDecisionRequest decision, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin only");
        }
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending bookings can be approved");
        }
        b.setStatus(BookingStatus.APPROVED);
        b.setAdminReason(decision.reason());
        auditService.log(admin, "BOOKING_APPROVED", "Booking", b.getId(), null);
        notificationService.notify(b.getUser(),
                "Your booking #" + b.getId() + " for " + b.getResource().getName() + " was approved.",
                NotificationType.BOOKING, "BOOKING", b.getId());
        return toDto(b);
    }

    @Transactional
    public BookingDto reject(Long id, BookingDecisionRequest decision, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin only");
        }
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending bookings can be rejected");
        }
        b.setStatus(BookingStatus.REJECTED);
        b.setAdminReason(decision.reason());
        auditService.log(admin, "BOOKING_REJECTED", "Booking", b.getId(), decision.reason());
        String reason = decision.reason() != null ? " Reason: " + decision.reason() : "";
        notificationService.notify(b.getUser(),
                "Your booking #" + b.getId() + " for " + b.getResource().getName() + " was rejected." + reason,
                NotificationType.BOOKING, "BOOKING", b.getId());
        return toDto(b);
    }

    @Transactional
    public void cancel(Long id, User currentUser) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (currentUser.getRole() != Role.ADMIN && !b.getUser().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot cancel this booking");
        }
        if (b.getStatus() == BookingStatus.CANCELLED) {
            return;
        }
        b.setStatus(BookingStatus.CANCELLED);
        auditService.log(currentUser, "BOOKING_CANCELLED", "Booking", b.getId(), null);
    }

    private BookingDto toDto(Booking b) {
        List<String> labels = b.getSeatBookings() == null ? List.of()
                : b.getSeatBookings().stream()
                .map(sb -> sb.getSeat().getSeatLabel())
                .toList();
        return new BookingDto(
                b.getId(),
                b.getUser().getId(),
                b.getUser().getEmail(),
                b.getResource().getId(),
                b.getResource().getName(),
                b.getStartTime(),
                b.getEndTime(),
                b.getPurpose(),
                b.getAttendees(),
                b.getStatus(),
                b.getAdminReason(),
                b.getCreatedAt(),
                labels,
                b.getUser().getStudentIndexNumber(),
                b.getUser().getDepartment() != null ? b.getUser().getDepartment().name() : null
        );
    }
}

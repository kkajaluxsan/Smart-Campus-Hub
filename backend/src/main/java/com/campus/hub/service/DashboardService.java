package com.campus.hub.service;

import com.campus.hub.dto.BookingDto;
import com.campus.hub.dto.DashboardSummaryDto;
import com.campus.hub.dto.TicketDto;
import com.campus.hub.model.BookingStatus;
import com.campus.hub.model.Role;
import com.campus.hub.model.TicketPriority;
import com.campus.hub.model.TicketStatus;
import com.campus.hub.model.User;
import com.campus.hub.repository.BookingRepository;
import com.campus.hub.repository.NotificationRepository;
import com.campus.hub.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final List<TicketStatus> OPEN_LIKE =
            List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;
    private final BookingService bookingService;
    private final TicketService ticketService;

    @Transactional(readOnly = true)
    public DashboardSummaryDto summary(User user) {
        long unread = notificationRepository.countByUserIdAndReadFlagFalse(user.getId());

        long pendingBookings = user.getRole() == Role.ADMIN
                ? bookingRepository.countByStatus(BookingStatus.PENDING)
                : bookingRepository.countByUserIdAndStatus(user.getId(), BookingStatus.PENDING);

        long openTickets = switch (user.getRole()) {
            case ADMIN -> ticketRepository.countByStatusIn(OPEN_LIKE);
            case TECHNICIAN -> ticketRepository.countByAssignedTechnicianIdAndStatusIn(user.getId(), OPEN_LIKE);
            default -> ticketRepository.countByCreatedByIdAndStatusIn(user.getId(), OPEN_LIKE);
        };

        List<BookingDto> upcoming = bookingService.upcomingForUser(user);

        List<TicketDto> all = ticketService.list(user);
        List<TicketDto> high = all.stream()
                .filter(t -> t.status() != TicketStatus.CLOSED
                        && t.status() != TicketStatus.RESOLVED
                        && t.status() != TicketStatus.REJECTED)
                .filter(t -> t.priority() == TicketPriority.HIGH || t.priority() == TicketPriority.CRITICAL)
                .limit(5)
                .toList();
        List<TicketDto> priorityTickets = high.isEmpty()
                ? all.stream()
                .filter(t -> t.status() != TicketStatus.CLOSED
                        && t.status() != TicketStatus.RESOLVED
                        && t.status() != TicketStatus.REJECTED)
                .limit(5)
                .toList()
                : high;

        return new DashboardSummaryDto(pendingBookings, openTickets, unread, upcoming, priorityTickets);
    }
}

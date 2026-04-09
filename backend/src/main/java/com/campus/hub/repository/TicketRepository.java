package com.campus.hub.repository;

import com.campus.hub.model.Ticket;
import com.campus.hub.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByIdOrderByUpdatedAtDesc(Long userId);

    List<Ticket> findByAssignedTechnicianIdOrderByUpdatedAtDesc(Long technicianId);

    List<Ticket> findAllByOrderByUpdatedAtDesc();

    long countByStatus(TicketStatus status);

    long countByAssignedTechnicianIdAndStatusIn(Long technicianId, List<TicketStatus> statuses);

    long countByCreatedByIdAndStatusIn(Long createdById, List<TicketStatus> statuses);

    long countByStatusIn(List<TicketStatus> statuses);
}

package com.campus.hub.repository;

import com.campus.hub.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByIdOrderByUpdatedAtDesc(Long userId);

    List<Ticket> findByAssignedTechnicianIdOrderByUpdatedAtDesc(Long technicianId);

    List<Ticket> findAllByOrderByUpdatedAtDesc();
}

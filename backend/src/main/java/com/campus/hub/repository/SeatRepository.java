package com.campus.hub.repository;

import com.campus.hub.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByResourceIdOrderBySeatLabelAsc(Long resourceId);

    Optional<Seat> findByIdAndResourceId(Long id, Long resourceId);
}

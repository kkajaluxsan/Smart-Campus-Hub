package com.campus.hub.repository;

import com.campus.hub.model.Booking;
import com.campus.hub.model.BookingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByStatus(BookingStatus status);

    long countByUserIdAndStatus(Long userId, BookingStatus status);

    @EntityGraph(attributePaths = {"user", "resource", "seatBookings", "seatBookings.seat"})
    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "resource", "seatBookings", "seatBookings.seat"})
    List<Booking> findTop5ByUserIdAndStartTimeAfterOrderByStartTimeAsc(Long userId, LocalDateTime after);

    @EntityGraph(attributePaths = {"user", "resource", "seatBookings", "seatBookings.seat"})
    List<Booking> findAllByOrderByStartTimeDesc();

    @Query("""
            SELECT b FROM Booking b
            WHERE b.resource.id = :resourceId
            AND b.status IN :statuses
            AND b.startTime < :end
            AND b.endTime > :start
            """)
    List<Booking> findOverlappingForResource(
            @Param("resourceId") Long resourceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("statuses") List<BookingStatus> statuses);

    @Query("""
            SELECT DISTINCT b FROM Booking b
            JOIN b.seatBookings sb
            WHERE sb.seat.id = :seatId
            AND b.status IN :statuses
            AND b.startTime < :end
            AND b.endTime > :start
            """)
    List<Booking> findOverlappingForSeat(
            @Param("seatId") Long seatId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("statuses") List<BookingStatus> statuses);

    @EntityGraph(attributePaths = {"user", "resource", "seatBookings", "seatBookings.seat"})
    @Query("""
            SELECT b FROM Booking b
            WHERE b.resource.id = :resourceId
            AND b.status IN :statuses
            AND b.startTime < :rangeEnd
            AND b.endTime > :rangeStart
            ORDER BY b.startTime ASC
            """)
    List<Booking> findScheduleForResource(
            @Param("resourceId") Long resourceId,
            @Param("statuses") List<BookingStatus> statuses,
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEnd") LocalDateTime rangeEnd);
}

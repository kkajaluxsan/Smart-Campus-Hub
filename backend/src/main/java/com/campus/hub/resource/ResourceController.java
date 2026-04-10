package com.campus.hub.resource;

import com.campus.hub.dto.BookingScheduleItemDto;
import com.campus.hub.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final BookingService bookingService;

    @GetMapping
    public List<ResourceDto> list(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir
    ) {
        return resourceService.search(type, minCapacity, maxCapacity, location, status, q, sortBy, sortDir);
    }

    @GetMapping("/{id}")
    public ResourceDto get(@PathVariable Long id) {
        return resourceService.getById(id);
    }

    @GetMapping("/{id}/schedule")
    public List<BookingScheduleItemDto> schedule(
            @PathVariable Long id,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        return bookingService.scheduleForResource(id, start, end);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceDto create(@Valid @RequestBody CreateResourceRequest req) {
        return resourceService.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResourceDto update(@PathVariable Long id, @Valid @RequestBody CreateResourceRequest req) {
        return resourceService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        resourceService.delete(id);
    }
}

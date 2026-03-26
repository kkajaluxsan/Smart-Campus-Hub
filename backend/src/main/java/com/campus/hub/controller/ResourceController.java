package com.campus.hub.controller;

import com.campus.hub.dto.CreateResourceRequest;
import com.campus.hub.dto.ResourceDto;
import com.campus.hub.model.ResourceType;
import com.campus.hub.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public List<ResourceDto> list(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location
    ) {
        return resourceService.search(type, minCapacity, location);
    }

    @GetMapping("/{id}")
    public ResourceDto get(@PathVariable Long id) {
        return resourceService.getById(id);
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

package com.campus.hub.resource;

public record ResourceDto(
        Long id,
        String name,
        ResourceType type,
        Integer capacity,
        String location,
        ResourceStatus status
) {}

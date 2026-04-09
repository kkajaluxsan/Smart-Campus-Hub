package com.campus.hub.dto;

import com.campus.hub.model.ResourceStatus;
import com.campus.hub.model.ResourceType;

public record ResourceDto(
        Long id,
        String name,
        ResourceType type,
        Integer capacity,
        String location,
        ResourceStatus status
) {}

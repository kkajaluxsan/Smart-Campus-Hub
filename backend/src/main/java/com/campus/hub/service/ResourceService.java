package com.campus.hub.service;

import com.campus.hub.dto.CreateResourceRequest;
import com.campus.hub.dto.ResourceDto;
import com.campus.hub.exception.ApiException;
import com.campus.hub.model.CampusResource;
import com.campus.hub.model.ResourceType;
import com.campus.hub.repository.CampusResourceRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final CampusResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public List<ResourceDto> search(ResourceType type, Integer minCapacity, String location) {
        Specification<CampusResource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }
            if (StringUtils.hasText(location)) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
            }
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return resourceRepository.findAll(spec).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ResourceDto getById(Long id) {
        return toDto(resourceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found")));
    }

    @Transactional
    public ResourceDto create(CreateResourceRequest req) {
        CampusResource r = CampusResource.builder()
                .name(req.name())
                .type(req.type())
                .capacity(req.capacity())
                .location(req.location())
                .status(req.status())
                .build();
        return toDto(resourceRepository.save(r));
    }

    @Transactional
    public ResourceDto update(Long id, CreateResourceRequest req) {
        CampusResource r = resourceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));
        r.setName(req.name());
        r.setType(req.type());
        r.setCapacity(req.capacity());
        r.setLocation(req.location());
        r.setStatus(req.status());
        return toDto(resourceRepository.save(r));
    }

    @Transactional
    public void delete(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    private ResourceDto toDto(CampusResource r) {
        return new ResourceDto(r.getId(), r.getName(), r.getType(), r.getCapacity(), r.getLocation(), r.getStatus());
    }
}

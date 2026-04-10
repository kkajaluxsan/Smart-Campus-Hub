package com.campus.hub.resource;

import com.campus.hub.exception.ApiException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.dao.DataIntegrityViolationException;
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
    public List<ResourceDto> search(
            ResourceType type,
            Integer minCapacity,
            Integer maxCapacity,
            String location,
            ResourceStatus status,
            String queryText,
            String sortBy,
            String sortDir
    ) {
        Specification<CampusResource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }
            if (maxCapacity != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("capacity"), maxCapacity));
            }
            if (StringUtils.hasText(location)) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (StringUtils.hasText(queryText)) {
                String term = "%" + queryText.trim().toLowerCase() + "%";
                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("name")), term),
                                cb.like(cb.lower(root.get("location")), term)
                        )
                );
            }
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        Sort sort = buildSort(sortBy, sortDir);
        return resourceRepository.findAll(spec, sort).stream().map(this::toDto).toList();
    }

    private Sort buildSort(String sortBy, String sortDir) {
        String property = switch (sortBy == null ? "" : sortBy.trim().toLowerCase()) {
            case "capacity" -> "capacity";
            case "location" -> "location";
            case "type" -> "type";
            case "status" -> "status";
            case "name" -> "name";
            default -> "name";
        };
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, property);
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
        try {
            resourceRepository.deleteById(id);
            resourceRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Resource cannot be deleted because booking history exists for it");
        }
    }

    private ResourceDto toDto(CampusResource r) {
        return new ResourceDto(r.getId(), r.getName(), r.getType(), r.getCapacity(), r.getLocation(), r.getStatus());
    }
}

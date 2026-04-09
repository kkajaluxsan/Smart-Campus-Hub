package com.campus.hub.repository;

import com.campus.hub.model.CampusResource;
import com.campus.hub.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CampusResourceRepository extends JpaRepository<CampusResource, Long>, JpaSpecificationExecutor<CampusResource> {
}

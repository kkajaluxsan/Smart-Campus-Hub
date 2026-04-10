package com.campus.hub.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CampusResourceRepository extends JpaRepository<CampusResource, Long>, JpaSpecificationExecutor<CampusResource> {
}

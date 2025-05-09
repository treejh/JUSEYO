package com.example.backend.managementDashboard.repository;

import com.example.backend.managementDashboard.entity.ManagementDashboard;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ManagementDashboardRepository extends CrudRepository<ManagementDashboard, Long> {
    Optional<ManagementDashboard> findByName(String name);
}

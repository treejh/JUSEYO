package com.example.backend.managementDashboard.repository;

import com.example.backend.managementDashboard.entity.ManagementDashboard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ManagementDashboardRepository extends JpaRepository<ManagementDashboard, Long> {
    Optional<ManagementDashboard> findById(Long id);
}

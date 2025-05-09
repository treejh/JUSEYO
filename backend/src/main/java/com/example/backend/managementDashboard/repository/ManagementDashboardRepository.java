package com.example.backend.managementDashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import com.example.backend.managementdashboard.entity.ManagementDashboard;

import java.util.Optional;

public interface ManagementDashboardRepository extends JpaRepository<ManagementDashboard, Long> {
    Optional<ManagementDashboard> findById(Long id);
}

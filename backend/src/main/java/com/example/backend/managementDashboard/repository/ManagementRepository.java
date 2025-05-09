package com.example.backend.managementDashboard.repository;


import com.example.backend.managementDashboard.entity.ManagementDashboard;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManagementRepository extends JpaRepository<ManagementDashboard,Long> {

    Optional<ManagementDashboard> findByName(String name);
}

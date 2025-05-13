package com.example.backend.inventoryOut.repository;

import com.example.backend.inventoryOut.entity.InventoryOut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import java.util.List;

@Repository
public interface InventoryOutRepository extends JpaRepository<InventoryOut, Integer> {
    List<InventoryOut> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // InventoryOutRepository.java
    List<InventoryOut> findAllByManagementDashboardId(Long managementDashboardId);

}

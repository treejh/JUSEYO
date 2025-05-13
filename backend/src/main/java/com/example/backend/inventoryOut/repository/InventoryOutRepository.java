package com.example.backend.inventoryOut.repository;

import com.example.backend.inventoryOut.entity.InventoryOut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryOutRepository extends JpaRepository<InventoryOut, Integer> {

    // InventoryOutRepository.java
    List<InventoryOut> findAllByManagementDashboardId(Long managementDashboardId);

}

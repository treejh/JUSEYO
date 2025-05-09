package com.example.backend.inventoryOut.repository;

import com.example.backend.inventoryOut.entity.InventoryOut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryOutRepository extends JpaRepository<InventoryOut, Integer> {
}

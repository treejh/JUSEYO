package com.example.backend.inventoryout.repository;

import com.example.backend.inventoryout.entity.InventoryOut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryOutRepository extends JpaRepository<InventoryOut, Integer> {
}

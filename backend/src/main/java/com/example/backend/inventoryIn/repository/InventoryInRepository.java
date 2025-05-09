package com.example.backend.inventoryIn.repository;

import com.example.backend.inventoryIn.entity.InventoryIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryInRepository extends JpaRepository<InventoryIn, String> {}

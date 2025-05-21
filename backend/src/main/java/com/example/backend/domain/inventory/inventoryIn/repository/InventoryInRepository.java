package com.example.backend.domain.inventory.inventoryIn.repository;


import com.example.backend.domain.inventory.inventoryIn.entity.InventoryIn;
import com.example.backend.enums.Inbound;
import com.example.backend.domain.inventory.inventoryIn.dto.response.InventoryInResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryInRepository extends JpaRepository<InventoryIn, Long> {

    @Query("select new com.example.backend.domain.inventory.inventoryIn.dto.response.InventoryInResponseDto " +
            "(i.id,i.item.id, i.item.name, i.quantity, i.inbound, i.createdAt,i.image) from InventoryIn i")
    Page<InventoryInResponseDto> getInventoryIns(Pageable pageable);

    @Query("select new com.example.backend.domain.inventory.inventoryIn.dto.response.InventoryInResponseDto " +
            "(i.id, i.item.id, i.item.name, i.quantity, i.inbound, i.createdAt,i.image) " +
            "from InventoryIn i " +
            "where i.inbound = :inbound")
    Page<InventoryInResponseDto> getInventoryInsByInbound(@Param("inbound") Inbound inbound, Pageable pageable);

    List<InventoryIn> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);


}

package com.example.backend.inventoryOut.repository;

import com.example.backend.inventoryOut.entity.InventoryOut;
import com.example.backend.recommendation.dto.OutHistoryDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryOutRepository extends JpaRepository<InventoryOut, Integer>, JpaSpecificationExecutor<InventoryOut> {
    List<InventoryOut> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);


    @Query("""
    SELECT new com.example.backend.recommendation.dto.OutHistoryDto(
        r.user.id, i.name
    )
    FROM InventoryOut o
    JOIN o.supplyRequest r
    JOIN o.item i
    """)
    List<OutHistoryDto> findUserItemHistory();

    List<InventoryOut> findAllByManagementDashboardId(Long managementDashboardId);

    List<InventoryOut> findAllBySupplyRequest_User_Id(Long userId);
}

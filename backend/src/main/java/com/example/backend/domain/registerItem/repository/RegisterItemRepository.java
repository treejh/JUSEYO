package com.example.backend.domain.registerItem.repository;

import com.example.backend.domain.registerItem.dto.response.RegisterItemResponseDto;
import com.example.backend.enums.Status;
import com.example.backend.domain.registerItem.entity.RegisterItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegisterItemRepository extends JpaRepository<RegisterItem, Long> {

    @Query("SELECT new com.example.backend.domain.registerItem.dto.response.RegisterItemResponseDto(" +
            "r.id, " +
            "r.managementDashboard.id, " +
            "r.category.id, " +
            "r.item.id, " +
            "r.image, " +
            "r.quantity, " +
            "r.purchaseDate, " +
            "r.purchaseSource, " +
            "r.location, " +
            "r.inbound, " +
            "r.status) " +
            "FROM RegisterItem r " +
            "WHERE (:status IS NULL OR r.status = :status) " +
            "AND (:managementId IS NULL OR r.managementDashboard.id = :managementId)")
    Page<RegisterItemResponseDto> findByStatusAndManagement(
            @Param("status") Status status,
            @Param("managementId") Long managementId,
            Pageable pageable);


}

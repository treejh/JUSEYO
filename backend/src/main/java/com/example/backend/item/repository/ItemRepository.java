package com.example.backend.item.repository;

import com.example.backend.item.dto.response.ItemResponseDto;
import com.example.backend.item.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    boolean existsBySerialNumber(String serialNumber);
    Optional<Item> findByName(String name);

    // 관리페이지별 조회
    List<Item> findAllByManagementDashboardId(Long managementDashboardId);

    // 단일 조회 + 소속 확인
    Optional<Item> findByIdAndManagementDashboardId(Long id, Long managementDashboardId);

    // 비품명으로 현재 등록된 건수 조회 (시리얼 순번 계산용)
    long countByName(String name);

    @Query("SELECT new com.example.backend.item.dto.response.ItemResponseDto(" +
            "i.id, i.name, i.serialNumber, i.minimumQuantity, " +
            "i.totalQuantity, i.availableQuantity, i.purchaseSource, " +
            "i.location, i.isReturnRequired, i.image, " +
            "i.category.id, i.managementDashboard.id, i.createdAt, i.modifiedAt) " +
            "FROM Item i")
    Page<ItemResponseDto> findAllAsDto(Pageable pageable);
}
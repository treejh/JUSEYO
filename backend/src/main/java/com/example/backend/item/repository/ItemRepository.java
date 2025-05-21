package com.example.backend.item.repository;

import com.example.backend.enums.Status;
import com.example.backend.item.dto.response.ItemSearchProjection;
import com.example.backend.item.dto.response.ItemResponseDto;
import com.example.backend.item.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    // 시리얼 넘버 존재 여부 확인
    boolean existsBySerialNumber(String serialNumber);

    // 이름으로 비품 조회
    Optional<Item> findByNameAndStatus(String name, Status status);

    // 관리페이지별 비품 목록 조회
    List<Item> findAllByManagementDashboardIdAndStatus(Long managementDashboardId, Status status);

    // ID + 관리페이지 ID로 단일 조회
    Optional<Item> findByIdAndManagementDashboardIdAndStatus(Long id, Long managementDashboardId, Status status);

    // 이름 기준 비품 개수 조회 (시리얼 순번용)
    long countByName(String name);

    Optional<Item> findByName(String name);

    //상태 별 아이템 목록 가졍
    @Query("SELECT new com.example.backend.item.dto.response.ItemResponseDto(" +
            "i.id, i.name, c.name, i.serialNumber, i.minimumQuantity, " +
            "i.totalQuantity, i.availableQuantity, i.purchaseSource, " +
            "i.location, i.isReturnRequired, i.image, " +
            "i.category.id, i.managementDashboard.id, i.createdAt, i.modifiedAt, i.status) " +
            "FROM Item i Join i.category c WHERE i.status = :status")
    Page<ItemResponseDto> findAllAsDto(@Param("status") Status status, Pageable pageable);

    //비품 검색
    @Query("SELECT i.id AS id, i.name AS name, c.name AS categoryName, i.availableQuantity AS availableQuantity " +
            "FROM Item i JOIN i.category c " +
            "WHERE i.managementDashboard.id = :managementDashboardId " +
            "  AND (i.name LIKE %:keyword% OR c.name LIKE %:keyword%)")
    Page<ItemSearchProjection> searchItemsWithCategory(
            @Param("managementDashboardId") Long managementDashboardId,
            @Param("keyword")               String keyword,
            Pageable                        pageable
    );

    // ID + 상태 기반 조회
    Optional<Item> findByIdAndStatus(Long id, Status status);
}


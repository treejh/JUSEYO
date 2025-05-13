package com.example.backend.item.repository;

import com.example.backend.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
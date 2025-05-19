package com.example.backend.category.repository;

import com.example.backend.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // 관리 페이지에 속한 카테고리 전체 조회 (리스트 형태)
    List<Category> findByManagementDashboardId(Long managementDashboardId);

    // 관리 페이지에 속한 카테고리 페이징 조회
    Page<Category> findByManagementDashboardId(Long managementDashboardId, Pageable pageable);

    // 관리 페이지 내 ID와 이름으로 조회 (Service에서 사용 중)
    Optional<Category> findByManagementDashboardIdAndName(Long managementDashboardId, String name);

    // 관리 페이지 내 ID와 Category ID로 조회 (기존 메서드 유지)
    Optional<Category> findByManagementDashboardIdAndId(Long managementId, Long categoryId);

    // 관리 페이지 내 카테고리 이름 중복 체크 추가
    boolean existsByNameAndManagementDashboardId(String name, Long managementDashboardId);
}

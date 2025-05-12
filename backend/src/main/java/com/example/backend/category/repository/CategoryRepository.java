package com.example.backend.category.repository;

import com.example.backend.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // 관리 페이지에 속한 카테고리 전체 조회 (리스트 형태)
    List<Category> findByManagementDashboardId(Long managementDashboardId);

    // 관리 페이지에 속한 카테고리 페이징 조회
    Page<Category> findByManagementDashboardId(Long managementDashboardId, Pageable pageable);
}

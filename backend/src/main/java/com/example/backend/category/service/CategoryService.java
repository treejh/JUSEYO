package com.example.backend.category.service;

import com.example.backend.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.category.dto.response.CategoryResponseDTO;
import com.example.backend.category.entity.Category;
import com.example.backend.category.repository.CategoryRepository;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ManagementDashboardRepository managementDashboardRepository;

    // 카테고리 생성
    @Transactional
    public CategoryResponseDTO createCategory(CategoryCreateRequestDTO dto, ManagementDashboard dashboard) {
        if (categoryRepository.existsByNameAndManagementDashboardId(dto.getName(), dashboard.getId())) {
            throw new BusinessLogicException(ExceptionCode.CATEGORY_ALREADY_EXISTS);
        }

        Category category = Category.builder()
                .name(dto.getName())
                .managementDashboard(dashboard)
                .build();

        categoryRepository.save(category);
        return CategoryResponseDTO.fromEntity(category);
    }

    // 카테고리 수정
    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryUpdateRequestDTO dto, ManagementDashboard dashboard) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        if (!category.getManagementDashboard().getId().equals(dashboard.getId())) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        category.setName(dto.getName());
        categoryRepository.save(category);

        return CategoryResponseDTO.fromEntity(category);
    }

    // 카테고리 삭제
    @Transactional
    public void deleteCategory(Long id, ManagementDashboard dashboard) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        if (!category.getManagementDashboard().getId().equals(dashboard.getId())) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        categoryRepository.delete(category);
    }

    // 전체 카테고리 조회
    public List<CategoryResponseDTO> findAllCategoriesByDashboard(Long dashboardId) {
        List<Category> categories = categoryRepository.findByManagementDashboardId(dashboardId);
        return categories.stream()
                .map(CategoryResponseDTO::fromEntity)
                .toList();
    }

    // 특정 카테고리 조회
    public CategoryResponseDTO findCategoryById(Long id, ManagementDashboard dashboard) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        if (!category.getManagementDashboard().getId().equals(dashboard.getId())) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        return CategoryResponseDTO.fromEntity(category);
    }
}

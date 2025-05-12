package com.example.backend.category.service;

import com.example.backend.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.category.dto.response.CategoryResponseDTO;
import com.example.backend.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.category.entity.Category;
import com.example.backend.category.repository.CategoryRepository;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ManagementDashboardRepository managementDashboardRepository;

    // 카테고리 생성
    public CategoryResponseDTO createCategory(CategoryCreateRequestDTO dto) {
        // 관리 페이지 내 카테고리 이름 중복 체크
        if (categoryRepository.existsByNameAndManagementDashboardId(dto.getName(), dto.getManagementDashboardId())) {
            throw new BusinessLogicException(ExceptionCode.CATEGORY_ALREADY_EXISTS);
        }

        Category category = Category.builder()
                .name(dto.getName())
                .managementDashboard(managementDashboardRepository.findById(dto.getManagementDashboardId())
                        .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)))
                .build();

        Category savedCategory = categoryRepository.save(category);
        return CategoryResponseDTO.fromEntity(savedCategory);
    }

    // 모든 카테고리 조회
    public List<CategoryResponseDTO> findAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(CategoryResponseDTO::fromEntity)
                .toList();
    }

    // 특정 카테고리 조회
    public CategoryResponseDTO findCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
        return CategoryResponseDTO.fromEntity(category);
    }

    // 카테고리 수정
    public CategoryResponseDTO updateCategory(Long id, CategoryUpdateRequestDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
        category.setName(dto.getName());
        Category updatedCategory = categoryRepository.save(category);
        return CategoryResponseDTO.fromEntity(updatedCategory); // DTO로 변환해서 반환
    }

    // 카테고리 삭제
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND);
        }
        categoryRepository.deleteById(id);
    }
}
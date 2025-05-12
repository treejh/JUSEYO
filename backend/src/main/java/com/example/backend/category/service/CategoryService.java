package com.example.backend.category.service;

import com.example.backend.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.category.dto.response.CategoryResponseDTO;
import com.example.backend.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.category.entity.Category;
import com.example.backend.category.repository.CategoryRepository;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ManagementDashboardRepository managementDashboardRepository;

    // 카테고리 생성
    public Category createCategory(CategoryCreateRequestDTO dto) {
        Category category = Category.builder()
                .name(dto.getName())
                .managementDashboard(managementDashboardRepository.findById(dto.getManagementDashboardId())
                        .orElseThrow(() -> new IllegalArgumentException("대시보드 ID가 유효하지 않습니다.")))
                .build();
        return categoryRepository.save(category);
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
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        return CategoryResponseDTO.fromEntity(category);
    }

    // 카테고리 수정
    public Category updateCategory(Long id, CategoryUpdateRequestDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.setName(dto.getName());
        return categoryRepository.save(category);
    }

    // 카테고리 삭제
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 카테고리입니다.");
        }
        categoryRepository.deleteById(id);
    }
}

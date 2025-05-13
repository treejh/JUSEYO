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

    /**
     * 🔹 특정 대시보드 내에서 이름으로 카테고리 조회
     */
    @Transactional
    public Category findCategoryByName(Long managementId, String name) {
        return categoryRepository.findByManagementDashboardIdAndName(managementId, name)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
    }

    /**
     * 🔹 카테고리 생성 메서드
     * @param dto - 생성할 카테고리 정보
     * @param dashboard - 연관된 관리 대시보드 정보
     * @return 생성된 카테고리 DTO (변경된 부분)
     */
    @Transactional
    public CategoryResponseDTO createCategory(CategoryCreateRequestDTO dto, ManagementDashboard dashboard) {

        // 🔸 중복 체크
        if (categoryRepository.existsByNameAndManagementDashboardId(dto.getName(), dashboard.getId())) {
            throw new BusinessLogicException(ExceptionCode.CATEGORY_ALREADY_EXISTS);
        }

        // 🔸 카테고리 생성 및 저장
        Category category = Category.builder()
                .name(dto.getName())
                .managementDashboard(dashboard)
                .build();

        Category savedCategory = categoryRepository.save(category);

        // 🔸 수정된 부분: Service에서 DTO로 매핑하여 반환
        return CategoryResponseDTO.fromEntity(savedCategory);
    }

    /**
     * 🔹 전체 카테고리 조회
     * @param managementId - 관리 대시보드 ID
     * @return 조회된 카테고리 리스트
     */
    public List<CategoryResponseDTO> findAllCategoriesByDashboard(Long managementId) {
        List<Category> categories = categoryRepository.findByManagementDashboardId(managementId);
        return categories.stream()
                .map(CategoryResponseDTO::fromEntity)
                .toList();
    }

    /**
     * 🔹 카테고리 단일 조회
     * @param id - 카테고리 ID
     * @return 조회된 카테고리 DTO (변경된 부분)
     */
    public CategoryResponseDTO findCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        // 🔸 수정된 부분: DTO로 매핑하여 반환
        return CategoryResponseDTO.fromEntity(category);
    }

    /**
     * 🔹 카테고리 수정
     * @param id - 수정할 카테고리 ID
     * @param dto - 수정할 정보
     * @return 수정된 카테고리 DTO (변경된 부분)
     */
    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryUpdateRequestDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        category.setName(dto.getName());
        Category updatedCategory = categoryRepository.save(category);

        // 🔸 수정된 부분: DTO로 매핑하여 반환
        return CategoryResponseDTO.fromEntity(updatedCategory);
    }

    /**
     * 🔹 카테고리 삭제
     * @param id - 삭제할 카테고리 ID
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        categoryRepository.delete(category);
    }
}

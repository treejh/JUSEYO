package com.example.backend.domain.category.service;

import com.example.backend.domain.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.domain.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.domain.category.dto.response.CategoryResponseDTO;
import com.example.backend.domain.category.entity.Category;
import com.example.backend.domain.category.repository.CategoryRepository;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ManagementDashboardRepository managementDashboardRepository;

    private Long getDashboardId(User user) {
        // 우선적으로 User의 ManagementDashboard가 있으면 그것을 사용
        if (user.getManagementDashboard() != null) {
            log.info("User 직접 참조하는 ManagementDashboard ID: {}", user.getManagementDashboard().getId());
            return user.getManagementDashboard().getId();
        }

        // 없으면 Department를 통한 ManagementDashboard 조회
        else if (user.getDepartment() != null && user.getDepartment().getManagementDashboard() != null) {
            log.info("Department를 통한 ManagementDashboard ID: {}", user.getDepartment().getManagementDashboard().getId());
            return user.getDepartment().getManagementDashboard().getId();
        }

        // 둘 다 없으면 에러 처리
        else {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }
    }

    @Transactional
    public CategoryResponseDTO createCategory(CategoryCreateRequestDTO dto, User user) {
        Long dashboardId = getDashboardId(user);
        ManagementDashboard dashboard = managementDashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        if (categoryRepository.existsByNameAndManagementDashboardId(dto.getName(), dashboardId)) {
            throw new BusinessLogicException(ExceptionCode.CATEGORY_ALREADY_EXISTS);
        }

        Category category = Category.builder()
                .name(dto.getName())
                .managementDashboard(dashboard)
                .build();

        categoryRepository.save(category);
        return CategoryResponseDTO.fromEntity(category);
    }

    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryUpdateRequestDTO dto, User user) {
        Long dashboardId = getDashboardId(user);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        if (!category.getManagementDashboard().getId().equals(dashboardId)) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        category.setName(dto.getName());
        categoryRepository.save(category);

        return CategoryResponseDTO.fromEntity(category);
    }

    @Transactional
    public void deleteCategory(Long id, User user) {
        Long dashboardId = getDashboardId(user);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        if (!category.getManagementDashboard().getId().equals(dashboardId)) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        categoryRepository.delete(category);
    }

    public List<CategoryResponseDTO> findAllCategories(User user) {
        Long dashboardId = getDashboardId(user);
        List<Category> categories = categoryRepository.findByManagementDashboardId(dashboardId);
        return categories.stream()
                .map(CategoryResponseDTO::fromEntity)
                .toList();
    }

    public CategoryResponseDTO findCategoryById(Long id, User user) {
        Long dashboardId = getDashboardId(user);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        if (!category.getManagementDashboard().getId().equals(dashboardId)) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        return CategoryResponseDTO.fromEntity(category);
    }
}

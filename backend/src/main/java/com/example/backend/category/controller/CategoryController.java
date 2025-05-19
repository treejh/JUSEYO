package com.example.backend.category.controller;

import com.example.backend.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.category.dto.response.CategoryResponseDTO;
import com.example.backend.category.service.CategoryService;
import com.example.backend.enums.RoleType;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@Tag(name = "카테고리 관리 컨트롤러")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;
    private final TokenService tokenService;
    private final UserService userService;

    // 카테고리 생성 (매니저만 가능)
    @PostMapping
    @Operation(
            summary = "카테고리 생성",
            description = "매니저의 카테고리 생성을 처리합니다."
    )
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CategoryCreateRequestDTO dto) {
        User user = getAuthorizedManager();
        ManagementDashboard dashboard = user.getManagementDashboard();

        // Service 호출 - 생성 후 DTO 반환
        CategoryResponseDTO responseDTO = categoryService.createCategory(dto, dashboard);

        // 생성된 카테고리 반환
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // 전체 카테고리 조회 (로그인한 유저 + 자신의 관리 페이지에 속한 것만 조회)
    @GetMapping
    @Operation(
            summary = "전체 카테고리 조회",
            description = "대시보드 내 전체 카테고리 조회를 처리합니다."
    )
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        User user = getAuthorizedUser();
        ManagementDashboard dashboard = user.getManagementDashboard();

        if (dashboard == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }

        // Service 호출 - 전체 조회 후 DTO로 반환
        List<CategoryResponseDTO> response = categoryService.findAllCategoriesByDashboard(dashboard.getId());

        return ResponseEntity.ok(response);
    }

    // 특정 카테고리 조회 (로그인한 유저 + 자신의 관리 페이지에 속할 때만 조회 가능)
    @GetMapping("/{id}")
    @Operation(
            summary = "특정 카테고리 조회",
            description = "특정 카테고리 조회를 처리합니다."
    )
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable Long id) {
        User user = getAuthorizedUser();
        ManagementDashboard dashboard = user.getManagementDashboard();

        if (dashboard == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }

        // Service 호출 - 권한 체크 포함된 단일 조회
        CategoryResponseDTO response = categoryService.findCategoryById(id, dashboard);

        return ResponseEntity.ok(response);
    }

    // 카테고리 수정 (매니저만 가능)
    @PutMapping("/{id}")
    @Operation(
            summary = "카테고리 수정",
            description = "매니저가 카테고리를 수정합니다."
    )
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequestDTO dto) {

        User user = getAuthorizedManager();
        ManagementDashboard dashboard = user.getManagementDashboard();

        // Service 호출 - 업데이트 처리
        CategoryResponseDTO responseDTO = categoryService.updateCategory(id, dto, dashboard);

        return ResponseEntity.ok(responseDTO);
    }

    // 카테고리 삭제 (매니저만 가능)
    @DeleteMapping("/{id}")
    @Operation(
            summary = "카테고리 삭제",
            description = "매니저가 카테고리를 삭제합니다."
    )
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        User user = getAuthorizedManager();
        ManagementDashboard dashboard = user.getManagementDashboard();

        // Service 호출 - 삭제 처리
        categoryService.deleteCategory(id, dashboard);

        return ResponseEntity.noContent().build();

    }

    // 매니저 권한 체크 메서드
    private User getAuthorizedManager() {
        Long userId = tokenService.getIdFromToken();
        User user = userService.findById(userId);

        if (user.getManagementDashboard() == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }

        if (!RoleType.MANAGER.equals(user.getRole().getRole())) {
            log.error("매니저 권한이 아닌 사용자가 접근 시도: {}", user.getRole().getRole());
            throw new BusinessLogicException(ExceptionCode.NOT_MANAGER);
        }

        return user;
    }

    // 사용자 권한 체크 메서드 (매니저가 아니어도 조회 가능하도록)
    private User getAuthorizedUser() {
        Long userId = tokenService.getIdFromToken();
        User user = userService.findById(userId);

        if (user.getManagementDashboard() == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }
        return user;
    }
}

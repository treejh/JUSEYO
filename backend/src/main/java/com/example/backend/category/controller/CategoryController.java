package com.example.backend.category.controller;

import com.example.backend.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.category.dto.response.CategoryResponseDTO;
import com.example.backend.category.service.CategoryService;
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

    /**
     * 🔹 카테고리 생성 (매니저만 가능)
     */
    @PostMapping
    @Operation(
            summary = "카테고리 생성",
            description = "매니저의 카테고리 생성을 처리합니다."
    )
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CategoryCreateRequestDTO dto) {
        // ✅ 사용자 검증 (GlobalExceptionHandler에서 처리될 예외 발생)
        User user = getAuthorizedManager();

        // 관리 페이지 대시보드 조회
        ManagementDashboard dashboard = user.getManagementDashboard();

        // Service 호출 - 생성 후 DTO 반환
        CategoryResponseDTO responseDTO = categoryService.createCategory(dto, dashboard);

        // 생성된 카테고리 반환
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    /**
     * 🔹 전체 카테고리 조회 (로그인한 유저 + 자신의 관리 페이지에 속한 것만 조회)
     */
    @GetMapping
    @Operation(
            summary = "전체 카테고리 조회",
            description = "대시보드 내 전체 카테고리 조회를 처리합니다."
    )
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        // ✅ 사용자 정보 가져오기
        User user = getAuthorizedUser();
        ManagementDashboard dashboard = user.getManagementDashboard();

        if (dashboard == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }

        // 2️⃣ Service 호출 - 전체 조회 후 DTO로 반환
        List<CategoryResponseDTO> response = categoryService.findAllCategoriesByDashboard(dashboard.getId());

        // 3️⃣ 조회된 리스트 반환
        return ResponseEntity.ok(response);
    }

    /**
     * 🔹 특정 카테고리 조회 (로그인한 유저 + 자신의 관리 페이지에 속할 때만 조회 가능)
     */
    @GetMapping("/{id}")
    @Operation(
            summary = "특정 카테고리 조회",
            description = "특정 카테고리 조회를 처리합니다."
    )
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable Long id) {
        // ✅ 사용자 정보 가져오기
        User user = getAuthorizedUser();
        ManagementDashboard dashboard = user.getManagementDashboard();

        if (dashboard == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }

        // 🔹 해당 카테고리가 관리 페이지에 속해 있는지 확인
        CategoryResponseDTO response = categoryService.findCategoryById(id);

        if (!response.getManagementDashboardId().equals(dashboard.getId())) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        // 2️⃣ DTO 반환
        return ResponseEntity.ok(response);
    }

    /**
     * 🔹 매니저 권한 체크 메서드
     */
    private User getAuthorizedManager() {
        Long userId = tokenService.getIdFromToken();
        User user = userService.findById(userId);

        if (user.getManagementDashboard() == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }

        if (!"MANAGER".equals(user.getRole())) {
            throw new BusinessLogicException(ExceptionCode.NOT_MANAGER);
        }
        return user;
    }

    /**
     * 🔹 사용자 권한 체크 메서드 (매니저가 아니어도 조회 가능하도록)
     */
    private User getAuthorizedUser() {
        Long userId = tokenService.getIdFromToken();
        User user = userService.findById(userId);

        if (user.getManagementDashboard() == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }
        return user;
    }
}

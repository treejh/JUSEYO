package com.example.backend.category.controller;

import com.example.backend.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.category.dto.response.CategoryResponseDTO;
import com.example.backend.category.service.CategoryService;
import com.example.backend.enums.RoleType;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

        CategoryResponseDTO responseDTO = categoryService.createCategory(dto, user);

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

        List<CategoryResponseDTO> response = categoryService.findAllCategories(user);

        return ResponseEntity.ok(response);
    }

    // 특정 카테고리 조회 (로그인한 유저 + 자신의 관리 페이지에 속할 때만 조회 가능)
    @GetMapping("/{id}")
    @Operation(
            summary = "특정 카테고리 조회",
            description = "특정 카테고리 조회를 처리합니다."
    )
    public ResponseEntity<CategoryResponseDTO> getCategoryById(
            @Parameter(
                    name = "id",
                    description = "조회할 카테고리 ID",
                    example = "1",
                    in = ParameterIn.PATH
            )
            @PathVariable("id") Long id) {
        User user = getAuthorizedUser();

        CategoryResponseDTO response = categoryService.findCategoryById(id, user);

        return ResponseEntity.ok(response);
    }

    // 카테고리 수정 (매니저만 가능)
    @PutMapping("/{id}")
    @Operation(
            summary = "카테고리 수정",
            description = "매니저가 카테고리를 수정합니다."
    )
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @Parameter(
                    name = "id",
                    description = "수정할 카테고리 ID",
                    example = "1",
                    in = ParameterIn.PATH
            )
            @PathVariable("id") Long id,

            @Valid @RequestBody CategoryUpdateRequestDTO dto
    ) {
        User user = getAuthorizedManager();

        CategoryResponseDTO responseDTO = categoryService.updateCategory(id, dto, user);

        return ResponseEntity.ok(responseDTO);
    }

    // 카테고리 삭제 (매니저만 가능)
    @DeleteMapping("/{id}")
    @Operation(
            summary = "카테고리 삭제",
            description = "매니저가 카테고리를 삭제합니다."
    )
    public ResponseEntity<Void> deleteCategory(
            @Parameter(
                    name = "id",
                    description = "삭제할 카테고리 ID",
                    example = "1",
                    in = ParameterIn.PATH
            )
            @PathVariable("id") Long id
    ) {
        User user = getAuthorizedManager();

        categoryService.deleteCategory(id, user);

        return ResponseEntity.noContent().build();
    }

    // 매니저 권한 체크 메서드
    private User getAuthorizedManager() {
        Long userId = tokenService.getIdFromToken();
        User user = userService.findById(userId);

        if (user.getRole().getRole() != RoleType.MANAGER) {
            throw new BusinessLogicException(ExceptionCode.NOT_MANAGER);
        }

        if (user.getManagementDashboard() == null && (user.getDepartment() == null || user.getDepartment().getManagementDashboard() == null)) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }

        return user;
    }

    // 일반 사용자 체크 메서드
    private User getAuthorizedUser() {
        Long userId = tokenService.getIdFromToken();
        User user = userService.findById(userId);

        if (user.getManagementDashboard() == null && (user.getDepartment() == null || user.getDepartment().getManagementDashboard() == null)) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }

        return user;
    }
}

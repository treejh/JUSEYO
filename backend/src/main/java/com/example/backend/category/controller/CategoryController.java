package com.example.backend.category.controller;

import com.example.backend.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.category.dto.response.CategoryResponseDTO;
import com.example.backend.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.category.service.CategoryService;
import com.example.backend.utils.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // 카테고리 생성
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> createCategory(@Valid @RequestBody CategoryCreateRequestDTO dto) {
        CategoryResponseDTO responseDTO = categoryService.createCategory(dto);
        return ResponseEntity.status(201)
                .body(ApiResponse.of(201, "카테고리 생성 성공", responseDTO));
    }

    // 모든 카테고리 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponseDTO>>> getAllCategories() {
        List<CategoryResponseDTO> response = categoryService.findAllCategories();
        return ResponseEntity.ok(ApiResponse.of(200, "모든 카테고리 조회 성공", response));
    }

    // 특정 카테고리 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> getCategoryById(@PathVariable Long id) {
        CategoryResponseDTO response = categoryService.findCategoryById(id);
        return ResponseEntity.ok(ApiResponse.of(200, "카테고리 조회 성공", response));
    }

    // 카테고리 수정
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> updateCategory(@PathVariable Long id,
                                                                           @Valid @RequestBody CategoryUpdateRequestDTO dto) {
        CategoryResponseDTO responseDTO = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(ApiResponse.of(200, "카테고리 수정 성공", responseDTO));
    }

    // 카테고리 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.of(200, "카테고리 삭제 성공"));
    }
}

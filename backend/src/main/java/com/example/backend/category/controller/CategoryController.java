package com.example.backend.category.controller;

import com.example.backend.category.dto.request.CategoryCreateRequestDTO;
import com.example.backend.category.dto.response.CategoryResponseDTO;
import com.example.backend.category.dto.request.CategoryUpdateRequestDTO;
import com.example.backend.category.entity.Category;
import com.example.backend.category.service.CategoryService;
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
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryCreateRequestDTO dto) {
        categoryService.createCategory(dto);
        return ResponseEntity.status(201).build(); // 201 Created
    }

    // 모든 카테고리 조회
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        List<CategoryResponseDTO> response = categoryService.findAllCategories();
        return ResponseEntity.ok(response);
    }

    // 특정 카테고리 조회
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable Long id) {
        CategoryResponseDTO response = categoryService.findCategoryById(id);
        return ResponseEntity.ok(response);
    }

    // 카테고리 수정
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable Long id,
                                                              @Valid @RequestBody CategoryUpdateRequestDTO dto) {
        Category updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(CategoryResponseDTO.fromEntity(updated));
    }

    // 카테고리 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}

package com.example.backend.department.controller;


import com.example.backend.base.dto.request.BoardRequestDto;
import com.example.backend.department.dto.DepartmentCreateRequestDTO;
import com.example.backend.department.dto.DepartmentResponseDTO;
import com.example.backend.department.dto.DepartmentUpdateRequestDTO;
import com.example.backend.department.entity.Department;
import com.example.backend.department.service.DepartmentService;
import com.example.backend.security.jwt.service.TokenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/department")
@RequiredArgsConstructor
public class DepartmentController {
    private final TokenService tokenService;
    private final DepartmentService departmentService;


    // 부서 생성
    @PostMapping
    public ResponseEntity createDepartment(@Valid @RequestBody DepartmentCreateRequestDTO dto) {
        departmentService.createDepartment(dto);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }


    // 부서 전체 조회
    @GetMapping
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        List<Department> departments = departmentService.findAllDepartments();
        List<DepartmentResponseDTO> response = departments.stream()
                .map(DepartmentResponseDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }

    // 부서명 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(
            @PathVariable Long id,
            @RequestBody @Valid DepartmentUpdateRequestDTO dto) {

        Department updated = departmentService.updateDepartment(id, dto);
        return ResponseEntity.ok(DepartmentResponseDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();  // 204 No Content 상태 반환
    }

}

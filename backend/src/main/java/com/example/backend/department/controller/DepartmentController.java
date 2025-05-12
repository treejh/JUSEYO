package com.example.backend.department.controller;


import com.example.backend.base.dto.request.BoardRequestDto;
import com.example.backend.department.dto.DepartmentCreateRequestDTO;
import com.example.backend.department.dto.DepartmentResponseDTO;
import com.example.backend.department.dto.DepartmentUpdateRequestDTO;
import com.example.backend.department.entity.Department;
import com.example.backend.department.service.DepartmentService;
import com.example.backend.enums.RoleType;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.role.RoleService;
import com.example.backend.role.entity.Role;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/departments")
@Tag(name = "부서 관리 컨트롤러")
@RequiredArgsConstructor
@Slf4j
public class DepartmentController {
    private final TokenService tokenService;
    private final DepartmentService departmentService;
    private final RoleService roleService;
    private final UserService userService;

    // 부서 생성
    @PostMapping
    @Operation(
            summary = "부서 생성",
            description = "매니저의 부서 생성을 처리합니다."
    )
    public ResponseEntity createDepartment(@Valid @RequestBody DepartmentCreateRequestDTO dto) {
        Long id = tokenService.getIdFromToken();
        User user = userService.findById(id); // 현재 로그인한 사용자
        ManagementDashboard dashboard = user.getManagementDashboard();

        if (dashboard == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }
        departmentService.createDepartment(dto, dashboard);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }


    // 부서 전체 조회
    @GetMapping
    @Operation(
            summary = "전체 부서 조회",
            description = "전체 부서 조회를 처리합니다."
    )
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        List<Department> departments = departmentService.findAllDepartments();
        List<DepartmentResponseDTO> response = departments.stream()
                .map(DepartmentResponseDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }

    // 특정 부서 조회
    @GetMapping("/{id}")
    @Operation(
            summary = "특정 부서 조회",
            description = "특정 부서 조회를 처리합니다."
    )
    public ResponseEntity<DepartmentResponseDTO> getDepartmentById(@PathVariable Long id) {
        Department department = departmentService.findDepartmentById(id);
        DepartmentResponseDTO response = DepartmentResponseDTO.fromEntity(department);
        return ResponseEntity.ok(response);
    }

    // 부서명 수정
    @Operation(
            summary = "부서 수정",
            description = "매니저의 부서명 수정을 처리합니다."
    )
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(
            @PathVariable Long id,
            @RequestBody @Valid DepartmentUpdateRequestDTO dto) {


        Department updated = departmentService.updateDepartment(id, dto);
        return ResponseEntity.ok(DepartmentResponseDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "부서 삭제",
            description = "매니저의 부서 삭제를 처리합니다."
    )
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {

        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();  // 204 No Content 상태 반환
    }

}

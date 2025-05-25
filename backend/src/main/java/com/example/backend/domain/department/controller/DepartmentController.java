package com.example.backend.domain.department.controller;


import com.example.backend.domain.department.dto.DepartmentCreateRequestDTO;
import com.example.backend.domain.department.dto.DepartmentResponseDTO;
import com.example.backend.domain.department.dto.DepartmentUpdateRequestDTO;
import com.example.backend.domain.department.entity.Department;
import com.example.backend.domain.department.service.DepartmentService;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.role.service.RoleService;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import retrofit2.http.Path;


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

    @GetMapping("/g")
    @Operation(
            summary = "관리 페이지에 속한 부서 페이지 조회",
            description = "회원가입 시, 관리페이지에 존재하는 부서를 조회할때 사용."
    )
    public ResponseEntity<Page<DepartmentResponseDTO>> getAllDepartmentsByManagement(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<Department> departments = departmentService.findAllDepartmentsByManagement(name, pageable);

        Page<DepartmentResponseDTO> response = departments.map(DepartmentResponseDTO::fromEntity);

        return ResponseEntity.ok(response);
    }


}

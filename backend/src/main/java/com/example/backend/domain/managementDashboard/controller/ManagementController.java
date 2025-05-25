package com.example.backend.domain.managementDashboard.controller;



import com.example.backend.domain.managementDashboard.dto.ManagementDashBoardRequestDto;
import com.example.backend.domain.managementDashboard.dto.ManagementDashBoardResponseDto;
import com.example.backend.domain.managementDashboard.dto.ManagementDashboardUpdateRequestDto;
import com.example.backend.domain.managementDashboard.service.ManagementDashboardService;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.dto.response.UserSearchResponseDto;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.service.UserService;
import com.example.backend.global.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/management")
@Validated
@RequiredArgsConstructor
@Tag(name = "Management", description = "관리 페이지 API")
public class ManagementController {

    private final ManagementDashboardService managementDashboardService;
    private final TokenService tokenService;
    private final UserService userService;

    @Operation(summary = "관리 페이지 등록", description = "새로운 관리 페이지를 등록합니다.")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<ManagementDashBoardResponseDto> addManagementDashboard(
            @RequestBody @Valid ManagementDashBoardRequestDto managementDashBoardRequestDto) {
        return ResponseEntity.ok(managementDashboardService.createManagementDashBoard(managementDashBoardRequestDto));
    }

    @Operation(summary = "관리 페이지 단건 조회", description = "ID를 기반으로 특정 관리 페이지를 조회합니다.")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ManagementDashBoardResponseDto> getManagementDashboard(
            @Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(managementDashboardService.getManagementDashBoard(id));
    }

    @Operation(summary = "관리 페이지 수정", description = "ID를 기준으로 관리 페이지를 수정합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}")
    public ResponseEntity<ManagementDashBoardResponseDto> updateManagementDashboard(
            @Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id,
            @RequestBody ManagementDashboardUpdateRequestDto managementDashBoardRequestDto) {
        return ResponseEntity.ok(managementDashboardService.updateManagementDashBoard(managementDashBoardRequestDto, id));
    }

    @Operation(summary = "관리 페이지 내 일반회원 조회",
            description = "해당 관리페이지에 속한 모든 일반 회원을 반환합니다.")
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    @GetMapping("/{id}/users")
    public ResponseEntity<List<UserSearchResponseDto>> getUsersByManagement(
            @PathVariable Long id) {
        // 소속 체크
        Long currentUserId = tokenService.getIdFromToken();
        User me = userService.findById(currentUserId);
        if (!me.getManagementDashboard().getId().equals(id)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        // 2) 결과 필터링: 일반회원만 조회
        List<UserSearchResponseDto> users = managementDashboardService
                .findUsersByManagementDashboard(id)
                .stream()
                .filter(dto -> "USER".equals(dto.getRole()))
                .toList();

        return ResponseEntity.ok(users);
    }

    @Operation(
            summary = "관리 페이지 내 매니저 조회",
            description = "해당 관리페이지에 속한 모든 매니저를 반환합니다."
    )
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    @GetMapping("/{id}/managers")
    public ResponseEntity<List<UserSearchResponseDto>> getManagersByManagement(
            @PathVariable Long id) {

        // 1) 소속 체크
        Long currentUserId = tokenService.getIdFromToken();
        User me = userService.findById(currentUserId);
        if (!me.getManagementDashboard().getId().equals(id)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        // 2) 결과 필터링: 매니저만
        List<UserSearchResponseDto> managers = managementDashboardService
                .findUsersByManagementDashboard(id)
                .stream()
                .filter(dto -> "MANAGER".equals(dto.getRole()))
                .toList();

        return ResponseEntity.ok(managers);
    }

    @Operation(
            summary = "관리 페이지 존재하는지 검증 ",
            description = "관리 페이지 이름을 입력으로 받고, 검증할 수 있습니다."
    )
    @PostMapping("/validation")
    public ResponseEntity<ApiResponse<Boolean>> validationName(@RequestParam @Valid String name) {
        boolean response = managementDashboardService.isValidName(name);
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "관리 페이지 검증 성공", response),
                HttpStatus.OK
        );
    }


}

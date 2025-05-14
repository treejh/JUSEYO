package com.example.backend.managementDashboard.controller;


import com.example.backend.enums.Status;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.managementDashboard.dto.ManagementDashBoardRequestDto;
import com.example.backend.managementDashboard.dto.ManagementDashBoardResponseDto;
import com.example.backend.managementDashboard.dto.ManagementDashboardUpdateRequestDto;
import com.example.backend.managementDashboard.service.ManagementDashboardService;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.dto.response.UserSearchResponseDto;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @Operation(summary = "관리 페이지 목록 조회", description = "승인 여부에 따라 관리 페이지 목록을 페이징 처리하여 조회합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<ManagementDashBoardResponseDto>> getManagementDashboards(
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "상태값 (예: ACTIVE, INACTIVE)", schema = @Schema(implementation = Status.class))
            @RequestParam(defaultValue = "ACTIVE") Status status,
            @Parameter(description = "승인 여부 (true: 승인된 페이지만, false: 미승인 페이지만)") @RequestParam(defaultValue = "true") boolean approval
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return ResponseEntity.ok(managementDashboardService.findAllManagementDashBoard(pageable,status,approval));
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

    @Operation(summary = "관리 페이지 삭제", description = "ID를 기준으로 관리 페이지를 삭제합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManagementDashboard(
            @Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id) {
        managementDashboardService.deleteManagementDashBoard(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "관리 페이지 승인", description = "ID를 기준으로 관리 페이지를 승인 처리합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/approve/{id}")
    public ResponseEntity<Void> approveManagementDashboard(
            @Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id) {
        managementDashboardService.approvalManagementDashBoard(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "관리 페이지 내 회원 조회",
            description = "해당 관리페이지에 속한 모든 회원을 반환합니다.")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','USER')")
    @GetMapping("/{id}/users")
    public ResponseEntity<List<UserSearchResponseDto>> getUsersByManagement(
            @Parameter(description = "관리 페이지 ID") @PathVariable Long id) {

        // 1) 토큰에서 유저 가져오기
        Long currentUserId = tokenService.getIdFromToken();
        User me = userService.findById(currentUserId);

        // 2) 본인 대시보드 ID와 요청한 ID 비교
        Long myMgmtId = me.getManagementDashboard().getId();
        if (!myMgmtId.equals(id)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        // 3) 같은 대시보드 사용자만 조회
        List<UserSearchResponseDto> users =
                managementDashboardService.findUsersByManagementDashboard(id);

        return ResponseEntity.ok(users);
    }
}

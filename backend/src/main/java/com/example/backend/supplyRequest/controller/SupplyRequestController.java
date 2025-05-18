package com.example.backend.supplyRequest.controller;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.supplyRequest.dto.request.SupplyRequestRequestDto;
import com.example.backend.supplyRequest.dto.response.SupplyRequestResponseDto;
import com.example.backend.supplyRequest.service.SupplyRequestService;
import com.example.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/supply-requests")
@RequiredArgsConstructor
@Tag(name = "비품 요청 관리", description = "비품 요청 조회·승인·거절 API")
public class SupplyRequestController {
    private final SupplyRequestService supplyRequestService;
    private final TokenService tokenService;
    private final UserService userService;

    /**
     * 비품 요청 생성
     */
    @Operation(summary = "비품 요청 생성", description = "신규 비품 요청을 생성합니다.")
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public ResponseEntity<SupplyRequestResponseDto> createRequest(
            @Valid @RequestBody SupplyRequestRequestDto dto) {
        SupplyRequestResponseDto response = supplyRequestService.createRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     *  대기 중인 비품 요청 리스트 조회 (매니저 전용)
     */
    @Operation(summary = "대기 중인 요청 조회", description = "매니저 권한으로 현재 대시보드에 대기중인 요청 리스트를 조회합니다.")
    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<SupplyRequestResponseDto>> getPendingRequests() {
        // 1) 토큰에서 유저 ID → User → ManagementDashboard ID 추출
        Long userId = tokenService.getIdFromToken();
        Long mgmtId = userService.findById(userId)
                .getManagementDashboard()
                .getId();

        // 2) 해당 대시보드의 PENDING 요청만 조회
        List<SupplyRequestResponseDto> list =
                supplyRequestService.findRequestsByManagementAndStatus(mgmtId, ApprovalStatus.REQUESTED);
        return ResponseEntity.ok(list);
    }

    /**
     *  비품 요청 승인 (매니저 전용)
     */
    @Operation(summary = "비품 요청 승인", description = "매니저 권한으로 특정 요청을 승인합니다.")
    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> approveRequest(@PathVariable Long requestId) {
        supplyRequestService.approveRequest(requestId);
        return ResponseEntity.ok().build();
    }

    /**
     *  비품 요청 거절 (매니저 전용)
     */
    @Operation(summary = "비품 요청 거절", description = "매니저 권한으로 특정 요청을 거절합니다.")
    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<SupplyRequestResponseDto> rejectRequest(@PathVariable Long requestId) {
        SupplyRequestResponseDto response = supplyRequestService.rejectRequest(requestId);
        return ResponseEntity.ok(response);
    }

    /**  내 요청 리스트 */
    @Operation(summary = "내 요청 조회", description = "사용자 권한으로 본인이 요청한 비품 리스트를 조회합니다.")
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public ResponseEntity<List<SupplyRequestResponseDto>> getMyRequests() {
        return ResponseEntity.ok(supplyRequestService.getMyRequests());
    }

    /**  내 요청 수정, 매니저도 가능 */
    @Operation(summary = "내 요청 수정", description = "REQUESTED 상태인 본인의 요청을 수정합니다.")
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public ResponseEntity<SupplyRequestResponseDto> updateMyRequest(
            @PathVariable Long id,
            @RequestBody SupplyRequestRequestDto dto) {
        SupplyRequestResponseDto updated = supplyRequestService.updateMyRequest(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**  매니저용 전체 요청 리스트 조회 */
    @Operation(summary = "전체 요청 조회", description = "매니저 권한으로 본 대시보드의 모든 요청 리스트를 조회합니다.")
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<SupplyRequestResponseDto>> getAllRequests() {
        return ResponseEntity.ok(supplyRequestService.getAllRequests());
    }
}

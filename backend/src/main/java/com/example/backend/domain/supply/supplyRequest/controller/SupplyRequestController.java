package com.example.backend.domain.supply.supplyRequest.controller;

import com.example.backend.domain.supply.supplyRequest.dto.request.SupplyRequestRequestDto;
import com.example.backend.domain.supply.supplyRequest.dto.response.LentItemDto;
import com.example.backend.domain.supply.supplyRequest.service.SupplyRequestService;
import com.example.backend.domain.user.service.UserService;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.supply.supplyRequest.dto.response.SupplyRequestResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


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
    public ResponseEntity<SupplyRequestResponseDto> approveRequest(
            @PathVariable Long requestId
    ) {
        SupplyRequestResponseDto dto = supplyRequestService.updateRequestStatus(
                requestId,
                ApprovalStatus.APPROVED
        );
        return ResponseEntity.ok(dto);
    }

    /**
     *  비품 요청 거절 (매니저 전용)
     */
    @Operation(summary = "비품 요청 거절", description = "매니저 권한으로 특정 요청을 거절합니다.")
    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<SupplyRequestResponseDto> rejectRequest(@PathVariable Long requestId) {
        SupplyRequestResponseDto dto = supplyRequestService.rejectRequest(requestId);
        return ResponseEntity.ok(dto);
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

    @GetMapping("/status-count/{userId}")
    @Operation(
            summary = "유저별 승인 상태별 비품 요청 건수 조회",
            description = "지정된 userId에 대해 ApprovalStatus(REQUESTED, APPROVED, REJECTED) 별 SupplyRequest의 건수를 반환합니다."
    )
    public ResponseEntity<Map<ApprovalStatus, Long>> getApprovalStatusCountsByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(supplyRequestService.getSupplyRequestCountsByApprovalStatus(userId));
    }
    @GetMapping("/{userId}/lent-items")
    @Operation(summary = "사용자의 대여 물품 조회", description = "특정 사용자가 대여 중인 물품 목록을 조회합니다.")
    public Page<LentItemDto> getLentItems(
            @PathVariable Long userId,
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return supplyRequestService.getLentItems(userId, pageable);
    }

    // 본인 요청 삭제
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMyRequest(@PathVariable Long id) {
        supplyRequestService.deleteRequest(id);
    }

    /**
     * 단일 비품 요청 조회 (본인 혹은 매니저 권한)
     */
    @GetMapping("/{requestId}")
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public ResponseEntity<SupplyRequestResponseDto> getById(@PathVariable Long requestId) {
        SupplyRequestResponseDto dto = supplyRequestService.getRequestById(requestId);
        return ResponseEntity.ok(dto);
    }


    /** 반납 내역서가 생성되지 않은 내 요청 리스트 */
    @Operation(
            summary = "반납 내역서가 생성되지 않은 내 비품 요청 목록 조회",
            description = "사용자 권한으로 로그인한 사용자가 본인이 요청한 비품 요청 중, 반납 내역서가 아직 생성되지 않은 목록을 조회합니다."
    )
    @GetMapping("/except/me")
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public ResponseEntity<List<SupplyRequestResponseDto>> getMyRequestsExceptWithReturnSheet() {
        return ResponseEntity.ok(supplyRequestService.getMyRequestsExceptReturn());
    }
}

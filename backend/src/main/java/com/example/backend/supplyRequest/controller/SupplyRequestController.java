package com.example.backend.supplyRequest.controller;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.supplyRequest.dto.response.SupplyRequestResponseDto;
import com.example.backend.supplyRequest.service.SupplyRequestService;
import com.example.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
     * 🔹 대기 중인 비품 요청 리스트 조회 (매니저 전용)
     */
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
     * 🔹 비품 요청 승인 (매니저 전용)
     */
    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> approveRequest(@PathVariable Long requestId) {
        supplyRequestService.approveRequest(requestId);
        return ResponseEntity.ok().build();
    }

    /**
     * 🔹 비품 요청 거절 (매니저 전용)
     */
    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> rejectRequest(@PathVariable Long requestId) {
        supplyRequestService.rejectRequest(requestId);
        return ResponseEntity.ok().build();
    }

}

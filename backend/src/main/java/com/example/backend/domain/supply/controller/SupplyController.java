package com.example.backend.domain.supply.controller;

import com.example.backend.domain.supply.service.SupplyService;
import com.example.backend.enums.ApprovalStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/supply")
@RequiredArgsConstructor
public class SupplyController {

    private final SupplyService supplyService;

    @Operation(summary = "사용자별 승인 상태 카운트 조회", description = "해당 사용자의 SupplyRequest 및 SupplyReturn 항목을 approvalStatus 기준으로 집계하여 반환합니다.")
    @GetMapping("/approval-status-counts/{userId}")
    public ResponseEntity<Map<ApprovalStatus, Long>> getApprovalStatusCounts(
            @Parameter(description = "사용자 ID", required = true, example = "1")
            @PathVariable Long userId) {

        Map<ApprovalStatus, Long> result = supplyService.getTotalSupplyCountsByApprovalStatus(userId);
        return ResponseEntity.ok(result);
    }
}


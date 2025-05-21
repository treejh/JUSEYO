package com.example.backend.analysis.controller;

import com.example.backend.analysis.dto.CategorySummaryDTO;
import com.example.backend.analysis.dto.ItemUsageFrequencyDTO;
import com.example.backend.analysis.dto.MonthlyInventoryDTO;
import com.example.backend.analysis.service.InventoryAnalysisService;
import com.example.backend.enums.Outbound;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analysis")
@RequiredArgsConstructor
@Tag(name = "비품 분석", description = "비품 관련 통계/분석 API")
public class InventoryAnalysisController {

    private final InventoryAnalysisService analysisService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    @Operation(summary = "카테고리별 수량 및 종류 분석", description = "모든 카테고리에 대해 비품의 총 수량과 종류 수를 집계합니다.")
    @GetMapping("/category-summary")
    public ResponseEntity<Map<String, CategorySummaryDTO>> getCategorySummary() {
        return ResponseEntity.ok(analysisService.getCategorySummary());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    @Operation(summary = "품목별 사용 빈도 상위 N개", description = "Redis ZSet을 기반으로 출고된 품목의 사용 빈도 상위 N개를 조회합니다.")
    @GetMapping("/item-usage")
    public ResponseEntity<List<ItemUsageFrequencyDTO>> getItemUsageRanking(
            @RequestParam(defaultValue = "10") int topN) {
        return ResponseEntity.ok(analysisService.getItemUsageRanking(topN));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    @Operation(summary = "월별 입출고 수량 요약", description = "입고 및 출고 내역을 월별로 집계하여 1월부터 12월까지 통계를 제공합니다.")
    @GetMapping("/monthly-summary")
    public ResponseEntity<List<MonthlyInventoryDTO>> getMonthlySummary(
            @RequestParam(defaultValue = "2025") int year) {
        return ResponseEntity.ok(analysisService.getMonthlyInventorySummary(year));
    }

    @Operation(
            summary = "전체 아이템 인스턴스 Outbound 통계",
            description = "모든 아이템 인스턴스에 대해 Outbound 상태(AVAILABLE, LEND 등)별 개수를 반환합니다. 결과는 Redis 캐시를 사용하며 약 10분간 유지됩니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "성공적으로 상태별 개수를 반환했습니다."
    )
    @GetMapping("/outbound-summary")
    public ResponseEntity<Map<Outbound, Long>> getGlobalOutboundSummary() {
        Map<Outbound, Long> cached = analysisService.getCachedOutboundSummary();
        if (cached != null) return ResponseEntity.ok(cached);

        Map<Outbound, Long> fresh = analysisService.loadAndCacheOutboundSummary();
        return ResponseEntity.ok(fresh);
    }

}


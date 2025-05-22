package com.example.backend.domain.recommendation.controller;

import com.example.backend.domain.recommendation.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommend")
@RequiredArgsConstructor
@Tag(name = "AI 추천", description = "사용자 기반 비품 추천")
public class RecommendationController {

    private final RecommendationService recommendationService;

    //협업 필터링 "나랑 비슷한 사람”이 자주 쓴 품목 추천"
    @PreAuthorize("hasAnyRole('MANAGER','USER')")
    @Operation(summary = "사용자 비품 추천", description = "출고 이력을 기반으로 AI가 비슷한 사용자에게 자주 쓰이는 품목을 추천합니다.")
    @GetMapping
    public ResponseEntity<List<String>> getRecommendations(@RequestParam Long userId) {
        List<String> recommendedItems = recommendationService.getRecommendedItems(userId);
        return ResponseEntity.ok(recommendedItems);
    }

    //연관 규칙 기반 추천 "같이 자주 출고된 품목”을 분석해서 추천
    @PreAuthorize("hasAnyRole('MANAGER','USER')")
    @Operation(summary = "연관 품목 추천", description = "특정 품목과 자주 같이 사용된 품목을 추천합니다.")
    @GetMapping("/association")
    public ResponseEntity<List<String>> getAssociatedItems(@RequestParam String itemName) {
        List<String> result = recommendationService.getAssociationRecommendations(itemName);
        return ResponseEntity.ok(result);
    }
}

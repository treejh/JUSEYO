package com.example.backend.global.redis;

import com.example.backend.domain.analysis.service.InventoryAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cache")
@RequiredArgsConstructor
public class CacheController {

    private final InventoryAnalysisService analysisService;

    @DeleteMapping("/category-summary")
    public ResponseEntity<String> clearCategoryCache() {
        analysisService.clearCategoryCache();
        return ResponseEntity.ok("카테고리 캐시 삭제 완료");
    }
}

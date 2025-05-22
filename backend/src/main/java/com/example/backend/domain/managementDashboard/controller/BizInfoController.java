package com.example.backend.domain.managementDashboard.controller;

import com.example.backend.domain.managementDashboard.service.BizInfoService;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/biz")
@RequiredArgsConstructor
@Tag(name = "Business Info", description = "사업자 정보 조회 API")
public class BizInfoController {

    private final BizInfoService bizInfoService;

    @Operation(summary = "사업자 등록번호 검증", description = "외부 API를 호출하여 사업자 등록번호의 유효성을 확인합니다.")
    @PostMapping("/check")
    public ResponseEntity<?> check(
            @Parameter(description = "사업자등록번호 (10자리 숫자)") @RequestParam String bno) {
        Map<String, Object> result = bizInfoService.checkBusinessExistence(bno);
        return ResponseEntity.ok(result);
    }
}


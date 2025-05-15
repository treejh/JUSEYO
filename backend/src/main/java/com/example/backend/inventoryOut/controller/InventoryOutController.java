package com.example.backend.inventoryOut.controller;

import com.example.backend.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryOut.dto.response.InventoryOutResponseDto;
import com.example.backend.inventoryOut.service.InventoryOutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory-out")
@RequiredArgsConstructor
public class InventoryOutController {
    private final InventoryOutService service;

    @PostMapping
    public InventoryOutResponseDto removeOutbound(@RequestBody InventoryOutRequestDto dto) {
        return service.removeOutbound(dto);
    }

    // 매니저용 - 같은 관리페이지 전체 출고내역 조회
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<InventoryOutResponseDto>> getAllOutbound() {
        return ResponseEntity.ok(service.getAllOutbound());
    }

    // 일반회원용 - 본인이 요청한 출고내역만 조회
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<InventoryOutResponseDto>> getMyOuts() {
        return ResponseEntity.ok(service.getMyOuts());
    }
}
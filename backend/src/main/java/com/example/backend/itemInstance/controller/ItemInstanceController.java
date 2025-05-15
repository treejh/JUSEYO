package com.example.backend.itemInstance.controller;

import com.example.backend.itemInstance.dto.request.CreateItemInstanceRequestDto;
import com.example.backend.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.itemInstance.dto.response.ItemInstanceResponseDto;
import com.example.backend.itemInstance.service.ItemInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/item-instances")
@RequiredArgsConstructor
@Validated
public class ItemInstanceController {
    private final ItemInstanceService service;

    // (1) 개별 인스턴스 생성 - 매니저만
    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemInstanceResponseDto create(
            @RequestBody CreateItemInstanceRequestDto dto
    ) {
        return service.createInstance(dto);
    }

    // (2) 특정 아이템 인스턴스 조회 - 로그인한 모든 유저
    @GetMapping("/by-item/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ItemInstanceResponseDto>> listByItem(
            @PathVariable Long itemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortField,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        Page<ItemInstanceResponseDto> result =
                service.getByItemPage(itemId, search, fromDate, toDate, page, size, sortField, sortDir);
        return ResponseEntity.ok(result);
    }

    // (3) 인스턴스 상태 변경 - 매니저만
    @PreAuthorize("hasRole('MANAGER')")
    @PatchMapping("/{instanceId}/status")
    public ItemInstanceResponseDto updateStatus(
            @PathVariable Long instanceId,
            @RequestBody UpdateItemInstanceStatusRequestDto dto
    ) {
        return service.updateStatus(instanceId, dto);
    }
}

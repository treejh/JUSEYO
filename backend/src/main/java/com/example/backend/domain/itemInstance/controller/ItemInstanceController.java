package com.example.backend.domain.itemInstance.controller;

import com.example.backend.domain.itemInstance.service.ItemInstanceService;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.domain.itemInstance.dto.request.CreateItemInstanceRequestDto;
import com.example.backend.domain.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.domain.itemInstance.dto.response.ItemInstanceResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    @Operation(summary = "아이템 인스턴스 조회", description = "페이징, 검색, 날짜, 상태(status), 출고유형(outbound) 필터 가능")
    @GetMapping("/by-item/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ItemInstanceResponseDto>> listByItem(
            @PathVariable Long itemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortField,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Outbound outbound,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        Page<ItemInstanceResponseDto> result =
                service.getByItemPage(
                        itemId, search, status, outbound, fromDate, toDate, page, size, sortField, sortDir
                );
        return ResponseEntity.ok(result);
    }

    // (3) 인스턴스 상태 변경 - 매니저만
    @Operation(summary = "아이템 인스턴스 수정")
    @PreAuthorize("hasRole('MANAGER')")
    @PatchMapping("/{instanceId}/status")
    public ItemInstanceResponseDto updateStatus(
            @PathVariable Long instanceId,
            @RequestBody UpdateItemInstanceStatusRequestDto dto
    ) {
        return service.updateStatus(instanceId, dto);
    }

    // (4) 인스턴스 소프트 삭제 - 매니저만
    @Operation(summary = "아이템 인스턴스 삭제(소프트)", description = "해당 인스턴스의 status=STOP 처리")
    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/{instanceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteInstance(@PathVariable Long instanceId) {
        service.softDeleteInstance(instanceId);
    }

    /**
     * 개별 자산 목록 조회 (페이지네이션 + 검색)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','USER')") 
    public Page<ItemInstanceResponseDto> getItemInstances(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size);

        return service.getByItemPage(pageable, keyword);
    }
}

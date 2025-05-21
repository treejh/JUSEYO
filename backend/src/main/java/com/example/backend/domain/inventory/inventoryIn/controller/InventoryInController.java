package com.example.backend.domain.inventory.inventoryIn.controller;

import com.example.backend.domain.inventory.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.domain.inventory.inventoryIn.service.InventoryInService;
import com.example.backend.enums.Inbound;
import com.example.backend.domain.inventory.inventoryIn.dto.response.InventoryInResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/v1/inventory-in")
@RequiredArgsConstructor
@Tag(name = "Inventory In", description = "입고 관리 API")
public class InventoryInController {

    private final InventoryInService service;

    @Operation(summary = "입고 등록", description = "새로운 입고 내역을 등록합니다.")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public InventoryInResponseDto addInbound(@ModelAttribute @Valid InventoryInRequestDto dto) {
        return service.addInbound(dto);
    }

    @Operation(summary = "입고 목록 조회", description = "입고 내역을 페이징 조회합니다. 필터로 입고 유형(Inbound)을 선택할 수 있습니다.")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping
    public Page<InventoryInResponseDto> getAllInbounds(
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "입고 유형 (예: PURCHASE, RETURN, REPAIR, REPAIR_RETURN)",
                    schema = @Schema(implementation = Inbound.class))
            @RequestParam(required = false) Inbound inbound
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return service.getInventoryIns(pageable, inbound);
    }

    @Operation(summary = "입고 상세 조회", description = "입고 ID를 통해 단일 입고 내역을 조회합니다.")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/{id}")
    public InventoryInResponseDto getInventoryIn(
            @Parameter(description = "입고 ID", example = "1") @PathVariable(name = "id") Long id
    ) {
        return service.getInventoryIn(id);
    }
}

package com.example.backend.supplyReturn.controller;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.supplyReturn.dto.request.SupplyReturnRequestDto;
import com.example.backend.supplyReturn.dto.request.SupplyReturnStatusUpdateRequestDto;
import com.example.backend.supplyReturn.dto.response.SupplyReturnResponseDto;
import com.example.backend.supplyReturn.service.SupplyReturnService;
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
@RequestMapping("/api/v1/supply-return")
@RequiredArgsConstructor
@Tag(name = "Supply Return", description = "비품 반납 API")
public class SupplyReturnController {

    private final SupplyReturnService supplyReturnService;

    @Operation(summary = "비품 반납 요청 생성", description = "비품 반납서를 생성합니다.")
    @PostMapping
    public SupplyReturnResponseDto add(
            @Parameter(description = "반납 요청 DTO", required = true)
            @RequestBody @Valid SupplyReturnRequestDto supplyReturnRequestDto) {
        return supplyReturnService.addSupplyReturn(supplyReturnRequestDto);
    }

    @Operation(summary = "비품 반납 목록 조회", description = "비품 반납서를 페이징 조회합니다. 상태 필터링 가능.")
    @GetMapping
    public Page<SupplyReturnResponseDto> getSupplyReturns(
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "요청 상태 (예: RETURN_PENDING, RETURNED)",
                    schema = @Schema(implementation = ApprovalStatus.class))
            @RequestParam(required = false) ApprovalStatus approvalStatus
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return supplyReturnService.getSupplyReturns(pageable, approvalStatus);
    }

    @Operation(summary = "비품 반납 단건 조회", description = "ID로 단일 반납서를 조회합니다.")
    @GetMapping("/{id}")
    public SupplyReturnResponseDto getSupplyReturn(
            @Parameter(description = "반납서 ID", example = "12")
            @PathVariable(name = "id") Long id) {
        return supplyReturnService.getSupplyReturn(id);
    }

    @Operation(summary = "반납서 상태 변경", description = "반납 요청 상태를 변경합니다. 예: RETURN_PENDING → RETURNED")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}")
    public SupplyReturnResponseDto updateSupplyReturnStatus(
            @Parameter(description = "반납서 ID", example = "12")
            @PathVariable(name = "id") Long id,

            @RequestBody @Valid SupplyReturnStatusUpdateRequestDto dto) {
        return supplyReturnService.updateSupplyReturn(id, dto.getApprovalStatus());
    }
}

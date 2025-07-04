package com.example.backend.domain.supply.supplyReturn.controller;

import com.example.backend.domain.supply.supplyReturn.dto.request.SupplyReturnRequestDto;
import com.example.backend.domain.supply.supplyReturn.dto.request.SupplyReturnStatusUpdateRequestDto;
import com.example.backend.domain.supply.supplyReturn.dto.request.SupplyReturnUpdateRequestDto;
import com.example.backend.domain.supply.supplyReturn.service.SupplyReturnService;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.domain.excel.service.ExcelExportService;
import com.example.backend.domain.supply.supplyReturn.dto.response.SupplyReturnResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/supply-return")
@RequiredArgsConstructor
@Tag(name = "Supply Return", description = "비품 반납 API")
public class SupplyReturnController {

    private final SupplyReturnService supplyReturnService;
    private final SupplyReturnService returnService;
    private final ExcelExportService excelExportService;

    @Operation(summary = "비품 반납 요청 생성", description = "비품 반납서를 생성합니다.")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    public SupplyReturnResponseDto add(
            @Parameter(description = "반납 요청 DTO", required = true)
            @RequestBody @Valid SupplyReturnRequestDto supplyReturnRequestDto) {
        return supplyReturnService.addSupplyReturn(supplyReturnRequestDto);
    }


    @Operation(summary = "비품 반납 목록 조회", description = "비품 반납서를 페이징 조회합니다. 상태 필터링 가능.")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    public SupplyReturnResponseDto getSupplyReturn(
            @Parameter(description = "반납서 ID", example = "12")
            @PathVariable(name = "id") Long id) {
        return supplyReturnService.getSupplyReturn(id);
    }

    @Operation(
            summary = "반납서 상태 변경",
            description = "반납 요청 상태를 변경합니다. 예: RETURN_PENDING → RETURNED"
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping(
            path = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public SupplyReturnResponseDto updateSupplyReturnStatus(
            @Parameter(description = "반납서 ID", example = "12")
            @PathVariable(name = "id") Long id,
            @ParameterObject @ModelAttribute @Valid SupplyReturnStatusUpdateRequestDto dto) {
        return supplyReturnService.updateSupplyReturn(id, dto);
    }

    // 반납 요청서 엑셀 다운로드
    @GetMapping("/supply-returns/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    public void downloadSupplyReturnsExcel(HttpServletResponse response) throws Exception {
        var data = returnService.getAllReturnsForExcel();
        excelExportService.exportSupplyReturns(data, response);
    }
    @Operation(summary = "내 비품 반납 목록 조회", description = "로그인한 사용자의 비품 반납서를 조회합니다.")
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    public Page<SupplyReturnResponseDto> getMySupplyReturns(
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "요청 상태 (예: RETURN_PENDING, RETURNED)",
                    schema = @Schema(implementation = ApprovalStatus.class))
            @RequestParam(required = false) ApprovalStatus approvalStatus
    ) {

        Pageable pageable = PageRequest.of(page - 1, size);
        return supplyReturnService.getUserSupplyReturns( pageable, approvalStatus);
    }

    @Operation(summary = "비품 반납 삭제", description = "비품 반납서를 삭제합니다 .")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    public ResponseEntity deleteSupplyReturn(@PathVariable(name = "id") Long id) {
        supplyReturnService.deleteSupplyReturn(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "비품 반납 수정", description = "기존 반납서의 정보를 수정합니다.")
    @PostMapping("/{id}/update")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    public SupplyReturnResponseDto updateSupplyReturn(
            @Parameter(description = "반납서 ID", example = "12")
            @PathVariable(name = "id") Long id,

            @Parameter(description = "수정할 반납서 정보 DTO", required = true)
            @RequestBody @Valid SupplyReturnUpdateRequestDto dto) {

        return supplyReturnService.updateSupplyReturn(dto,id);
    }


}

package com.example.backend.domain.inventory.inventoryOut.controller;

import com.example.backend.domain.inventory.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.domain.inventory.inventoryOut.dto.response.InventoryOutResponseDto;
import com.example.backend.domain.inventory.inventoryOut.service.InventoryOutService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory-out")
@RequiredArgsConstructor
public class InventoryOutController {
    private final InventoryOutService service;

    @Operation(
            summary = "출고 처리",
            description = "매니저 또는 일반 사용자 권한으로 물품 출고를 처리하고 출고 내역을 생성합니다."
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public ResponseEntity<InventoryOutResponseDto> removeOutbound(
            @RequestBody InventoryOutRequestDto dto) {
        InventoryOutResponseDto response = service.removeOutbound(dto);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "전체 출고내역 조회",
            description = "매니저 권한으로 관리 대시보드 소속 모든 출고내역을 페이징, 정렬, 검색, 날짜 필터링하여 조회합니다."
    )
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Page<InventoryOutResponseDto>> getOutbound(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortField,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        Page<InventoryOutResponseDto> result = service.getOutbound(
                search, fromDate, toDate, page, size, sortField, sortDir);
        return ResponseEntity.ok(result);
    }

    @Operation(
            summary = "전체 출고내역 Excel 내보내기",
            description = "매니저 권한으로 조회된 전체 출고내역을 Excel 파일로 다운로드합니다."
    )
    @GetMapping("/export")
    @PreAuthorize("hasRole('MANAGER')")
    public void exportOutbound(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse response
    ) throws IOException {
        List<InventoryOutResponseDto> list = service.getOutboundList(search, fromDate, toDate);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment;filename=inventory-out.xlsx");
        service.writeExcel(list, response.getOutputStream());
    }

    @Operation(
            summary = "내 출고내역 Excel 내보내기",
            description = "사용자 본인의 출고내역을 Excel 파일로 다운로드합니다."
    )
    @GetMapping("/me/export")
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public void exportMyOutbound(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse response
    ) throws IOException {
        // service 에서 내 출고내역 리스트만 뽑아오는 메서드 호출
        List<InventoryOutResponseDto> list = service.getMyOutboundList(search, fromDate, toDate);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment;filename=my-inventory-out.xlsx");
        service.writeExcel(list, response.getOutputStream());
    }

    @Operation(
            summary = "내 출고내역 조회",
            description = "일반 사용자 또는 매니저 권한으로 본인이 출고한 내역을 페이징, 정렬, 검색, 날짜 필터링하여 조회합니다."
    )
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public ResponseEntity<Page<InventoryOutResponseDto>> getMyOutbound(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortField,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
                Page<InventoryOutResponseDto> result = service.getMyOutbound(
                                search, fromDate, toDate, page, size, sortField, sortDir);
                return ResponseEntity.ok(result);
            }
}

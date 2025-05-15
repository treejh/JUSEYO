package com.example.backend.inventoryOut.controller;

import com.example.backend.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryOut.dto.response.InventoryOutResponseDto;
import com.example.backend.inventoryOut.service.InventoryOutService;
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

    /** 출고 처리 (매니저, 일반회원) */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','MANAGER')")
    public ResponseEntity<InventoryOutResponseDto> removeOutbound(
            @RequestBody InventoryOutRequestDto dto) {
        InventoryOutResponseDto response = service.removeOutbound(dto);
        return ResponseEntity.ok(response);
    }

    /** 페이징·정렬·검색·날짜 필터 조회 (매니저) */
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

    /** Excel 내보내기 (매니저) */
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

    /** 내 출고내역 조회 (일반회원) */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
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

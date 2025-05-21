package com.example.backend.domain.excel.controller;

import com.example.backend.domain.excel.service.ExcelExportService;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.domain.Inventory.inventoryIn.service.InventoryInService;
import com.example.backend.domain.Inventory.inventoryOut.service.InventoryOutService;
import com.example.backend.domain.item.service.ItemService;
import com.example.backend.domain.itemInstance.dto.response.ItemInstanceResponseDto;
import com.example.backend.domain.itemInstance.service.ItemInstanceService;
import com.example.backend.domain.supply.supplyRequest.service.SupplyRequestService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ExcelExportController {
    private final ExcelExportService excelService;
    private final ItemService itemService;
    private final ItemInstanceService instanceService;
    private final InventoryInService inService;
    private final InventoryOutService outService;
    private final SupplyRequestService requestService;

    // 1) 비품
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/v1/export/items")
    public void downloadItems(HttpServletResponse resp) throws Exception {
        var list = itemService.getAllItems();
        excelService.exportItems(list, resp);
    }

    // 2) 개별 자산 단위
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/v1/export/instances/by-item/{itemId}")
    public void downloadInstances(
            @PathVariable Long itemId,
            @RequestParam(defaultValue = "xlsx") String format,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Outbound outbound,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse resp
    ) throws Exception {
        List<ItemInstanceResponseDto> list = instanceService.getByItemList(
                itemId, search, status, outbound, fromDate, toDate, "createdAt", "desc"
        );

        excelService.exportInstances(list, resp);
    }

    // 3) 입고내역
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/v1/export/inventory-in")
    public void downloadInventoryIn(HttpServletResponse resp) throws Exception {
        var list = inService.getAllInboundForExcel();
        excelService.exportInventoryIn(list, resp);
    }

    // 4) 출고내역
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/v1/export/inventory-out")
    public void downloadInventoryOut(HttpServletResponse resp) throws Exception {
        var list = outService.getAllOutbound(); // 새로 직접 목록 조회 메서드 필요
        excelService.exportInventoryOut(list, resp);
    }

    // 5) 비품요청서
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/v1/export/supply-requests")
    public void downloadRequests(HttpServletResponse resp) throws Exception {
        var list = requestService.getAllRequests();
        excelService.exportSupplyRequests(list, resp);
    }


}

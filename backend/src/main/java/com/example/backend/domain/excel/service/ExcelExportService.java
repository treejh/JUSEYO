package com.example.backend.domain.excel.service;

import com.example.backend.domain.inventory.inventoryIn.dto.response.InventoryInExcelResponseDto;
import com.example.backend.domain.inventory.inventoryOut.dto.response.InventoryOutResponseDto;
import com.example.backend.domain.item.dto.response.ItemResponseDto;
import com.example.backend.domain.itemInstance.dto.response.ItemInstanceResponseDto;
import com.example.backend.domain.supply.supplyRequest.dto.response.SupplyRequestResponseDto;
import com.example.backend.domain.supply.supplyReturn.dto.response.SupplyReturnResponseDto;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExcelExportService {

    public void exportInventoryIn(List<InventoryInExcelResponseDto> ins, HttpServletResponse response) throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("InventoryIn");
            createHeader(sheet, new String[]{
                    "ID","ItemId","ItemName","CategoryName",
                    "Quantity","InboundType","CreatedAt","ModifiedAt"
            });

            int r = 1;
            for (var dto : ins) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(dto.getId());
                row.createCell(1).setCellValue(dto.getItemId());
                row.createCell(2).setCellValue(dto.getItemName());
                row.createCell(3).setCellValue(dto.getCategoryName());
                row.createCell(4).setCellValue(dto.getQuantity());
                row.createCell(5).setCellValue(dto.getInbound().name());
                row.createCell(6).setCellValue(dto.getCreatedAt().toString());
                row.createCell(7).setCellValue(dto.getModifiedAt().toString());
            }

            writeToResponse(wb, response, "inventory_in.xlsx");
        }
    }

    public void exportInventoryOut(List<InventoryOutResponseDto> outs, HttpServletResponse response) throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("InventoryOut");
            createHeader(sheet, new String[]{"ID","SupplyRequestId","ItemId","CategoryId","ManagementId","Quantity","OutboundType","CreatedAt"});
            int r = 1;
            for (var dto : outs) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(dto.getId());
                row.createCell(1).setCellValue(dto.getSupplyRequestId());
                row.createCell(2).setCellValue(dto.getItemId());
                row.createCell(3).setCellValue(dto.getCategoryId());
                row.createCell(4).setCellValue(dto.getManagementId());
                row.createCell(5).setCellValue(dto.getQuantity());
                row.createCell(6).setCellValue(dto.getOutbound());
                row.createCell(7).setCellValue(dto.getCreatedAt().toString());
            }
            writeToResponse(wb, response, "inventory_out.xlsx");
        }
    }

    public void exportSupplyRequests(List<SupplyRequestResponseDto> reqs, HttpServletResponse response) throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("SupplyRequests");
            createHeader(sheet, new String[]{
                    "ID","ItemId","UserId","ManagementId","SerialNumber","ReRequest","ProductName",
                    "Quantity","Purpose","UseDate","ReturnDate","Rental","ApprovalStatus","CreatedAt"
            });
            int r = 1;
            for (var dto : reqs) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(dto.getId());
                row.createCell(1).setCellValue(dto.getItemId());
                row.createCell(2).setCellValue(dto.getUserId());
                row.createCell(3).setCellValue(dto.getManagementId());
                row.createCell(4).setCellValue(dto.getSerialNumber());
                row.createCell(5).setCellValue(dto.getReRequest());
                row.createCell(6).setCellValue(dto.getProductName());
                row.createCell(7).setCellValue(dto.getQuantity());
                row.createCell(8).setCellValue(dto.getPurpose());
                row.createCell(9).setCellValue(dto.getUseDate()!=null?dto.getUseDate().toString():"");
                row.createCell(10).setCellValue(dto.getReturnDate()!=null?dto.getReturnDate().toString():"");
                row.createCell(11).setCellValue(dto.isRental());
                row.createCell(12).setCellValue(dto.getApprovalStatus().name());
                row.createCell(13).setCellValue(dto.getCreatedAt().toString());
            }
            writeToResponse(wb, response, "supply_requests.xlsx");
        }
    }

    public void exportItems(List<ItemResponseDto> items, HttpServletResponse response) throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Items");
            createHeader(sheet, new String[]{
                    "ID",
                    "Name",
                    "CategoryName",
                    "SerialNumber",
                    "MinimumQty",
                    "TotalQty",
                    "AvailableQty",
                    "PurchaseSource",
                    "Location",
                    "IsReturnRequired",
                    "CategoryId",
                    "ManagementId",
                    "CreatedAt",
                    "ModifiedAt",
                    "Status"
            });

            int rowIdx = 1;
            for (ItemResponseDto dto : items) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.getId());
                row.createCell(1).setCellValue(dto.getName());
                row.createCell(2).setCellValue(dto.getCategoryName());
                row.createCell(3).setCellValue(dto.getSerialNumber());
                row.createCell(4).setCellValue(dto.getMinimumQuantity());
                row.createCell(5).setCellValue(dto.getTotalQuantity());
                row.createCell(6).setCellValue(dto.getAvailableQuantity());
                row.createCell(7).setCellValue(dto.getPurchaseSource() != null ? dto.getPurchaseSource() : "");
                row.createCell(8).setCellValue(dto.getLocation() != null ? dto.getLocation() : "");
                row.createCell(9).setCellValue(dto.getIsReturnRequired());
                row.createCell(10).setCellValue(dto.getCategoryId());
                row.createCell(11).setCellValue(dto.getManagementId());
                row.createCell(12).setCellValue(dto.getCreatedAt().toString());
                row.createCell(13).setCellValue(dto.getModifiedAt().toString());
                row.createCell(14).setCellValue(dto.getStatus().name());
            }

            // 파일명도 구분되게 변경
            writeToResponse(wb, response, "items.xlsx");
        }
    }

    public void exportInstances(List<ItemInstanceResponseDto> insts, HttpServletResponse response) throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Instances");
            createHeader(sheet, new String[]{"ID","ItemId","Code","Status","Image","FinalImage","CreatedAt"});
            int r = 1;
            for (ItemInstanceResponseDto dto : insts) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(dto.getId());
                row.createCell(1).setCellValue(dto.getItemId());
                row.createCell(2).setCellValue(dto.getInstanceCode());
                row.createCell(3).setCellValue(dto.getOutbound().name());
                row.createCell(4).setCellValue(dto.getImage());
                row.createCell(5).setCellValue(dto.getFinalImage());
                row.createCell(6).setCellValue(dto.getCreatedAt().toString());
            }
            writeToResponse(wb, response, "instances.xlsx");
        }
    }

    /**
     * 반납 요청서 전체 엑셀 생성
     */
    public void exportSupplyReturns(List<SupplyReturnResponseDto> returns, HttpServletResponse response) throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("SupplyReturns");
            createHeader(sheet, new String[]{
                    "ID", "RequestId", "UserId", "ItemId", "ManagementId",
                    "SerialNumber", "ProductName", "Quantity", "UseDate", "ReturnDate", "ApprovalStatus", "CreatedAt"
            });

            int rowIdx = 1;
            for (var dto : returns) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.getId());
                row.createCell(1).setCellValue(dto.getRequestId());
                row.createCell(2).setCellValue(dto.getUserId());
                row.createCell(3).setCellValue(dto.getItemId());
                row.createCell(4).setCellValue(dto.getManagementId());
                row.createCell(5).setCellValue(dto.getSerialNumber() != null ? dto.getSerialNumber() : "");
                row.createCell(6).setCellValue(dto.getProductName());
                row.createCell(7).setCellValue(dto.getQuantity());
                row.createCell(8).setCellValue(dto.getUseDate().toString());
                row.createCell(9).setCellValue(dto.getReturnDate() != null ? dto.getReturnDate().toString() : "");
                row.createCell(10).setCellValue(dto.getApprovalStatus().name());
                row.createCell(11).setCellValue(dto.getCreatedAt().toString());
            }

            writeToResponse(wb, response, "supply_returns.xlsx");
        }
    }

    // 공통 유틸 메서드 (기존과 동일)
    private void createHeader(Sheet sheet, String[] headers) {
        Row header = sheet.createRow(0);
        CellStyle style = sheet.getWorkbook().createCellStyle();
        Font font = sheet.getWorkbook().createFont();
        font.setBold(true);
        style.setFont(font);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
            sheet.autoSizeColumn(i);
        }
    }

    private void writeToResponse(Workbook wb, HttpServletResponse response, String fileName) throws Exception {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        wb.write(response.getOutputStream());
    }
}

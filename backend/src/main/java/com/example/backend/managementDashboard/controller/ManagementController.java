package com.example.backend.managementDashboard.controller;



import com.example.backend.enums.Status;
import com.example.backend.managementDashboard.dto.ManagementDashBoardRequestDto;
import com.example.backend.managementDashboard.dto.ManagementDashBoardResponseDto;
import com.example.backend.managementDashboard.dto.ManagementDashboardUpdateRequestDto;
import com.example.backend.managementDashboard.service.ManagementDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/management")
@Validated
@RequiredArgsConstructor
@Tag(name = "Management", description = "관리 페이지 API")
public class ManagementController {

    private final ManagementDashboardService managementDashboardService;

    @Operation(summary = "관리 페이지 등록", description = "새로운 관리 페이지를 등록합니다.")
    @PostMapping
    public ResponseEntity<ManagementDashBoardResponseDto> addManagementDashboard(
            @RequestBody @Valid ManagementDashBoardRequestDto managementDashBoardRequestDto) {
        return ResponseEntity.ok(managementDashboardService.createManagementDashBoard(managementDashBoardRequestDto));
    }

    @Operation(summary = "관리 페이지 목록 조회", description = "승인 여부에 따라 관리 페이지 목록을 페이징 처리하여 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<ManagementDashBoardResponseDto>> getManagementDashboards(
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "상태값 (예: ACTIVE, INACTIVE)", schema = @Schema(implementation = Status.class))
            @RequestParam(defaultValue = "ACTIVE") Status status,
            @Parameter(description = "승인 여부 (true: 승인된 페이지만, false: 미승인 페이지만)") @RequestParam(defaultValue = "true") boolean approval
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return ResponseEntity.ok(managementDashboardService.findAllManagementDashBoard(pageable,status,approval));
    }

    @Operation(summary = "관리 페이지 단건 조회", description = "ID를 기반으로 특정 관리 페이지를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ManagementDashBoardResponseDto> getManagementDashboard(
            @Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(managementDashboardService.getManagementDashBoard(id));
    }

    @Operation(summary = "관리 페이지 수정", description = "ID를 기준으로 관리 페이지를 수정합니다.")
    @PostMapping("/{id}")
    public ResponseEntity<ManagementDashBoardResponseDto> updateManagementDashboard(
            @Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id,
            @RequestBody ManagementDashboardUpdateRequestDto managementDashBoardRequestDto) {
        return ResponseEntity.ok(managementDashboardService.updateManagementDashBoard(managementDashBoardRequestDto, id));
    }

    @Operation(summary = "관리 페이지 삭제", description = "ID를 기준으로 관리 페이지를 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManagementDashboard(
            @Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id) {
        managementDashboardService.deleteManagementDashBoard(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "관리 페이지 승인", description = "ID를 기준으로 관리 페이지를 승인 처리합니다.")
    @PostMapping("/approve/{id}")
    public ResponseEntity<Void> approveManagementDashboard(
            @Parameter(description = "관리 페이지 ID") @PathVariable(name = "id") Long id) {
        managementDashboardService.approvalManagementDashBoard(id);
        return ResponseEntity.ok().build();
    }
}

package com.example.backend.registerItem.controller;

import com.example.backend.enums.Status;
import com.example.backend.item.dto.response.ItemResponseDto;
import com.example.backend.registerItem.dto.request.PurchaseRequestDto;
import com.example.backend.registerItem.dto.request.UpdateRegisterItemDto;
import com.example.backend.registerItem.dto.response.RegisterItemResponseDto;
import com.example.backend.registerItem.service.RegisterItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/register-items")
@Tag(name = "RegisterItem", description = "비품 구매 관련 API")
public class RegisterItemController {

    private final RegisterItemService registerItemService;

    //비품 구매 등록
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "비품 구매 등록", description = "신규 비품 등록 또는 재구매 등록")
    public ResponseEntity<ItemResponseDto> registerItem(@ModelAttribute PurchaseRequestDto dto) {
        ItemResponseDto response = registerItemService.registerItem(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //비품 단건 조회
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "비품 구매 단건 조회", description = "비품 구매 정보를 ID로 조회합니다")
    public ResponseEntity<RegisterItemResponseDto> getRegisterItem(@PathVariable(name = "id") Long id) {
        RegisterItemResponseDto response = registerItemService.getRegisterItem(id);
        return ResponseEntity.ok(response);
    }

    //비품 목록 조회 (상태 필터 포함)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "비품 목록 조회", description = "상태별로 비품 구매 목록을 페이징 조회합니다")
    public ResponseEntity<Page<RegisterItemResponseDto>> getAllRegisterItems(
            @RequestParam(required = false) Status status,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<RegisterItemResponseDto> response = registerItemService.getAllRegisterItems(pageable, status);
        return ResponseEntity.ok(response);
    }

    //비품 구매 수정
    @PostMapping(value="/{id}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "비품 구매 수정", description = "입력된 필드만 수정합니다")
    public ResponseEntity<Void> updateRegisterItem(
            @PathVariable(name = "id") Long id,
            @ModelAttribute UpdateRegisterItemDto dto) {
        registerItemService.updateRegisterItem(id, dto);
        return ResponseEntity.noContent().build();
    }

    //비품 구매 취소
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "비품 구매 취소", description = "비품 구매 상태를 STOP으로 변경합니다 (소프트 삭제)")
    public ResponseEntity<Void> deleteRegisterItem(@PathVariable(name = "id") Long id) {
        registerItemService.deleteRegisterItem(id);
        return ResponseEntity.noContent().build();
    }
}

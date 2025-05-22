package com.example.backend.domain.item.controller;

import com.example.backend.domain.item.dto.request.ItemRequestDto;
import com.example.backend.domain.item.dto.response.ItemLiteResponseDto;
import com.example.backend.domain.item.dto.response.ItemResponseDto;
import com.example.backend.domain.item.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
@Tag(name = "비품 관리", description = "비품 등록, 수정, 조회, 삭제 및 페이징 조회")
public class ItemController {

    private final ItemService service;

    @Operation(summary = "비품 등록", description = "새로운 비품을 등록합니다. (매니저 권한 필요)")
    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ItemResponseDto create(
            @ModelAttribute ItemRequestDto dto   // ← @RequestBody → @ModelAttribute
    ) {
        return service.createItem(dto);
    }

    @Operation(summary = "비품 수정", description = "비품 정보를 수정합니다. (매니저 권한 필요)")
    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/{id}")
    public ItemResponseDto update(@PathVariable Long id, @RequestBody ItemRequestDto dto) {
        return service.updateItem(id, dto);
    }

    @Operation(summary = "전체 비품 목록 조회", description = "페이징 없이 모든 비품을 조회합니다. (주의: 데이터 많을 경우 성능 저하 가능)")
    @GetMapping("/all")
    public List<ItemResponseDto> list() {
        return service.getAllItems();
    }

    @Operation(summary = "단일 비품 조회", description = "ID로 특정 비품의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ItemResponseDto getOne(@PathVariable Long id) {
        return service.getItem(id);
    }

    @Operation(summary = "비품 삭제", description = "비품을 삭제합니다.")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteItem(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    @Operation(summary = "비품 페이징 목록 조회", description = "총 수량 기준으로 비품을 정렬하여 페이지 단위로 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<ItemLiteResponseDto>> getPagedItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "asc") String sort) {

        Sort sorting = sort.equalsIgnoreCase("asc")
                ? Sort.by("totalQuantity").ascending()
                : Sort.by("totalQuantity").descending();

        Pageable pageable = PageRequest.of(page, size, sorting);

        return ResponseEntity.ok(service.getItemsPagedSorted(pageable));
    }
}

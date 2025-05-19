package com.example.backend.chaseItem.controller;

import com.example.backend.chaseItem.dto.request.ChaseItemRequestDto;
import com.example.backend.chaseItem.dto.response.ChaseItemResponseDto;
import com.example.backend.chaseItem.service.ChaseItemService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chase-items")
@RequiredArgsConstructor
public class ChaseItemController {
    private final ChaseItemService service;

    @Operation(summary = "비품 추적 기록 생성")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/chase-items")
    @ResponseStatus(HttpStatus.CREATED)
    public ChaseItemResponseDto create(@RequestBody @Valid ChaseItemRequestDto dto) {
        return service.addChaseItem(dto);
    }

    @Operation(summary = "특정 아이템 인스턴스의 추적 기록 조회")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public List<ChaseItemResponseDto> getByItemInstance(
            @RequestParam Long itemInstanceId ) {
        return service.getChaseItemsByInstance(itemInstanceId);
    }
}

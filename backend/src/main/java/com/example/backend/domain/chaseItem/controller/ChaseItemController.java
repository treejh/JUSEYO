package com.example.backend.domain.chaseItem.controller;

import com.example.backend.domain.chaseItem.dto.request.ChaseItemRequestDto;
import com.example.backend.domain.chaseItem.dto.response.ChaseItemResponseDto;
import com.example.backend.domain.chaseItem.service.ChaseItemService;
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

    @Operation(summary = "특정 요청의 추적 기록 조회")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/by-request")
    public List<ChaseItemResponseDto> getByRequest(
            @RequestParam Long requestId
    ) {
        return service.getByRequest(requestId);
    }

    @Operation(summary = "전체 비품 추적 기록 조회")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping
    public List<ChaseItemResponseDto> getAll() {
        return service.getAll();
    }
}

package com.example.backend.mainDashboard.controller;

import com.example.backend.mainDashboard.dto.MainDashBoardRequestDto;
import com.example.backend.mainDashboard.dto.MainDashBoardResponseDto;
import com.example.backend.mainDashboard.service.MainDashBoardService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/maindashboards")
@RequiredArgsConstructor
@Tag(name = "MainDashboard", description = "메인 대시보드 관련 API")
public class MainDashBoardController {

    private final MainDashBoardService mainDashBoardService;

    @Operation(summary = "단일 대시보드 조회")
    @GetMapping("/{id}")
    public ResponseEntity<MainDashBoardResponseDto> getMainDashBoard(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(mainDashBoardService.getMainDashBoard(id));
    }

    @Operation(summary = "대시보드 목록 조회 (페이징)")
    @GetMapping
    public ResponseEntity<Page<MainDashBoardResponseDto>> getMainDashBoards(
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return ResponseEntity.ok(mainDashBoardService.getAllMainDashBoards(pageable));
    }

    @Operation(summary = "대시보드 생성")
    @PostMapping
    public ResponseEntity<MainDashBoardResponseDto> createMainDashBoard(
            @RequestBody MainDashBoardRequestDto requestDto) {
        return ResponseEntity.ok(mainDashBoardService.createMainDashBoard(requestDto.getName()));
    }

    @Operation(summary = "대시보드 이름 수정")
    @PostMapping("/{id}")
    public ResponseEntity<MainDashBoardResponseDto> updateMainDashBoard(
            @RequestBody MainDashBoardRequestDto requestDto,
            @PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(mainDashBoardService.updateMainDashBoard(id, requestDto.getName()));
    }
}

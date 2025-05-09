package com.example.backend.supplyRequest.controller;

import com.example.backend.supplyRequest.dto.request.SupplyRequestRequestDto;
import com.example.backend.supplyRequest.dto.response.SupplyRequestResponseDto;
import com.example.backend.supplyRequest.service.SupplyRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/supply-requests")
@RequiredArgsConstructor
public class SupplyRequestController {
    private final SupplyRequestService service;

    @PostMapping
    public SupplyRequestResponseDto create(@RequestBody SupplyRequestRequestDto dto) {
        return service.createRequest(dto);
    }

    @GetMapping
    public List<SupplyRequestResponseDto> list() {
        return service.getAllRequests();
    }
}

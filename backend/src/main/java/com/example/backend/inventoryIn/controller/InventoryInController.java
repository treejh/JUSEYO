package com.example.backend.inventoryIn.controller;

import com.example.backend.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.inventoryIn.dto.response.InventoryInResponseDto;
import com.example.backend.inventoryIn.service.InventoryInService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory-in")
@RequiredArgsConstructor
public class InventoryInController {
    private final InventoryInService service;

    @PostMapping
    public InventoryInResponseDto addInbound(@RequestBody InventoryInRequestDto dto) {
        return service.addInbound(dto);
    }
}
package com.example.backend.inventoryOut.controller;

import com.example.backend.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryOut.dto.response.InventoryOutResponseDto;
import com.example.backend.inventoryOut.service.InventoryOutService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory-out")
@RequiredArgsConstructor
public class InventoryOutController {
    private final InventoryOutService service;

    @PostMapping
    public InventoryOutResponseDto removeOutbound(@RequestBody InventoryOutRequestDto dto) {
        return service.removeOutbound(dto);
    }
}
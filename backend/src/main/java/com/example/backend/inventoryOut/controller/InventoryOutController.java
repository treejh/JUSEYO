package com.example.backend.inventoryout.controller;

import com.example.backend.inventoryout.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryout.dto.response.InventoryOutResponseDto;
import com.example.backend.inventoryout.entity.InventoryOut;
import com.example.backend.inventoryout.service.InventoryOutService;
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
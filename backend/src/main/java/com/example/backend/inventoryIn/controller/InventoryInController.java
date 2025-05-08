package com.example.backend.inventoryIn.controller;

import com.example.backend.inventoryIn.entity.InventoryIn;
import com.example.backend.inventoryIn.service.InventoryInService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory-in")
@RequiredArgsConstructor
public class InventoryInController {
    private final InventoryInService service;

    @PostMapping
    public InventoryIn addInbound(@RequestBody InventoryIn in) {
        return service.addInbound(in);
    }
}
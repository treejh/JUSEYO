package com.example.backend.inventoryout.controller;

import com.example.backend.inventoryout.entity.InventoryOut;
import com.example.backend.inventoryout.service.InventoryOutService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory-out")
@RequiredArgsConstructor
public class InventoryOutController {
    private final InventoryOutService service;

    @PostMapping
    public InventoryOut removeOutbound(@RequestBody InventoryOut out) {
        return service.removeOutbound(out);
    }
}
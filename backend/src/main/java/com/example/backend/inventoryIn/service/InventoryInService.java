package com.example.backend.inventoryIn.service;

import com.example.backend.inventoryIn.entity.InventoryIn;
import com.example.backend.inventoryIn.repository.InventoryInRepository;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryInService {
    private final InventoryInRepository inRepo;
    private final ItemRepository itemRepo;

    @Transactional
    public InventoryIn addInbound(InventoryIn in) {
        Item item = itemRepo.findById(in.getItem().getId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        item.setTotalQuantity(item.getTotalQuantity() + in.getQuantity());
        item.setAvailableQuantity(item.getAvailableQuantity() + in.getQuantity());
        return inRepo.save(in);
    }
}
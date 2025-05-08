package com.example.backend.inventoryout.service;

import com.example.backend.inventoryout.entity.InventoryOut;
import com.example.backend.inventoryout.repository.InventoryOutRepository;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryOutService {
    private final InventoryOutRepository outRepo;
    private final ItemRepository itemRepo;

    @Transactional
    public InventoryOut removeOutbound(InventoryOut out) {
        Item item = itemRepo.findById(out.getItem().getId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (item.getAvailableQuantity() < out.getQuantity()) {
            throw new IllegalArgumentException("Not enough inventory");
        }
        item.setAvailableQuantity(item.getAvailableQuantity() - out.getQuantity());
        return outRepo.save(out);
    }
}
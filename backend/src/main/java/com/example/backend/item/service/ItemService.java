package com.example.backend.item.service;

import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Item getItem(String id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
    }

    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    @Transactional
    public Item updateItem(String id, Item updated) {
        Item item = getItem(id);
        item.setName(updated.getName());
        item.setSerialNumber(updated.getSerialNumber());
        item.setPurchaseSource(updated.getPurchaseSource());
        item.setLocation(updated.getLocation());
        item.setIsReturnRequired(updated.getIsReturnRequired());
        return item;
    }

    public void deleteItem(String id) {
        itemRepository.deleteById(id);
    }
}
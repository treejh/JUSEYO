package com.example.backend.item.controller;

import com.example.backend.item.entity.Item;
import com.example.backend.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService service;

    @GetMapping
    public List<Item> list() {
        return service.getAllItems();
    }

    @GetMapping("/{id}")
    public Item getOne(@PathVariable String id) {
        return service.getItem(id);
    }

    @PostMapping
    public Item create(@RequestBody Item item) {
        return service.createItem(item);
    }

    @PutMapping("/{id}")
    public Item update(@PathVariable String id, @RequestBody Item item) {
        return service.updateItem(id, item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteItem(id);
    }
}
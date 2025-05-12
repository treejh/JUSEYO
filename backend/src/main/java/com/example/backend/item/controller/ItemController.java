package com.example.backend.item.controller;

import com.example.backend.item.dto.request.ItemRequestDto;
import com.example.backend.item.dto.response.ItemResponseDto;
import com.example.backend.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService service;

    @PostMapping
    public ItemResponseDto create(@RequestBody ItemRequestDto dto) {
        return service.createItem(dto);
    }

    @PreAuthorize("hasRole('MANAGER')") // 매니저만 수정가능
    @PutMapping("/{id}")
    public ItemResponseDto update(@PathVariable Long id, @RequestBody ItemRequestDto dto) {
        return service.updateItem(id, dto);
    }

    @GetMapping
    public List<ItemResponseDto> list() {
        return service.getAllItems();
    }

    @GetMapping("/{id}")
    public ItemResponseDto getOne(@PathVariable Long id) {
        return service.getItem(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteItem(id);
    }
}
package com.example.backend.item.service;

import com.example.backend.item.dto.request.ItemRequestDto;
import com.example.backend.item.dto.response.ItemResponseDto;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository repo;

    public ItemResponseDto createItem(ItemRequestDto dto) {
        Item entity = Item.builder()
                .name(dto.getName())
                .serialNumber(dto.getSerialNumber())
                .totalQuantity(dto.getTotalQuantity())
                .availableQuantity(dto.getAvailableQuantity())
                .purchaseSource(dto.getPurchaseSource())
                .location(dto.getLocation())
                .isReturnRequired(dto.getIsReturnRequired())
                // categoryId, managementId 로 연관 엔티티 조회 후 set
                .build();
        Item saved = repo.save(entity);
        return mapToDto(saved);
    }

    public ItemResponseDto updateItem(Long id, ItemRequestDto dto) {
        Item entity = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        entity.setName(dto.getName());
        entity.setSerialNumber(dto.getSerialNumber());
        entity.setPurchaseSource(dto.getPurchaseSource());
        entity.setLocation(dto.getLocation());
        entity.setIsReturnRequired(dto.getIsReturnRequired());
        Item updated = repo.save(entity);
        return mapToDto(updated);
    }

    public ItemResponseDto getItem(Long id) {
        return repo.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
    }

    public List<ItemResponseDto> getAllItems() {
        return repo.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    private ItemResponseDto mapToDto(Item e) {
        return ItemResponseDto.builder()
                .id(e.getId())
                .name(e.getName())
                .serialNumber(e.getSerialNumber())
                .totalQuantity(e.getTotalQuantity())
                .availableQuantity(e.getAvailableQuantity())
                .purchaseSource(e.getPurchaseSource())
                .location(e.getLocation())
                .isReturnRequired(e.getIsReturnRequired())
                .categoryId(e.getCategory().getId())
                .managementId(e.getManagementDashboard().getId())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }
}
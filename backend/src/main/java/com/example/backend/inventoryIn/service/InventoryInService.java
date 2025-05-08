package com.example.backend.inventoryIn.service;

import com.example.backend.enums.Inbound;
import com.example.backend.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.inventoryIn.dto.response.InventoryInResponseDto;
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
    public InventoryInResponseDto addInbound(InventoryInRequestDto dto) {
        // 1) 아이템 조회
        Item item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        // 2) 엔티티 생성
        InventoryIn entity = InventoryIn.builder()
                .item(item)
                .quantity(dto.getQuantity())
                .inbound(Inbound.valueOf(dto.getInbound()))
                .build();

        // 3) 입고 내역 저장
        InventoryIn saved = inRepo.save(entity);

        // 4) 아이템 수량 업데이트
        item.setTotalQuantity(item.getTotalQuantity() + saved.getQuantity());
        item.setAvailableQuantity(item.getAvailableQuantity() + saved.getQuantity());

        // 5) DTO 리턴
        return InventoryInResponseDto.builder()
                .id(saved.getId())
                .itemId(saved.getItem().getId())
                .quantity(saved.getQuantity())
                .inbound(saved.getInbound().name())
                .createdAt(saved.getCreatedAt())
                .modifiedAt(saved.getModifiedAt())
                .build();
    }
}
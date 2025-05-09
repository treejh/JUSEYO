package com.example.backend.inventoryOut.service;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryOut.dto.response.InventoryOutResponseDto;
import com.example.backend.inventoryOut.entity.InventoryOut;
import com.example.backend.inventoryOut.repository.InventoryOutRepository;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.enums.Outbound;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryOutService {
    private final InventoryOutRepository outRepo;
    private final ItemRepository itemRepo;

    @Transactional
    public InventoryOutResponseDto removeOutbound(InventoryOutRequestDto dto) {
        // 1) 아이템 조회
        Item item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        // 2) 재고 충분 여부 검사
        if (item.getAvailableQuantity() < dto.getQuantity()) {
            throw new IllegalArgumentException("Not enough inventory");
        }

        // 3) 출고 내역 엔티티 생성 및 저장
        InventoryOut entity = InventoryOut.builder()
                .item(item)
                .quantity(dto.getQuantity())
                .outbound(Outbound.valueOf(dto.getOutbound()))
                .build();
        InventoryOut saved = outRepo.save(entity);

        // 4) 아이템 재고 차감
        item.setAvailableQuantity(item.getAvailableQuantity() - saved.getQuantity());

        // 5) 응답 DTO 반환
        return InventoryOutResponseDto.builder()
                .id(saved.getId())
                .itemId(saved.getItem().getId())
                .quantity(saved.getQuantity())
                .outbound(saved.getOutbound().name())
                .createdAt(saved.getCreatedAt())
                .modifiedAt(saved.getModifiedAt())
                .build();
    }
}

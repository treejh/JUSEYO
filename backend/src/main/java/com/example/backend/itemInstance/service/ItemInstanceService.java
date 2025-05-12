package com.example.backend.itemInstance.service;

import com.example.backend.enums.Outbound;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.itemInstance.dto.request.CreateItemInstanceRequestDto;
import com.example.backend.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.itemInstance.dto.response.ItemInstanceResponseDto;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.itemInstance.repository.ItemInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemInstanceService {
    private final ItemRepository itemRepo;
    private final ItemInstanceRepository instanceRepo;

    @Transactional
    public ItemInstanceResponseDto createInstance(CreateItemInstanceRequestDto dto) {
        Item item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        String code = item.getSerialNumber()
                + "-" + UUID.randomUUID().toString().substring(0, 8);

        ItemInstance inst = ItemInstance.builder()
                .item(item)
                .instanceCode(code)
                .status(Outbound.AVAILABLE)
                .image(dto.getImage())
                .build();

        ItemInstance saved = instanceRepo.save(inst);
        return map(saved);
    }

    @Transactional(readOnly = true)
    public List<ItemInstanceResponseDto> getByItem(Long itemId) {
        return instanceRepo.findAllByItemId(itemId).stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Transactional
    public ItemInstanceResponseDto updateStatus(Long instanceId, UpdateItemInstanceStatusRequestDto dto) {
        ItemInstance inst = instanceRepo.findById(instanceId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        inst.setStatus(dto.getStatus());
        inst.setFinalImage(dto.getFinalImage());
        ItemInstance saved = instanceRepo.save(inst);
        return map(saved);
    }

    private ItemInstanceResponseDto map(ItemInstance e) {
        return ItemInstanceResponseDto.builder()
                .id(e.getId())
                .itemId(e.getItem().getId())
                .instanceCode(e.getInstanceCode())
                .status(e.getStatus())
                .image(e.getImage())
                .finalImage(e.getFinalImage())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }
}

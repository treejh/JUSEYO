package com.example.backend.chaseItem.service;

import com.example.backend.chaseItem.dto.request.ChaseItemRequestDto;
import com.example.backend.chaseItem.dto.response.ChaseItemResponseDto;
import com.example.backend.chaseItem.entity.ChaseItem;
import com.example.backend.chaseItem.repository.ChaseItemRepository;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.supplyRequest.repository.SupplyRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChaseItemService {
    private final ChaseItemRepository repo;
    private final SupplyRequestRepository requestRepo;
    private final ItemInstanceRepository itemInstanceRepo;

    @Transactional
    public ChaseItemResponseDto addChaseItem(ChaseItemRequestDto dto) {
        SupplyRequest req = requestRepo.findById(dto.getRequestId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));

        ChaseItem ent = ChaseItem.builder()
                .supplyRequest(req)
                .productName(dto.getProductName())
                .quantity(dto.getQuantity())
                .issue(dto.getIssue())
                .build();

        ChaseItem saved = repo.save(ent);
        return map(saved);
    }

    @Transactional(readOnly = true)
    public List<ChaseItemResponseDto> getChaseItemsByInstance(Long itemInstanceId) {
        return repo.findAllByItemInstanceId(itemInstanceId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    private ChaseItemResponseDto map(ChaseItem e) {
        return ChaseItemResponseDto.builder()
                .id(e.getId())
                .requestId(e.getSupplyRequest().getId())
                .productName(e.getProductName())
                .quantity(e.getQuantity())
                .issue(e.getIssue())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }
}
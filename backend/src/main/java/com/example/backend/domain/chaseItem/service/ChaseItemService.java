package com.example.backend.domain.chaseItem.service;

import com.example.backend.domain.chaseItem.dto.request.ChaseItemRequestDto;
import com.example.backend.domain.chaseItem.dto.response.ChaseItemResponseDto;
import com.example.backend.domain.chaseItem.entity.ChaseItem;
import com.example.backend.domain.chaseItem.repository.ChaseItemRepository;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyRequest.repository.SupplyRequestRepository;
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
    public List<ChaseItemResponseDto> getByRequest(Long requestId) {
        return repo.findAllBySupplyRequestId(requestId).stream()
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
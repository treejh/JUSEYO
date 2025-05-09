package com.example.backend.supplyRequest.service;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.supplyRequest.dto.request.SupplyRequestRequestDto;
import com.example.backend.supplyRequest.dto.response.SupplyRequestResponseDto;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.backend.enums.ApprovalStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplyRequestService {
    private final SupplyRequestRepository repo;
    private final ItemRepository itemRepo;
    private final UserRepository userRepo;

    @Transactional
    public SupplyRequestResponseDto createRequest(SupplyRequestRequestDto dto) {
        // 엔티티 빌드
        SupplyRequest req = SupplyRequest.builder()
                .item(itemRepo.findById(dto.getItemId())
                        .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND)))
                .user(userRepo.findById(dto.getUserId())
                        .orElseThrow(() -> new IllegalArgumentException("User not found")))
                .productName(dto.getProductName())
                .quantity(dto.getQuantity())
                .purpose(dto.getPurpose())
                .useDate(dto.getUseDate())
                .returnDate(dto.getReturnDate())
                .rental(dto.isRental())
                .approvalStatus(ApprovalStatus.REQUESTED)
                .build();

        SupplyRequest saved = repo.save(req);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SupplyRequestResponseDto> getAllRequests() {
        return repo.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    private SupplyRequestResponseDto mapToDto(SupplyRequest e) {
        return SupplyRequestResponseDto.builder()
                .id(e.getId())
                .itemId(e.getItem().getId())
                .userId(e.getUser().getId())
                .productName(e.getProductName())
                .quantity(e.getQuantity())
                .purpose(e.getPurpose())
                .useDate(e.getUseDate())
                .returnDate(e.getReturnDate())
                .rental(e.isRental())
                .approvalStatus(e.getApprovalStatus())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }
}
package com.example.backend.supplyRequest.service;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.inventoryIn.service.InventoryInService;
import com.example.backend.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryOut.service.InventoryOutService;
import com.example.backend.item.entity.Item;
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
    private final InventoryOutService outService;
    private final InventoryInService inService;

    @Transactional
    public SupplyRequestResponseDto createRequest(SupplyRequestRequestDto dto) {
        // ① 아이템 조회
        Item item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        // ② 요청 수량 검증
        if (dto.getQuantity() > item.getAvailableQuantity()) {
            throw new BusinessLogicException(ExceptionCode.INSUFFICIENT_STOCK);
        }

        // ③ 요청서 빌드 (rental 플래그 포함)
        SupplyRequest req = SupplyRequest.builder()
                .item(item)
                .user(userRepo.findById(dto.getUserId())
                        .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND)))
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

    @Transactional
    public SupplyRequestResponseDto updateRequestStatus(Long requestId, ApprovalStatus newStatus) {
        SupplyRequest req = repo.findById(requestId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));

        // ① 승인(매니저가 클릭) 로직
        if (newStatus == ApprovalStatus.APPROVED) {
            // 출고 처리: 재고 차감
            InventoryOutRequestDto outDto = new InventoryOutRequestDto();
            outDto.setItemId(req.getItem().getId());
            outDto.setQuantity(req.getQuantity());
            outDto.setOutbound("USAGE");
            outService.removeOutbound(outDto);

            // 상태 설정: 대여 요청이면 반납대기, 아니면 승인
            if (req.isRental()) {
                req.setApprovalStatus(ApprovalStatus.RETURN_PENDING);
            } else {
                req.setApprovalStatus(ApprovalStatus.APPROVED);
            }
        }

        // ② 반납 완료 처리 (매니저 또는 자동 반납 트리거)
        if (newStatus == ApprovalStatus.RETURNED) {
            // 입고 처리: 재고 복구
            InventoryInRequestDto inDto = new InventoryInRequestDto();
            inDto.setItemId(req.getItem().getId());
            inDto.setQuantity(req.getQuantity());
            inDto.setInbound("RETURN");
            inDto.setName(req.getItem().getName());
            inDto.setCategoryId(req.getItem().getCategory().getId());
            inDto.setManagementId(req.getItem().getManagementDashboard().getId());
            inDto.setPurchaseSource(req.getItem().getPurchaseSource());
            inDto.setLocation(req.getItem().getLocation());
            inDto.setIsReturnRequired(req.getItem().getIsReturnRequired());
            inService.addInbound(inDto);

            // 반납 완료 상태로 설정
            req.setApprovalStatus(ApprovalStatus.RETURNED);
        }

        SupplyRequest updated = repo.save(req);
        return mapToDto(updated);
    }
}
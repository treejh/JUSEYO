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
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.enums.ApprovalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplyRequestService {
    private final SupplyRequestRepository repo;
    private final ItemRepository itemRepo;
    private final UserRepository userRepo;
    private final ManagementDashboardRepository mgmtRepo;
    private final InventoryOutService outService;
    private final InventoryInService inService;

    @Transactional
    public SupplyRequestResponseDto createRequest(SupplyRequestRequestDto dto) {
        // 1) 아이템, 유저, 관리페이지 조회
        Item item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
        var user = userRepo.findById(dto.getUserId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        ManagementDashboard mgmt = mgmtRepo.findById(dto.getManagementId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        // 2) 요청 수량 검증
        if (dto.getQuantity() > item.getAvailableQuantity()) {
            throw new BusinessLogicException(ExceptionCode.INSUFFICIENT_STOCK);
        }

        // 3) 요청서 생성
        SupplyRequest req = SupplyRequest.builder()
                .item(item)
                .user(user)
                .managementDashboard(mgmt)
                .serialNumber(dto.getSerialNumber())
                .reRequest(dto.getReRequest())
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

    @Transactional
    public SupplyRequestResponseDto updateRequestStatus(Long requestId, ApprovalStatus newStatus) {
        SupplyRequest req = repo.findById(requestId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));

        if (newStatus == ApprovalStatus.APPROVED) {
            // 1. 출고 처리
            InventoryOutRequestDto outDto = new InventoryOutRequestDto();
            outDto.setSupplyRequestId(req.getId());
            outDto.setItemId(req.getItem().getId());
            outDto.setCategoryId(req.getItem().getCategory().getId());
            outDto.setManagementId(req.getItem().getManagementDashboard().getId());
            outDto.setQuantity(req.getQuantity());
            outDto.setOutbound("USAGE");
            outService.removeOutbound(outDto);

            // 2. 상태 전환
            if (req.isRental()) {
                req.setApprovalStatus(ApprovalStatus.RETURN_PENDING);
            } else {
                req.setApprovalStatus(ApprovalStatus.APPROVED);
            }
        }

        if (newStatus == ApprovalStatus.RETURNED && req.isRental()) {
            // 3. 반납 입고 처리
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

            req.setApprovalStatus(ApprovalStatus.RETURNED);
        }

        SupplyRequest updated = repo.save(req);
        return mapToDto(updated);
    }

    private SupplyRequestResponseDto mapToDto(SupplyRequest e) {
        return SupplyRequestResponseDto.builder()
                .id(e.getId())
                .itemId(e.getItem().getId())
                .userId(e.getUser().getId())
                .managementId(e.getManagementDashboard().getId())
                .serialNumber(e.getSerialNumber())
                .reRequest(e.getReRequest())
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

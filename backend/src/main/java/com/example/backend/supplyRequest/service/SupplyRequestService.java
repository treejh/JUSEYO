package com.example.backend.supplyRequest.service;

import com.example.backend.chaseItem.dto.request.ChaseItemRequestDto;
import com.example.backend.chaseItem.service.ChaseItemService;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Inbound;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.inventoryIn.service.InventoryInService;
import com.example.backend.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryOut.service.InventoryOutService;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.itemInstance.service.ItemInstanceService;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.supplyRequest.dto.request.SupplyRequestRequestDto;
import com.example.backend.supplyRequest.dto.response.SupplyRequestResponseDto;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplyRequestService {

    private final SupplyRequestRepository repo;
    private final ItemRepository itemRepo;
    private final UserRepository userRepo;
    private final TokenService tokenService;
    private final InventoryOutService outService;
    private final InventoryInService inService;
    private final ItemInstanceRepository instanceRepo;
    private final ItemInstanceService instanceService;
    private final ChaseItemService chaseItemService;

    @Transactional
    public SupplyRequestResponseDto createRequest(SupplyRequestRequestDto dto) {
        if (dto.isRental() && dto.getReturnDate() == null) {
            throw new BusinessLogicException(ExceptionCode.INVALID_RETURN_DATE);
        }
        Item item = itemRepo.findByIdAndStatus(dto.getItemId(), Status.ACTIVE)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
        Long userId = tokenService.getIdFromToken();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        ManagementDashboard mgmt = item.getManagementDashboard();
        if (dto.getQuantity() > item.getAvailableQuantity()) {
            throw new BusinessLogicException(ExceptionCode.INSUFFICIENT_STOCK);
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime useDate = dto.isRental() ? dto.getUseDate() : now;
        LocalDateTime returnDate = dto.isRental() ? dto.getReturnDate() : null;
        boolean isReRequest = repo.existsByUserIdAndItemId(userId, item.getId());
        SupplyRequest req = SupplyRequest.builder()
                .item(item)
                .user(user)
                .managementDashboard(mgmt)
                .serialNumber(item.getSerialNumber())
                .reRequest(isReRequest)
                .productName(item.getName())
                .quantity(dto.getQuantity())
                .purpose(dto.getPurpose())
                .useDate(useDate)
                .returnDate(returnDate)
                .rental(dto.isRental())
                .approvalStatus(ApprovalStatus.REQUESTED)
                .build();
        SupplyRequest saved = repo.save(req);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SupplyRequestResponseDto> findRequestsByManagementAndStatus(
            Long mgmtId, ApprovalStatus status) {
        return repo.findAllByManagementDashboardIdAndApprovalStatus(mgmtId, status)
                .stream().map(this::mapToDto).toList();
    }

    @Transactional
    public SupplyRequestResponseDto approveRequest(Long requestId) {
        SupplyRequest req = repo.findById(requestId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));

        // 1) 승인 상태 변경
        req.setApprovalStatus(ApprovalStatus.APPROVED);

        // 2) 자동으로 비품추적 기록 생성 (대여 vs 비대여 메시지 분기)
        String issueMsg = req.isRental()
                ? "대여 승인 자동 기록"
                : "비대여 승인 자동 기록";

        ChaseItemRequestDto chaseDto = ChaseItemRequestDto.builder()
                .requestId(req.getId())
                .productName(req.getProductName())
                .quantity(req.getQuantity())
                .issue(issueMsg)
                .build();
        chaseItemService.addChaseItem(chaseDto);

        // 3) DTO 반환
        return mapToDto(req);
    }

    @Transactional
    public SupplyRequestResponseDto rejectRequest(Long requestId) {
        return updateRequestStatus(requestId, ApprovalStatus.REJECTED);
    }

    @Transactional
    public SupplyRequestResponseDto updateRequestStatus(Long requestId, ApprovalStatus newStatus) {
        Long currentUserId = tokenService.getIdFromToken();
        SupplyRequest req = repo.findById(requestId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));
        Long userMgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();
        if (!req.getManagementDashboard().getId().equals(userMgmtId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        if (newStatus == ApprovalStatus.APPROVED) {
            InventoryOutRequestDto outDto = new InventoryOutRequestDto();
            outDto.setSupplyRequestId(req.getId());
            outDto.setItemId(req.getItem().getId());
            outDto.setCategoryId(req.getItem().getCategory().getId());
            outDto.setManagementId(req.getItem().getManagementDashboard().getId());
            outDto.setQuantity(req.getQuantity());
            outDto.setOutbound(Outbound.ISSUE.name());
            outService.removeOutbound(outDto);

            if (req.isRental()) {
                for (int i = 0; i < req.getQuantity(); i++) {
                    ItemInstance newInst = ItemInstance.builder()
                            .item(req.getItem())
                            .instanceCode(generateInstanceCode(req.getItem()))
                            .outbound(Outbound.LEND)
                            .status(Status.ACTIVE)
                            .image(req.getItem().getImage())
                            .finalImage(req.getItem().getImage())
                            .build();
                    instanceRepo.save(newInst);
                    ChaseItemRequestDto chaseDto2 = ChaseItemRequestDto.builder()
                            .requestId(req.getId())
                            .productName(req.getProductName())
                            .quantity(req.getQuantity())
                            .issue("Rental approved")
                            .build();
                    chaseItemService.addChaseItem(chaseDto2);
                }
                req.setApprovalStatus(ApprovalStatus.RETURN_PENDING);
            } else {
                req.setApprovalStatus(ApprovalStatus.APPROVED);
                ChaseItemRequestDto chaseDto2 = ChaseItemRequestDto.builder()
                        .requestId(req.getId())
                        .productName(req.getProductName())
                        .quantity(req.getQuantity())
                        .issue("Supply request approved (non-rental)")
                        .build();
                chaseItemService.addChaseItem(chaseDto2);
            }

        } else if (newStatus == ApprovalStatus.REJECTED) {
            req.setApprovalStatus(ApprovalStatus.REJECTED);

        } else if (newStatus == ApprovalStatus.RETURNED && req.isRental()) {
            InventoryInRequestDto inDto = new InventoryInRequestDto();
            inDto.setItemId(req.getItem().getId());
            inDto.setQuantity(req.getQuantity());
            inDto.setInbound(Inbound.RETURN);
            inDto.setCategoryId(req.getItem().getCategory().getId());
            inDto.setManagementId(req.getItem().getManagementDashboard().getId());
            inService.addInbound(inDto);

            for (int i = 0; i < req.getQuantity(); i++) {
                ItemInstance inst = instanceRepo.findFirstByItemIdAndOutboundAndStatus(
                                req.getItem().getId(), Outbound.LEND, Status.ACTIVE)
                        .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND));
                UpdateItemInstanceStatusRequestDto upd = new UpdateItemInstanceStatusRequestDto();
                upd.setOutbound(Outbound.AVAILABLE);
                upd.setFinalImage(inst.getImage());
                instanceService.updateStatus(inst.getId(), upd);
                ChaseItemRequestDto chaseDto2 = ChaseItemRequestDto.builder()
                        .requestId(req.getId())
                        .productName(req.getProductName())
                        .quantity(req.getQuantity())
                        .issue("Item returned")
                        .build();
                chaseItemService.addChaseItem(chaseDto2);
            }
            req.setApprovalStatus(ApprovalStatus.RETURNED);
        }

        SupplyRequest updated = repo.save(req);
        return mapToDto(updated);
    }

    private String generateInstanceCode(Item item) {
        return item.getSerialNumber() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional(readOnly = true)
    public List<SupplyRequestResponseDto> getAllRequests() {
        Long currentUserId = tokenService.getIdFromToken();
        Long mgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();
        return repo.findAllByManagementDashboardId(mgmtId).stream()
                .map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<SupplyRequestResponseDto> getMyRequests() {
        Long userId = tokenService.getIdFromToken();
        return repo.findAllByUserId(userId).stream()
                .map(this::mapToDto).toList();
    }

    @Transactional
    public SupplyRequestResponseDto updateMyRequest(Long requestId, SupplyRequestRequestDto dto) {
        if (dto.isRental() && dto.getReturnDate() == null) {
            throw new BusinessLogicException(ExceptionCode.INVALID_RETURN_DATE);
        }
        Long userId = tokenService.getIdFromToken();
        SupplyRequest req = repo.findById(requestId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));
        if (!req.getUser().getId().equals(userId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }
        if (req.getApprovalStatus() != ApprovalStatus.REQUESTED) {
            throw new BusinessLogicException(ExceptionCode.INVALID_REQUEST_STATUS);
        }
        req.setQuantity(dto.getQuantity());
        req.setPurpose(dto.getPurpose());
        req.setUseDate(dto.isRental() ? dto.getUseDate() : req.getUseDate());
        req.setReturnDate(dto.isRental() ? dto.getReturnDate() : req.getReturnDate());
        req.setReRequest(repo.existsByUserIdAndItemId(userId, req.getItem().getId()));
        return mapToDto(req);
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

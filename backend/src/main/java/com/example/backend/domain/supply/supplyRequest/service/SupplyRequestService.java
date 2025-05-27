package com.example.backend.domain.supply.supplyRequest.service;

import com.example.backend.domain.chaseItem.dto.request.ChaseItemRequestDto;
import com.example.backend.domain.chaseItem.service.ChaseItemService;
import com.example.backend.domain.supply.supplyRequest.dto.request.SupplyRequestRequestDto;
import com.example.backend.domain.supply.supplyRequest.dto.response.LentItemDto;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.domain.supply.supplyReturn.entity.SupplyReturn;
import com.example.backend.domain.supply.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.enums.*;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.inventory.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.domain.inventory.inventoryIn.service.InventoryInService;
import com.example.backend.domain.inventory.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.domain.inventory.inventoryOut.service.InventoryOutService;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.item.repository.ItemRepository;
import com.example.backend.domain.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.domain.itemInstance.entity.ItemInstance;
import com.example.backend.domain.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.domain.itemInstance.service.ItemInstanceService;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.supply.supplyRequest.dto.response.SupplyRequestResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
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
    private final SupplyReturnRepository supplyReturnRepository;

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
                .status(Status.ACTIVE)
                .build();
        req.setStatus(Status.ACTIVE);
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

    /**
     * 비품 요청 상태 변경 + 후처리 (승인·거절·반납)
     */
    @Transactional
    public SupplyRequestResponseDto updateRequestStatus(
            Long requestId,
            ApprovalStatus newStatus
    ) {
        SupplyRequest req = repo.findById(requestId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));

        String issueMsg;

        if (newStatus == ApprovalStatus.APPROVED) {
            // 1) 출고 처리: rental 여부에 따라 LEND 또는 ISSUE
            String outboundType = req.isRental()
                    ? Outbound.LEND.name()
                    : Outbound.ISSUE.name();

            InventoryOutRequestDto outDto = InventoryOutRequestDto.builder()
                    .supplyRequestId(req.getId())
                    .itemId(req.getItem().getId())
                    .categoryId(req.getItem().getCategory().getId())
                    .managementId(req.getItem().getManagementDashboard().getId())
                    .quantity(req.getQuantity())
                    .outbound(outboundType)    // <-- 수정된 부분
                    .build();
            outService.removeOutbound(outDto);

            // 2) 승인 처리 분기
            if (req.isRental()) {
                // ── 대여 승인: 인스턴스 생성 + 상태 RETURN_PENDING ──
                for (int i = 0; i < req.getQuantity(); i++) {
                    ItemInstance inst = ItemInstance.builder()
                            .item(req.getItem())
                            .instanceCode(generateInstanceCode(req.getItem()))
                            .outbound(Outbound.LEND)
                            .status(Status.ACTIVE)
                            .image(req.getItem().getImage())
                            .finalImage(req.getItem().getImage())
                            .borrower(req.getUser())
                            .build();
                    instanceRepo.save(inst);
                }
                req.setApprovalStatus(ApprovalStatus.RETURN_PENDING);
                issueMsg = "대여 승인 자동 기록";
            } else {
                // ── 비대여 승인: totalQuantity & availableQuantity 차감 ──
                Item item = req.getItem();
                long qty = req.getQuantity();
                if (item.getTotalQuantity() < qty || item.getAvailableQuantity() < qty) {
                    throw new BusinessLogicException(ExceptionCode.INSUFFICIENT_STOCK);
                }
                item.setTotalQuantity(item.getTotalQuantity() - qty);
                //item.setAvailableQuantity(item.getAvailableQuantity() - qty);
                itemRepo.save(item);

                req.setApprovalStatus(ApprovalStatus.APPROVED);
                issueMsg = "비대여 승인 자동 기록";
            }

        } else if (newStatus == ApprovalStatus.REJECTED) {
            // 거절: 재고 차감 없이 상태만 변경
            req.setApprovalStatus(ApprovalStatus.REJECTED);
            issueMsg = "요청 거절 자동 기록";

        } else if (newStatus == ApprovalStatus.RETURNED && req.isRental()) {
            // 반납 처리
            InventoryInRequestDto inDto = new InventoryInRequestDto();
            inDto.setItemId(req.getItem().getId());
            inDto.setQuantity(req.getQuantity());
            inDto.setInbound(Inbound.RETURN);
            inDto.setCategoryId(req.getItem().getCategory().getId());
            inDto.setManagementId(req.getItem().getManagementDashboard().getId());
            inService.addInbound(inDto);

            for (int i = 0; i < req.getQuantity(); i++) {
                ItemInstance inst = instanceRepo
                        .findFirstByItemIdAndOutboundAndStatus(
                                req.getItem().getId(), Outbound.LEND, Status.ACTIVE)
                        .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND));

                UpdateItemInstanceStatusRequestDto upd = new UpdateItemInstanceStatusRequestDto();
                upd.setOutbound(Outbound.AVAILABLE);
                upd.setFinalImage(inst.getImage());
                instanceService.updateStatus(inst.getId(), upd);
            }
            req.setApprovalStatus(ApprovalStatus.RETURNED);
            issueMsg = "반납 완료 자동 기록";

        } else {
            throw new BusinessLogicException(ExceptionCode.INVALID_REQUEST_STATUS);
        }

        // 비품 추적 기록 저장
        ChaseItemRequestDto chaseDto = ChaseItemRequestDto.builder()
                .requestId(req.getId())
                .productName(req.getProductName())
                .quantity(req.getQuantity())
                .issue(issueMsg)
                .build();
        chaseItemService.addChaseItem(chaseDto);

        // 최종 저장 및 DTO 반환
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

    public Map<ApprovalStatus, Long> getSupplyRequestCountsByApprovalStatus(Long userId) {
        List<Object[]> results = repo.countByApprovalStatusByUserId(userId);
        Map<ApprovalStatus, Long> countMap = new HashMap<>();
        for (Object[] result : results) {
            ApprovalStatus status = (ApprovalStatus) result[0];
            Long count = (Long) result[1];
            countMap.put(status, count);
        }
        return countMap;
    }

    @Transactional(readOnly = true)
    public Page<LentItemDto> getLentItems(Long userId, Pageable pageable) {
        Page<SupplyRequest> entityPage = repo.findByUserId(userId, pageable);

        Page<LentItemDto> dtoPage = entityPage.map(entity -> {
            LentItemDto dto = new LentItemDto();
            dto.setItemName(entity.getProductName());
            dto.setUseDate(entity.getUseDate());
            dto.setReturnDate(entity.getReturnDate());

            log.info("처리 중인 대여: itemName={}, useDate={}, returnDate={}",
                    dto.getItemName(), dto.getUseDate(), dto.getReturnDate());

            List<SupplyReturn> supplyReturnList = supplyReturnRepository.findBySupplyRequest(entity);
            log.debug("관련된 반납 정보 수: {}", supplyReturnList.size());

            if (supplyReturnList != null && !supplyReturnList.isEmpty()) {
                dto.setRentStatus(RentStatus.RETURNED);
                log.info("반납 완료 처리됨");
            } else {
                LocalDate today = LocalDate.now();
                LocalDate returnDate = dto.getReturnDate().toLocalDate();

                if (returnDate.isBefore(today)) {
                    dto.setRentStatus(RentStatus.OVERDUE);
                    log.info("연체 처리됨 (returnDate={}, today={})", returnDate, today);
                } else {
                    dto.setRentStatus(RentStatus.RENTING);
                    log.info("대여중 처리됨 (returnDate={}, today={})", returnDate, today);
                }
            }

            return dto;
        });

        log.info("전체 대여 항목 {}건 반환", dtoPage.getContent().size());
        return dtoPage;
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

package com.example.backend.supplyRequest.service;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Inbound;
import com.example.backend.enums.Outbound;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.inventoryIn.service.InventoryInService;
import com.example.backend.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryOut.service.InventoryOutService;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
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

@Service
@RequiredArgsConstructor
public class SupplyRequestService {

    private final SupplyRequestRepository repo;
    private final ItemRepository itemRepo;
    private final UserRepository userRepo;
    private final TokenService tokenService;
    private final InventoryOutService outService;
    private final InventoryInService inService;

    /**
     * 비품 요청 생성
     */
    @Transactional
    public SupplyRequestResponseDto createRequest(SupplyRequestRequestDto dto) {

        //  대여 하면 returnDate 필수 검사
        if (dto.isRental() && dto.getReturnDate() == null) {
            throw new BusinessLogicException(ExceptionCode.INVALID_RETURN_DATE);
        }

        // 1) 아이템 조회
        Item item = itemRepo.findByName(dto.getProductName())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        // 2) 요청자 조회
        Long userId = tokenService.getIdFromToken();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        // 3) 관리대시보드
        ManagementDashboard mgmt = item.getManagementDashboard();

        // 4) 수량 체크
        if (dto.getQuantity() > item.getAvailableQuantity()) {
            throw new BusinessLogicException(ExceptionCode.INSUFFICIENT_STOCK);
        }

        // 5) 날짜 처리
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime useDate    = dto.isRental() ? dto.getUseDate()    : now;
        LocalDateTime returnDate = dto.isRental() ? dto.getReturnDate() : null;

        // 6) 재요청 여부
        boolean isReRequest = repo.existsByUserIdAndItemId(userId, item.getId());

        // 7) 엔티티 생성 & 저장
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

    /**
     * 같은 관리페이지 내, 특정 상태(PENDING 등)의 요청 리스트 조회
     */
    @Transactional(readOnly = true)
    public List<SupplyRequestResponseDto> findRequestsByManagementAndStatus(
            Long mgmtId, ApprovalStatus status
    ) {
        return repo.findAllByManagementDashboardIdAndApprovalStatus(mgmtId, status).stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * 요청 승인 처리 (매니저 전용)
     */
    @Transactional
    public void approveRequest(Long requestId) {
        updateRequestStatus(requestId, ApprovalStatus.APPROVED);
    }

    /**
     * 요청 거절 처리 (매니저 전용)
     */
    @Transactional
    public void rejectRequest(Long requestId) {
        updateRequestStatus(requestId, ApprovalStatus.REJECTED);
    }

    /**
     * 내부: 상태 업데이트 및 재고 입출고 처리
     */
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
            // 출고 처리
            InventoryOutRequestDto outDto = new InventoryOutRequestDto();
            outDto.setSupplyRequestId(req.getId());
            outDto.setItemId(req.getItem().getId());
            outDto.setCategoryId(req.getItem().getCategory().getId());
            outDto.setManagementId(req.getItem().getManagementDashboard().getId());
            outDto.setQuantity(req.getQuantity());
            outDto.setOutbound(req.isRental() ? Outbound.LEND.name() : Outbound.ISSUE.name());
            outService.removeOutbound(outDto);

            // 상태 전환
            if (req.isRental()) {
                req.setApprovalStatus(ApprovalStatus.RETURN_PENDING);
            } else {
                req.setApprovalStatus(ApprovalStatus.APPROVED);
            }
        }

        if (newStatus == ApprovalStatus.RETURNED && req.isRental()) {
            // 반납 입고 처리
            InventoryInRequestDto inDto = new InventoryInRequestDto();
            inDto.setItemId(req.getItem().getId());
            inDto.setQuantity(req.getQuantity());
            inDto.setInbound(Inbound.RETURN);
            inDto.setCategoryId(req.getItem().getCategory().getId());
            inDto.setManagementId(req.getItem().getManagementDashboard().getId());
            inService.addInbound(inDto);

            req.setApprovalStatus(ApprovalStatus.RETURNED);
        }

        SupplyRequest updated = repo.save(req);
        return mapToDto(updated);
    }

    /**
     * ExcelExportController 등에서 사용하는, 같은 관리페이지 내
     * **모든** 요청 리스트 조회 메서드
     */
    @Transactional(readOnly = true)
    public List<SupplyRequestResponseDto> getAllRequests() {
        Long currentUserId = tokenService.getIdFromToken();
        Long mgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        return repo.findAllByManagementDashboardId(mgmtId).stream()
                .map(this::mapToDto)
                .toList();
    }


    /** 내 요청 리스트만 조회 */
    @Transactional(readOnly = true)
    public List<SupplyRequestResponseDto> getMyRequests() {
        Long userId = tokenService.getIdFromToken();
        return repo.findAllByUserId(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    /** 내 요청만, 상태 REQUESTED 일 때만 수정 */
    @Transactional
    public SupplyRequestResponseDto updateMyRequest(Long requestId, SupplyRequestRequestDto dto) {

        // 대여 하면returnDate 필수 검사
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

        // 수정 허용 필드만 갱신
        req.setQuantity(dto.getQuantity());
        req.setPurpose(dto.getPurpose());
        req.setUseDate(dto.isRental() ? dto.getUseDate() : req.getUseDate());
        req.setReturnDate(dto.isRental() ? dto.getReturnDate() : req.getReturnDate());
        // 재요청 플래그 재계산
        req.setReRequest(repo.existsByUserIdAndItemId(userId, req.getItem().getId()));

        return mapToDto(req);
    }

    /**
     * DTO 매핑
     */
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

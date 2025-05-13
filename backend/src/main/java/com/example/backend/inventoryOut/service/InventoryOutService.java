package com.example.backend.inventoryOut.service;

import com.example.backend.analysis.service.InventoryAnalysisService;
import com.example.backend.analysis.service.InventoryAnalysisService;
import com.example.backend.category.entity.Category;
import com.example.backend.category.repository.CategoryRepository;
import com.example.backend.enums.Outbound;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.inventoryOut.dto.response.InventoryOutResponseDto;
import com.example.backend.inventoryOut.entity.InventoryOut;
import com.example.backend.inventoryOut.repository.InventoryOutRepository;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.itemInstance.service.ItemInstanceService;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class InventoryOutService {
    private final InventoryOutRepository outRepo;
    private final ItemRepository itemRepo;
    private final SupplyRequestRepository supplyRequestRepo;
    private final CategoryRepository categoryRepo;
    private final ManagementDashboardRepository mgmtRepo;
    private final ItemInstanceService instanceService;
    private final ItemInstanceRepository instanceRepo;
    private final UserRepository userRepo;
    private final TokenService tokenService;
    private final InventoryAnalysisService inventoryAnalysisService;


    @Transactional
    public InventoryOutResponseDto removeOutbound(InventoryOutRequestDto dto) {

        //권한체크
        Long currentUserId = tokenService.getIdFromToken();
        SupplyRequest req = supplyRequestRepo.findById(dto.getSupplyRequestId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));

        Long userMgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        if (!req.getManagementDashboard().getId().equals(userMgmtId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        // 0) SupplyRequest, Category, ManagementDashboard 조회

        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
        ManagementDashboard mgmt = mgmtRepo.findById(dto.getManagementId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        // 1) Item 조회
        Item item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        // 2) 재고 충분 여부 검사
        if (item.getAvailableQuantity() < dto.getQuantity()) {
            throw new BusinessLogicException(ExceptionCode.INSUFFICIENT_STOCK);
        }

        // 3) 출고 내역 엔티티 생성 및 저장
        InventoryOut entity = InventoryOut.builder()
                .supplyRequest(req)
                .item(item)
                .category(category)
                .managementDashboard(mgmt)
                .quantity(dto.getQuantity())
                .outbound(Outbound.valueOf(dto.getOutbound()))
                .build();
        InventoryOut saved = outRepo.save(entity);

        // Redis 사용 빈도 증가
        try {
            inventoryAnalysisService.increaseItemUsage(saved.getItem().getName(), saved.getQuantity());
        } catch (Exception e) {
            log.warn("Redis 사용 빈도 증가 실패: {}", e.getMessage());
        }


        // 4) 아이템 재고 차감
        item.setAvailableQuantity(item.getAvailableQuantity() - saved.getQuantity());

        // 5) 개별자산단위 상태 변경 (출고: AVAILABLE → LEND 또는 ISSUE)
        for (int i = 0; i < saved.getQuantity(); i++) {
            ItemInstance inst = instanceRepo
                    .findFirstByItemIdAndStatus(item.getId(), Outbound.AVAILABLE)
                    .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND));
            UpdateItemInstanceStatusRequestDto upd = new UpdateItemInstanceStatusRequestDto();
            upd.setStatus(saved.getOutbound());  // LEND 또는 ISSUE
            upd.setFinalImage(null);
            instanceService.updateStatus(inst.getId(), upd);
        }

        // 6) 응답 DTO 반환
        return InventoryOutResponseDto.builder()
                .id(saved.getId())
                .supplyRequestId(saved.getSupplyRequest().getId())
                .itemId(saved.getItem().getId())
                .categoryId(saved.getCategory().getId())
                .managementId(saved.getManagementDashboard().getId())
                .quantity(saved.getQuantity())
                .outbound(saved.getOutbound().name())
                .createdAt(saved.getCreatedAt())
                .modifiedAt(saved.getModifiedAt())
                .build();
    }

    /** 전체 출고내역 조회 (Excel 다운로드용) */
    @Transactional(readOnly = true)
    public List<InventoryOutResponseDto> getAllOutbound() {

        // 권한체크 및 대시보드 id 조회
        Long currentUserId = tokenService.getIdFromToken();
        Long userMgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        // 해당 관리대시보드 출고내역만 조회
        return outRepo.findAllByManagementDashboardId(userMgmtId).stream()
                .map(out -> InventoryOutResponseDto.builder()
                        .id(out.getId())
                        .supplyRequestId(out.getSupplyRequest().getId())
                        .itemId(out.getItem().getId())
                        .categoryId(out.getCategory().getId())
                        .managementId(out.getManagementDashboard().getId())
                        .quantity(out.getQuantity())
                        .outbound(out.getOutbound().name())
                        .createdAt(out.getCreatedAt())
                        .modifiedAt(out.getModifiedAt())
                        .build())
                .toList();
    }
}

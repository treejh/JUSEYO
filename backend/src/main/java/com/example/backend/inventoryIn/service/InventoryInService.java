package com.example.backend.inventoryIn.service;

import com.example.backend.category.entity.Category;
import com.example.backend.category.repository.CategoryRepository;
import com.example.backend.enums.Inbound;
import com.example.backend.enums.Outbound;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.inventoryIn.dto.response.InventoryInResponseDto;
import com.example.backend.inventoryIn.entity.InventoryIn;
import com.example.backend.inventoryIn.repository.InventoryInRepository;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.itemInstance.dto.request.CreateItemInstanceRequestDto;
import com.example.backend.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.itemInstance.service.ItemInstanceService;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryInService {
    private final InventoryInRepository inRepo;
    private final ItemRepository itemRepo;
    private final CategoryRepository categoryRepo;
    private final ManagementDashboardRepository mgmtRepo;
    private final ItemInstanceService instanceService;
    private final ItemInstanceRepository instanceRepo;

    @Transactional
    public InventoryInResponseDto addInbound(InventoryInRequestDto dto) {
        // 1) 입고 내역 저장
        InventoryIn inbound = InventoryIn.builder()
                .item(itemRepo.findById(dto.getItemId()).orElse(null))
                .quantity(dto.getQuantity())
                .inbound(Inbound.valueOf(dto.getInbound()))
                .build();
        InventoryIn savedInbound = inRepo.save(inbound);

        // 2) 아이템 처리: 기존 아이템이 있으면 수량 증가, 없으면 새로 생성
        Item item;
        if (itemRepo.existsById(dto.getItemId())) {
            item = itemRepo.findById(dto.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            item.setTotalQuantity(item.getTotalQuantity() + savedInbound.getQuantity());
            item.setAvailableQuantity(item.getAvailableQuantity() + savedInbound.getQuantity());
        } else {
            // 2-a) 연관 엔티티 조회
            Category category = categoryRepo.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            ManagementDashboard mgmt = mgmtRepo.findById(dto.getManagementId())
                    .orElseThrow(() -> new IllegalArgumentException("ManagementDashboard not found"));

            // 2-b) 신규 아이템 생성 (시리얼 자동 생성)
            String serial = RandomStringUtils.randomAlphanumeric(15);
            item = Item.builder()
                    .name(dto.getName())
                    .serialNumber(serial)
                    .totalQuantity(savedInbound.getQuantity())
                    .availableQuantity(savedInbound.getQuantity())
                    .purchaseSource(dto.getPurchaseSource())
                    .location(dto.getLocation())
                    .isReturnRequired(dto.getIsReturnRequired())
                    .category(category)
                    .managementDashboard(mgmt)
                    .createdAt(savedInbound.getCreatedAt())  // 생성일자를 입고일로 설정
                    .build();
            item = itemRepo.save(item);
        }

        // 3) 개별자산단위 자동 생성/반납 처리
        if (savedInbound.getInbound() == Inbound.PURCHASE) {
            // 구매 입고: 수량만큼 신규 인스턴스 생성
            for (int i = 0; i < savedInbound.getQuantity(); i++) {
                CreateItemInstanceRequestDto cri = new CreateItemInstanceRequestDto();
                cri.setItemId(item.getId());
                cri.setImage(item.getImage());
                instanceService.createInstance(cri);
            }
        } else if (savedInbound.getInbound() == Inbound.RETURN) {
            // 반납 입고: 수량만큼 가장 오래된 대여중 인스턴스를 AVAILABLE로
            for (int i = 0; i < savedInbound.getQuantity(); i++) {
                ItemInstance inst = instanceRepo
                        .findFirstByItemIdAndStatus(item.getId(), Outbound.LEND)
                        .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND));
                UpdateItemInstanceStatusRequestDto upd = new UpdateItemInstanceStatusRequestDto();
                upd.setStatus(Outbound.AVAILABLE);
                upd.setFinalImage(null);
                instanceService.updateStatus(inst.getId(), upd);
            }
        }

        // 4) 응답 DTO 반환
        return InventoryInResponseDto.builder()
                .id(savedInbound.getId())
                .itemId(item.getId())
                .quantity(savedInbound.getQuantity())
                .inbound(savedInbound.getInbound().name())
                .createdAt(savedInbound.getCreatedAt())
                .modifiedAt(savedInbound.getModifiedAt())
                .build();
    }

    /** 전체 입고내역 조회 (Excel용) */
    @Transactional(readOnly = true)
    public List<InventoryInResponseDto> getAllInbound() {
        return inRepo.findAll().stream()
                .map(in -> InventoryInResponseDto.builder()
                        .id(in.getId())
                        .itemId(in.getItem().getId())
                        .quantity(in.getQuantity())
                        .inbound(in.getInbound().name())
                        .createdAt(in.getCreatedAt())
                        .modifiedAt(in.getModifiedAt())
                        .build())
                .toList();
    }
}

package com.example.backend.domain.inventory.inventoryIn.service;

import com.example.backend.domain.category.repository.CategoryRepository;
import com.example.backend.domain.inventory.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.domain.inventory.inventoryIn.entity.InventoryIn;
import com.example.backend.domain.inventory.inventoryIn.repository.InventoryInRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.enums.Inbound;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.global.utils.service.ImageService;
import com.example.backend.domain.inventory.inventoryIn.dto.response.InventoryInExcelResponseDto;
import com.example.backend.domain.inventory.inventoryIn.dto.response.InventoryInResponseDto;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.item.repository.ItemRepository;
import com.example.backend.domain.itemInstance.dto.request.CreateItemInstanceRequestDto;
import com.example.backend.domain.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.domain.itemInstance.entity.ItemInstance;
import com.example.backend.domain.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.domain.itemInstance.service.ItemInstanceService;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.domain.supply.supplyReturn.entity.SupplyReturn;
import com.example.backend.domain.supply.supplyReturn.repository.SupplyReturnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryInService {
    private final InventoryInRepository inRepo;
    private final ItemRepository itemRepo;
    private final SupplyReturnRepository returnRequestRepository;
    private final ManagementDashboardRepository managementDashboardRepository;
    private final ItemInstanceService instanceService;
    private final ImageService imageService;
    private final ItemInstanceRepository instanceRepo;
    private final CategoryRepository categoryRepository;
    private final TokenService tokenService;
    private final UserRepository userRepository;


    // 입고 생성
    @Transactional
    public InventoryInResponseDto addInbound(InventoryInRequestDto dto) {
        Item item;
        item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
        if(dto.getInbound()!=Inbound.PURCHASE&&dto.getInbound()!=Inbound.RE_PURCHASE) {
            // 1) 아이템 처리: 수량 증가
            item.setTotalQuantity(item.getTotalQuantity() + dto.getQuantity());
            item.setAvailableQuantity(item.getAvailableQuantity() + dto.getQuantity());
        }
        SupplyReturn supplyReturn =null;
        if(dto.getInbound()==Inbound.RETURN){
            supplyReturn =returnRequestRepository.findById(dto.getReturnId()).orElse(null);
            if(supplyReturn ==null){
                throw new BusinessLogicException(ExceptionCode.SUPPLY_RETURN_NOT_FOUND);
            }
        }
        // 2) 입고 내역 저장
        ManagementDashboard managementDashboard=managementDashboardRepository.findById(dto.getManagementId()).orElse(null);
        if(managementDashboard==null){
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }
        InventoryIn savedInbound=null;
        if(dto.getInbound()==Inbound.RE_PURCHASE&&dto.getImage()==null) {
            InventoryIn inbound = InventoryIn.builder()
                    .item(item)
                    .quantity(dto.getQuantity())
                    .inbound(dto.getInbound())
                    .supplyReturn(supplyReturn)
                    .category(item.getCategory())
                    .managementDashboard(managementDashboard)
                    .quantity(dto.getQuantity())
                    .image(item.getImage())
                    .build();
             savedInbound = inRepo.save(inbound);
        }else {
            InventoryIn inbound = InventoryIn.builder()
                    .item(item)
                    .quantity(dto.getQuantity())
                    .inbound(dto.getInbound())
                    .supplyReturn(supplyReturn)
                    .category(item.getCategory())
                    .managementDashboard(managementDashboard)
                    .quantity(dto.getQuantity())
                    .image(imageService.saveImage(dto.getImage()))
                    .build();
             savedInbound = inRepo.save(inbound);
        }

        // 3) 개별자산단위 자동 생성/반납 처리
        if (savedInbound.getInbound() == Inbound.PURCHASE||savedInbound.getInbound() == Inbound.RE_PURCHASE) {
            // 구매 입고: 수량만큼 신규 인스턴스 생성
            for(int i = 0; i < savedInbound.getQuantity(); i++) {
                CreateItemInstanceRequestDto cri = new CreateItemInstanceRequestDto();
                cri.setItemId(item.getId());
                cri.setImage(item.getImage());
                instanceService.createInstance(cri);
            }
        } else if (savedInbound.getInbound() == Inbound.RETURN) {
            // 반납 입고: 수량만큼 가장 오래된 대여중 인스턴스를 AVAILABLE로
            for (int i = 0; i < savedInbound.getQuantity(); i++) {
                ItemInstance inst = instanceRepo
                        .findFirstByItemIdAndOutboundAndStatus(item.getId(), Outbound.LEND, Status.ACTIVE)
                        .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND));
                UpdateItemInstanceStatusRequestDto upd = new UpdateItemInstanceStatusRequestDto();
                upd.setOutbound(Outbound.AVAILABLE);
                upd.setFinalImage(imageService.saveImage(dto.getImage()));
                instanceService.updateStatus(inst.getId(), upd);
            }
        }


        // 4) 응답 DTO 반환
        return InventoryInResponseDto.builder()
                .id(savedInbound.getId())
                .itemId(item.getId())
                .itemName(item.getName())
                .quantity(savedInbound.getQuantity())
                .inbound(savedInbound.getInbound())
                .createdAt(savedInbound.getCreatedAt())
                .categoryName(savedInbound.getCategory().getName())
                .build();
    }


    /** 전체 입고내역 조회 (Excel용) */
    public List<InventoryInExcelResponseDto> getAllInboundForExcel() {
        return inRepo.findAll().stream()
                .map(in -> InventoryInExcelResponseDto.builder()
                        .id(in.getId())
                        .itemId(in.getItem().getId())
                        .itemName(in.getItem().getName())
                        .categoryName(in.getCategory().getName())
                        .quantity(in.getQuantity())
                        .inbound(in.getInbound())
                        .createdAt(in.getCreatedAt())
                        .modifiedAt(in.getModifiedAt())
                        .build()
                )
                .toList();
    }


    //입고 내역 목록 조회
    public Page<InventoryInResponseDto> getInventoryIns(Pageable pageable,Inbound inbound) {
        Long id=tokenService.getIdFromToken();
        User user=userRepository.findById(id).orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        if (inbound != null) {
            return inRepo.getInventoryInsByInboundAndManagementId(inbound,user.getManagementDashboard().getId(), pageable);
        } else {
            return inRepo.getInventoryInsByManagementId(user.getManagementDashboard().getId(),pageable);
        }

    }

    //입고 내역 조회 (단건)
    public InventoryInResponseDto getInventoryIn(Long id) {
        return toDto(inRepo.findById(id)
                .orElseThrow(()-> new BusinessLogicException(ExceptionCode.INVENTORY_IN_NOT_FOUND)));
    }

    public InventoryInResponseDto toDto(InventoryIn inventoryIn) {
        InventoryInResponseDto inventoryInResponseDto = InventoryInResponseDto.builder()
                .id(inventoryIn.getId())
                .itemId(inventoryIn.getItem().getId())
                .itemName(inventoryIn.getItem().getName())
                .quantity(inventoryIn.getQuantity())
                .inbound(inventoryIn.getInbound())
                .createdAt(inventoryIn.getCreatedAt())
                .image(inventoryIn.getImage())
                .categoryName(categoryRepository.findById(inventoryIn.getCategory().getId()).orElseThrow(()->new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND)).getName())
                .build();
        return inventoryInResponseDto;
    }

    // 비품 ID 기준 입고내역 조회
    public Page<InventoryInResponseDto> getInventoryInsByItemId(
            Long itemId,
            Pageable pageable
    ) {
        // 1) 관리대시보드 ID 조회
        Long userId = tokenService.getIdFromToken();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        Long mgmtId = user.getManagementDashboard().getId();

        // 2) Repository 호출
        return inRepo.getInventoryInsByItemIdAndManagementId(mgmtId, itemId, pageable);
    }

}

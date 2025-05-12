package com.example.backend.inventoryIn.service;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.inventoryIn.dto.response.InventoryInResponseDto;
import com.example.backend.inventoryIn.entity.InventoryIn;
import com.example.backend.inventoryIn.repository.InventoryInRepository;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.enums.Inbound;
import com.example.backend.supplyReturn.entity.SupplyReturn;
import com.example.backend.supplyReturn.repository.SupplyReturnRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryInService {
    private final InventoryInRepository inRepo;
    private final ItemRepository itemRepo;
    private final SupplyReturnRepository returnRequestRepository;
    private final ManagementDashboardRepository managementDashboardRepository;


    // 입고 생성
    @Transactional
    public InventoryInResponseDto addInbound(InventoryInRequestDto dto) {
        // 1) 아이템 처리: 수량 증가
        Item item;
        item = itemRepo.findById(dto.getItemId())
                    .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
        item.setTotalQuantity(item.getTotalQuantity() + dto.getQuantity());
        item.setAvailableQuantity(item.getAvailableQuantity() + dto.getQuantity());

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
        InventoryIn inbound = InventoryIn.builder()
                .item(item)
                .quantity(dto.getQuantity())
                .inbound(dto.getInbound())
                .supplyReturn(supplyReturn)
                .category(item.getCategory())
                .managementDashboard(managementDashboard)
                .quantity(dto.getQuantity())
                .build();
        InventoryIn savedInbound = inRepo.save(inbound);

        // 3) 응답 DTO 반환
        return InventoryInResponseDto.builder()
                .id(savedInbound.getId())
                .itemId(item.getId())
                .itemName(item.getName())
                .quantity(savedInbound.getQuantity())
                .inbound(savedInbound.getInbound())
                .createdAt(savedInbound.getCreatedAt())
                .build();
    }

    //입고 내역 목록 조회
    public Page<InventoryInResponseDto> getInventoryIns(Pageable pageable,Inbound inbound) {
        if (inbound != null) {
            return inRepo.getInventoryInsByInbound(inbound, pageable);
        } else {
            return inRepo.getInventoryIns(pageable);
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
                .build();
        return inventoryInResponseDto;
    }

}

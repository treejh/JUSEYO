package com.example.backend.domain.supply.supplyReturn.service;

import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.domain.supply.supplyReturn.entity.SupplyReturn;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Inbound;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.inventory.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.domain.inventory.inventoryIn.service.InventoryInService;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.item.repository.ItemRepository;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.domain.supply.supplyReturn.dto.request.SupplyReturnRequestDto;
import com.example.backend.domain.supply.supplyReturn.dto.request.SupplyReturnStatusUpdateRequestDto;
import com.example.backend.domain.supply.supplyReturn.dto.response.SupplyReturnResponseDto;
import com.example.backend.domain.supply.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.global.security.jwt.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplyReturnService {
    private final SupplyReturnRepository supplyReturnRepository;
    private final SupplyRequestRepository supplyRequestRepository;
    private final UserRepository userRepository;
    private final ManagementDashboardRepository managementDashboardRepository;
    private final ItemRepository itemRepository;
    private final InventoryInService inventoryInService;
    private final TokenService tokenService;

    //비품 반납 요청 생성
    @Transactional
    public SupplyReturnResponseDto addSupplyReturn(SupplyReturnRequestDto supplyReturnRequestDto) {
        SupplyRequest supplyRequest = supplyRequestRepository.findById(supplyReturnRequestDto.getRequestId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));

        User user = userRepository.findById(supplyReturnRequestDto.getUserId()).orElse(null);
        if (user == null) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }
        ManagementDashboard managementDashboard = managementDashboardRepository.findById(supplyReturnRequestDto.getManagementId()).orElse(null);
        if (managementDashboard == null) {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }
        Item item = itemRepository.findById(supplyReturnRequestDto.getItemId()).orElse(null);
        if (item == null) {
            throw new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND);
        }
        SupplyReturn supplyReturn = SupplyReturn.builder()
                .supplyRequest(supplyRequest)
                .user(user)
                .managementDashboard(managementDashboard)
                .item(item)
                .serialNumber(supplyReturnRequestDto.getSerialNumber())
                .productName(supplyReturnRequestDto.getProductName())
                .quantity(supplyReturnRequestDto.getQuantity())
                .useDate(supplyRequest.getUseDate())
                .returnDate(supplyReturnRequestDto.getReturnDate())
                .approvalStatus(ApprovalStatus.RETURN_PENDING)
                .outbound(supplyReturnRequestDto.getOutbound())
                .build();
        supplyReturnRepository.save(supplyReturn);
        return toDto(supplyReturn);

    }

    //비품 반납서 목록 조회
    public Page<SupplyReturnResponseDto> getSupplyReturns(Pageable pageable,ApprovalStatus approvalStatus) {
        Long id=tokenService.getIdFromToken();
        User user = userRepository.findById(id).orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        if(approvalStatus==null){
            return supplyReturnRepository.findAllSupplyReturn(user.getManagementDashboard().getId(),pageable);
        }else{
            return supplyReturnRepository.findAllSupplyRequestByApprovalStatusAndManagement(approvalStatus,user.getManagementDashboard().getId(),pageable);
        }
    }

    //비품 반납서 단일 조회
    public SupplyReturnResponseDto getSupplyReturn(Long id){
        SupplyReturn supplyReturn = supplyReturnRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_RETURN_NOT_FOUND));
        return toDto(supplyReturn);
    }

    //비품 반납서 상태 변경
    @Transactional
    public SupplyReturnResponseDto updateSupplyReturn(Long id, SupplyReturnStatusUpdateRequestDto dto) {
        SupplyReturn supplyReturn = supplyReturnRepository.findById(id).orElse(null);
        if (supplyReturn == null) {
            throw new BusinessLogicException(ExceptionCode.SUPPLY_RETURN_NOT_FOUND);
        }
        supplyReturn.setApprovalStatus(dto.getApprovalStatus());
        if(dto.getApprovalStatus()==ApprovalStatus.RETURNED){
            addInbound(supplyReturn, dto.getImage());
        }
        return toDto(supplyReturn);
    }

    //입고요청 생성
    @Transactional
    public void addInbound(SupplyReturn supplyReturn, MultipartFile multipartFile) {
        InventoryInRequestDto inventoryInRequestDto = InventoryInRequestDto.builder()
                .itemId(supplyReturn.getItem().getId())
                .returnId(supplyReturn.getId())
                .quantity(supplyReturn.getQuantity())
                .inbound(Inbound.RETURN)
                .categoryId(supplyReturn.getItem().getCategory().getId())
                .managementId(supplyReturn.getManagementDashboard().getId())
                .image(multipartFile)
                .build();
        inventoryInService.addInbound(inventoryInRequestDto);
    }


    public SupplyReturnResponseDto toDto(SupplyReturn supplyReturn) {
        SupplyReturnResponseDto supplyReturnResponseDto = SupplyReturnResponseDto.builder()
                .id(supplyReturn.getId())
                .requestId(supplyReturn.getSupplyRequest().getId())
                .userId(supplyReturn.getUser().getId())
                .itemId(supplyReturn.getItem().getId())
                .managementId(supplyReturn.getManagementDashboard().getId())
                .serialNumber(supplyReturn.getSerialNumber())
                .productName(supplyReturn.getProductName())
                .quantity(supplyReturn.getQuantity())
                .useDate(supplyReturn.getUseDate())
                .returnDate(supplyReturn.getReturnDate())
                .approvalStatus(supplyReturn.getApprovalStatus())
                .createdAt(supplyReturn.getCreatedAt())
                .outbound(supplyReturn.getOutbound())
                .build();
        return supplyReturnResponseDto;
    }

    /**
     * 엑셀 다운로드용: 모든 반납 요청서 조회
     */
    public List<SupplyReturnResponseDto> getAllReturnsForExcel() {
        // repository의 findAllSupplyReturn(Pageable) 대신, 직접 엔티티 전체를 DTO로 변환
        return supplyReturnRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }
}

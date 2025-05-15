package com.example.backend.itemInstance.service;

import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.itemInstance.dto.request.CreateItemInstanceRequestDto;
import com.example.backend.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.itemInstance.dto.response.ItemInstanceResponseDto;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemInstanceService {
    private final ItemRepository itemRepo;
    private final ItemInstanceRepository instanceRepo;
    private final UserRepository userRepo;
    private final TokenService tokenService;

    @Transactional
    public ItemInstanceResponseDto createInstance(CreateItemInstanceRequestDto dto) {

        // 권한체크
        Long currentUserId = tokenService.getIdFromToken();
        Item item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        Long userMgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        if (!item.getManagementDashboard().getId().equals(userMgmtId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }


        // 1) 순번 계산 (기존 인스턴스 개수 + 1)
        long seq = instanceRepo.countByItemId(item.getId()) + 1;

        // 2) 랜덤 8글자
        String random = UUID.randomUUID().toString().substring(0, 8);

        // 3) 비품명-8자리 순번-랜덤 예:PEN_Example-00000001-a1b2c3d4
        String namePart = item.getName().replaceAll("\\s+", "_");
        String code = String.format("%s-%08d-%s", namePart, seq, random);

        ItemInstance inst = ItemInstance.builder()
                .item(item)
                .instanceCode(code)
                .outbound(Outbound.AVAILABLE)
                .image(dto.getImage())
                .build();

        ItemInstance saved = instanceRepo.save(inst);
        return map(saved);
    }

    @Transactional(readOnly = true)
    public List<ItemInstanceResponseDto> getByItem(Long itemId) {
        // 권한체크
        Long currntUserId = tokenService.getIdFromToken();
        Long userMgmtId = userRepo.findById(currntUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        // 대상 아이템 조회 및 대시보드 비교
        Item item = itemRepo.findById(itemId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
        if (!item.getManagementDashboard().getId().equals(userMgmtId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        // 권한 통과한 경우에만 인스턴스 반환
        return instanceRepo.findAllByItemIdAndStatus(itemId, Status.ACTIVE).stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Transactional
    public ItemInstanceResponseDto updateStatus(Long instanceId, UpdateItemInstanceStatusRequestDto dto) {

        ItemInstance inst = instanceRepo.findById(instanceId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND));

        Long currentUserId = tokenService.getIdFromToken();
        Long userMgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        if (!inst.getItem().getManagementDashboard().getId().equals(userMgmtId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        inst.setOutbound(dto.getOutbound());
        inst.setFinalImage(dto.getFinalImage());
        ItemInstance saved = instanceRepo.save(inst);
        return map(saved);
    }

    public void softDeleteHighestItemInstances(Long itemId, int count) {
        List<ItemInstance> instances = instanceRepo
                .findTopNActiveByItemId(itemId, PageRequest.of(0, count));

        if (instances.size() < count) {
            throw new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND);
        }

        for (ItemInstance instance : instances) {
            instance.setStatus(Status.STOP);
        }
    }

    public void softDeleteInstances(Long itemId) {
        List<ItemInstance> instances = instanceRepo.findAllByItemIdAndStatus(itemId,Status.ACTIVE);

        for (ItemInstance instance : instances) {
            instance.setStatus(Status.STOP);
        }
    }

    public Long countItemInstances(Long itemId) {
        return instanceRepo.countByItemId(itemId);
    }

    private ItemInstanceResponseDto map(ItemInstance e) {
        return ItemInstanceResponseDto.builder()
                .id(e.getId())
                .itemId(e.getItem().getId())
                .instanceCode(e.getInstanceCode())
                .outbound(e.getOutbound())
                .image(e.getImage())
                .finalImage(e.getFinalImage())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }
}

package com.example.backend.itemInstance.service;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.itemInstance.dto.response.ItemInstanceResponseDto;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
    private final TokenService tokenService;
    private final UserRepository userRepo;

    @Transactional
    public ItemInstanceResponseDto createInstance(Long itemId) {
        Item item = itemRepo.findById(itemId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        String code = item.getSerialNumber()
                + "-" + UUID.randomUUID().toString().substring(0, 8);

        ItemInstance inst = ItemInstance.builder()
                .item(item)
                .instanceCode(code)
                .status(InstanceStatus.AVAILABLE)
                .build();

        ItemInstance saved = instanceRepo.save(inst);
        return map(saved);
    }

    @Transactional(readOnly = true)
    public List<ItemInstanceResponseDto> getByItem(Long itemId) {
        // 1) 토큰에서 userId 뽑아서, 사용자의 managementDashboard 확인
        Long userId = tokenService.getIdFromToken();
        User me = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        Long myMgmtId = me.getManagementDashboard().getId();

        // 2) 해당 item이 내 관리페이지 소속인지 검증
        Item item = itemRepo.findById(itemId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
        if (!item.getManagementDashboard().getId().equals(myMgmtId)) {
            // 소속이 다르면 404 처리
            throw new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND);
        }

        // 3) 검증 통과 시에만 인스턴스 조회
        return instanceRepo.findAllByItemId(itemId).stream()
                .map(this::map)
                .collect(Collectors.toList());
    }


    @Transactional
    public ItemInstanceResponseDto updateStatus(Long instanceId, InstanceStatus newStatus) {
        ItemInstance inst = instanceRepo.findById(instanceId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        inst.setStatus(newStatus);
        ItemInstance saved = instanceRepo.save(inst);
        return map(saved);
    }

    private ItemInstanceResponseDto map(ItemInstance e) {
        return ItemInstanceResponseDto.builder()
                .id(e.getId())
                .itemId(e.getItem().getId())
                .instanceCode(e.getInstanceCode())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }
}

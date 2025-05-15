package com.example.backend.itemInstance.service;

import com.example.backend.enums.Outbound;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

        // 비품 보유수량 초과 금지
        long existingCount = instanceRepo.countByItemId(item.getId());

        if (existingCount >= item.getTotalQuantity()) {
            throw new BusinessLogicException(ExceptionCode.INSUFFICIENT_STOCK);
        }

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
                .status(Outbound.AVAILABLE)
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
        return instanceRepo.findAllByItemId(itemId).stream()
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

        inst.setStatus(dto.getStatus());
        inst.setFinalImage(dto.getFinalImage());
        ItemInstance saved = instanceRepo.save(inst);
        return map(saved);
    }

    @Transactional(readOnly = true)
    public Page<ItemInstanceResponseDto> getByItemPage(
            Long itemId,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size,
            String sortField,
            String sortDir
    ) {
        // 1) 권한 및 item 존재 체크
        Long currntUserId = tokenService.getIdFromToken();
        Long userMgmtId = userRepo.findById(currntUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        // 2) 기본 Specification: root.get("item").get("id") == itemId
        Specification<ItemInstance> spec = Specification.where(
                (root, query, cb) -> cb.equal(root.get("item").get("id"), itemId)
        );

        // 3) 검색어: instanceCode LIKE %search%
        if (search != null && !search.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(root.get("instanceCode"), "%" + search + "%")
            );
        }

        // 4) 날짜범위: createdAt between fromDate.atStartOfDay() and toDate.atTime(MAX)
        if (fromDate != null && toDate != null) {
            LocalDateTime start = fromDate.atStartOfDay();
            LocalDateTime end   = toDate.atTime(LocalTime.MAX);
            spec = spec.and((root, query, cb) ->
                    cb.between(root.get("createdAt"), start, end)
            );
        }

        // 5) Pageable 생성: Sort.by(sortDir, sortField)
        Sort sort = Sort.by(
                sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortField
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        // 6) 조회 & DTO 매핑
        return instanceRepo.findAll(spec, pageable)
                .map(this::map);
    }

    private ItemInstanceResponseDto map(ItemInstance e) {
        return ItemInstanceResponseDto.builder()
                .id(e.getId())
                .itemId(e.getItem().getId())
                .instanceCode(e.getInstanceCode())
                .status(e.getStatus())
                .image(e.getImage())
                .finalImage(e.getFinalImage())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }
}

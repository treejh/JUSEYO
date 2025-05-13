package com.example.backend.item.service;

import com.example.backend.analysis.service.InventoryAnalysisService;
import com.example.backend.category.entity.Category;
import com.example.backend.category.repository.CategoryRepository;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.item.dto.request.ItemRequestDto;
import com.example.backend.item.dto.response.ItemResponseDto;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.util.List;


@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository repo;
    private final CategoryRepository categoryRepo;
    private final ManagementDashboardRepository mgmtRepo;
    private static final SecureRandom RNG = new SecureRandom();
    private static final String ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private final UserRepository userRepo;
    private final TokenService tokenService;
    private final InventoryAnalysisService analysisService;

    private String generateSerial(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUM.charAt(RNG.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }

    @Transactional
    public ItemResponseDto createItem(ItemRequestDto dto) {
        // ① 시리얼 넘버 결정 (빈 값이면 15자리 랜덤 + 중복 체크)
        String serial = dto.getSerialNumber();
        if (serial == null || serial.isBlank()) {
            do {
                serial = generateSerial(15);
            } while (repo.existsBySerialNumber(serial));
        }

        // ② 연관 엔티티 조회
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        ManagementDashboard mgmt = mgmtRepo.findById(dto.getManagementId())
                .orElseThrow(() -> new IllegalArgumentException("ManagementDashboard not found"));

        // ③ 엔티티 생성
        Item entity = Item.builder()
                .name(dto.getName())
                .serialNumber(serial)
                .minimumQuantity(dto.getMinimumQuantity())
                .totalQuantity(dto.getTotalQuantity())
                .availableQuantity(dto.getAvailableQuantity())
                .purchaseSource(dto.getPurchaseSource())
                .location(dto.getLocation())
                .isReturnRequired(dto.getIsReturnRequired())
                .image(dto.getImage())
                .category(category)
                .managementDashboard(mgmt)
                .build();

        // ④ 저장 & DTO 반환
        Item saved = repo.save(entity);
        analysisService.clearCategoryCache(); // 캐시 무효화
        return mapToDto(saved);
    }

    @Transactional
    public ItemResponseDto updateItem(Long id, ItemRequestDto dto) {
        Item entity = repo.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        // category & management 조회
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        ManagementDashboard mgmt = mgmtRepo.findById(dto.getManagementId())
                .orElseThrow(() -> new IllegalArgumentException("ManagementDashboard not found"));

        // 필드 업데이트
        entity.setName(dto.getName());
        entity.setSerialNumber(dto.getSerialNumber());
        entity.setPurchaseSource(dto.getPurchaseSource());
        entity.setLocation(dto.getLocation());
        entity.setIsReturnRequired(dto.getIsReturnRequired());
        entity.setCategory(category);
        entity.setManagementDashboard(mgmt);

        Item updated = repo.save(entity);
        analysisService.clearCategoryCache(); // 캐시 무효화
        return mapToDto(updated);
    }

    // 자신이 소속 관리페이지의 단일 아이템 조회 가능
    @Transactional(readOnly = true)
    public ItemResponseDto getItem(Long id) {
        Long userId = tokenService.getIdFromToken();
        User me = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        Long mgmtId = me.getManagementDashboard().getId();
        return repo.findByIdAndManagementDashboardId(id, mgmtId)
                .map(this::mapToDto)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
    }

    // 자신이 소속 관리페이지의 모든 아이템 조회 가능
    @Transactional(readOnly = true)
    public List<ItemResponseDto> getAllItems() {
        Long userId = tokenService.getIdFromToken();
        User me = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        Long mgmtId = me.getManagementDashboard().getId();
        return repo.findAllByManagementDashboardId(mgmtId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Item not found");
        }
        repo.deleteById(id);
        analysisService.clearCategoryCache(); // 캐시 무효화
    }

    private ItemResponseDto mapToDto(Item e) {
        return ItemResponseDto.builder()
                .id(e.getId())
                .name(e.getName())
                .serialNumber(e.getSerialNumber())
                .minimumQuantity(e.getMinimumQuantity())
                .totalQuantity(e.getTotalQuantity())
                .availableQuantity(e.getAvailableQuantity())
                .purchaseSource(e.getPurchaseSource())
                .location(e.getLocation())
                .isReturnRequired(e.getIsReturnRequired())
                .image(e.getImage())
                .categoryId(e.getCategory().getId())
                .managementId(e.getManagementDashboard().getId())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }

    public Page<ItemResponseDto> getItemsPagedSorted(Pageable pageable) {
        return repo.findAllAsDto(pageable);
    }

}
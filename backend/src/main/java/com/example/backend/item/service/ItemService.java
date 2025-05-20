package com.example.backend.item.service;

import com.example.backend.analysis.service.InventoryAnalysisService;
import com.example.backend.category.entity.Category;
import com.example.backend.category.repository.CategoryRepository;
import com.example.backend.enums.Status;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.image.service.ImageService;
import com.example.backend.item.dto.request.ItemRequestDto;
import com.example.backend.item.dto.response.ItemSearchProjection;
import com.example.backend.item.dto.response.ItemResponseDto;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
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
    private final ImageService imageService;

    /**
     * 랜덤 8자리 알파벳+숫자 생성
     */
    private String randomSuffix() {
        return RandomStringUtils.randomAlphanumeric(8);
    }

    @Transactional
    public ItemResponseDto createItem(ItemRequestDto dto) {
        // 1) 시리얼 결정: 빈 값이면 비품명-순번-랜덤8 로 생성
        String serial = null;

        String namePart = dto.getName().replaceAll("\\s+", "_");
        long seq = repo.countByName(dto.getName()) + 1;
        serial = String.format("%s-%d-%s", namePart, seq, randomSuffix());
        // 중복 방지
        while (repo.existsBySerialNumber(serial)) {
            serial = String.format("%s-%d-%s", namePart, seq, randomSuffix());
        }


        // 2) 연관 엔티티 조회
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
        ManagementDashboard mgmt = mgmtRepo.findById(dto.getManagementId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        // 3) 엔티티 빌드 및 저장
        Item entity = Item.builder()
                .name(dto.getName())
                .serialNumber(serial)
                .minimumQuantity(dto.getMinimumQuantity())
                .totalQuantity(dto.getTotalQuantity())
                .availableQuantity(dto.getAvailableQuantity())
                .purchaseSource(dto.getPurchaseSource())
                .location(dto.getLocation())
                .isReturnRequired(dto.getIsReturnRequired())
                .image(imageService.saveImage(dto.getImage()))
                .category(category)
                .managementDashboard(mgmt)
                .status(Status.ACTIVE)
                .build();
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
        // 1) 현재 사용자 조회 & 관리대시보드 ID
        Long currentUserId = tokenService.getIdFromToken();
        ManagementDashboard userMgmt = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard();

        // 2) 실제 아이템 조회
        Item entity = repo.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        // 3) 권한 확인
        if (!entity.getManagementDashboard().getId().equals(userMgmt.getId())) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        // 4) DTO 반환
        return mapToDto(entity);
    }

    // 자신이 소속 관리페이지의 모든 아이템 조회 가능
    @Transactional(readOnly = true)
    public List<ItemResponseDto> getAllItems() {
        Long userId = tokenService.getIdFromToken();
        User me = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        Long mgmtId = me.getManagementDashboard().getId();
        return repo.findAllByManagementDashboardIdAndStatus(mgmtId,Status.ACTIVE).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public void deleteItem(Long id) {
        Item item = repo.findById(id).orElseThrow(()->new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
        item.setStatus(Status.STOP);
    }

    public ItemResponseDto mapToDto(Item e) {
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
                .status(e.getStatus())
                .build();
    }

    public Page<ItemResponseDto> getItemsPagedSorted(Pageable pageable) {
        return repo.findAllAsDto(Status.ACTIVE, pageable);
    }

    //비품 검색
    @Transactional(readOnly = true)
    public Page<ItemSearchProjection> findItemsByKeyword(Long managementDashboardId, String keyword, Pageable pageable) {

        // 현재 로그인된 사용자 ID로 소속 관리페이지 확인
        Long userId = tokenService.getIdFromToken();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        if (!user.getManagementDashboard().getId().equals(managementDashboardId)) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        // 검색 로직 실행 (Projection 활용)
        return repo.searchItemsWithCategory(managementDashboardId, keyword, pageable);
    }
}
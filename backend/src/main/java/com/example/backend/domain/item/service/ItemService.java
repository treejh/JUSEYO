package com.example.backend.domain.item.service;

import com.example.backend.domain.analysis.service.InventoryAnalysisService;
import com.example.backend.domain.category.entity.Category;
import com.example.backend.domain.category.repository.CategoryRepository;
import com.example.backend.domain.item.dto.response.ItemCardResponseDto;
import com.example.backend.domain.item.dto.response.ItemLiteResponseDto;
import com.example.backend.domain.item.dto.response.ItemSearchProjection;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.itemInstance.dto.request.CreateItemInstanceRequestDto;
import com.example.backend.domain.itemInstance.entity.ItemInstance;
import com.example.backend.domain.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.domain.itemInstance.service.ItemInstanceService;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.enums.Status;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.global.utils.service.ImageService;
import com.example.backend.domain.item.dto.request.ItemRequestDto;
import com.example.backend.domain.item.dto.response.ItemResponseDto;
import com.example.backend.domain.item.repository.ItemRepository;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
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
    private final ItemInstanceService itemInstanceService;
    private final ItemInstanceRepository itemInstanceRepository;

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

        Long userId = tokenService.getIdFromToken();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        ManagementDashboard mgmt = user.getManagementDashboard();

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

//instance 주석 코드 ( 확인용 )
//        CreateItemInstanceRequestDto createItemInstanceRequestDto= CreateItemInstanceRequestDto.builder()
//                .itemId(saved.getId())
//                .image(saved.getImage())
//                .build();
//        itemInstanceService.createInstance(createItemInstanceRequestDto);

        analysisService.clearCategoryCache(); // 캐시 무효화
        return mapToDto(saved);
    }

    @Transactional
    public ItemResponseDto updateItem(Long id, ItemRequestDto dto) {
        // 1) 기존 엔티티 로드
        Item entity = repo.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        // 2) 연관 엔티티 조회
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
        ManagementDashboard mgmt = mgmtRepo.findById(dto.getManagementId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        // 3) 필드 전체 업데이트
        entity.setName(dto.getName());
        entity.setMinimumQuantity(dto.getMinimumQuantity());
        entity.setTotalQuantity(dto.getTotalQuantity());
        entity.setAvailableQuantity(dto.getAvailableQuantity());
        entity.setSerialNumber(dto.getSerialNumber());
        entity.setPurchaseSource(dto.getPurchaseSource());
        entity.setLocation(dto.getLocation());
        entity.setIsReturnRequired(dto.getIsReturnRequired());

        // 이미지가 넘어왔다면 저장
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            String savedPath = imageService.saveImage(dto.getImage());
            entity.setImage(savedPath);
        }

        // 카테고리·관리대시보드
        entity.setCategory(category);
        entity.setManagementDashboard(mgmt);

        // 4) 저장 & DTO 반환
        Item updated = repo.save(entity);
        analysisService.clearCategoryCache(); // (필요 시)
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
        List<ItemInstance> itemInstances=itemInstanceRepository.findAllByItemIdAndStatus(item.getId(), Status.ACTIVE);
        for(ItemInstance itemInstance:itemInstances){
            itemInstance.setStatus(Status.STOP);
        }
    }

    public ItemResponseDto mapToDto(Item e) {
        return ItemResponseDto.builder()
                .id(e.getId())
                .name(e.getName())
                .categoryName(e.getCategory().getName())
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

    public Page<ItemLiteResponseDto> getItemsPagedSorted(Pageable pageable) {
        return repo.findAllAsLiteDto(Status.ACTIVE, pageable);
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

    /**
     * 로그인한 사용자의 관리페이지에 속한 ACTIVE 품목 전체 조회
     */
    @Transactional(readOnly = true)
    public List<ItemResponseDto> getAllActiveItems() {
        // (Optional) 관리페이지 필터까지 적용하고 싶다면 아래처럼:
        Long userId = tokenService.getIdFromToken();
        Long mgmtId = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        // ① 전체 ACTIVE 아이템 가져오기
        List<Item> items = repo.findAllByStatus(Status.ACTIVE);

        // ② 필요하다면 관리페이지로 한번더 필터
        items = items.stream()
                .filter(i -> i.getManagementDashboard().getId().equals(mgmtId))
                .toList();

        return items.stream()
                .map(this::mapToDto)  // 기존 mapToDto 사용
                .toList();
    }

    /** 프론트 중복체크용 */
    @Transactional(readOnly = true)
    public boolean existsActiveName(String name) {
        User user = userRepo.findById(tokenService.getIdFromToken())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        return repo.findByManagementDashboardAndNameAndStatus(user.getManagementDashboard(),name, Status.ACTIVE).isPresent();
    }

    //카테고리별 비품 조회
    @Transactional(readOnly = true)
    public Page<ItemCardResponseDto> getItemsByCategory(Long categoryId, Pageable pageable, User user) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        Long dashboardId = getDashboardId(user); // 기존 CategoryService랑 동일하게 작성

        if (!category.getManagementDashboard().getId().equals(dashboardId)) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_IN_MANAGEMENT_DASHBOARD);
        }

        return repo.findByCategoryId(categoryId, pageable)
                .map(ItemCardResponseDto::fromEntity);
    }

    private Long getDashboardId(User user) {
        if (user.getManagementDashboard() != null) {
            return user.getManagementDashboard().getId();
        } else if (user.getDepartment() != null && user.getDepartment().getManagementDashboard() != null) {
            return user.getDepartment().getManagementDashboard().getId();
        } else {
            throw new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND);
        }
    }

}
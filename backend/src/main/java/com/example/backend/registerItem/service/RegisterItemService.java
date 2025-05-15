package com.example.backend.registerItem.service;

import com.example.backend.category.entity.Category;
import com.example.backend.category.repository.CategoryRepository;
import com.example.backend.enums.Inbound;
import com.example.backend.enums.Status;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.image.service.ImageService;
import com.example.backend.inventoryIn.dto.request.InventoryInRequestDto;
import com.example.backend.inventoryIn.service.InventoryInService;
import com.example.backend.item.dto.request.ItemRequestDto;
import com.example.backend.item.dto.response.ItemResponseDto;
import com.example.backend.item.entity.Item;
import com.example.backend.item.repository.ItemRepository;
import com.example.backend.item.service.ItemService;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.registerItem.dto.request.PurchaseRequestDto;
import com.example.backend.registerItem.dto.request.UpdateRegisterItemDto;
import com.example.backend.registerItem.dto.response.RegisterItemResponseDto;
import com.example.backend.registerItem.entity.RegisterItem;
import com.example.backend.registerItem.repository.RegisterItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegisterItemService {
    private final InventoryInService inventoryInService;
    private final ItemService itemService;
    private final ImageService imageService;
    private final ItemRepository itemRepository;
    private final ManagementDashboardRepository managementDashboardRepository;
    private final CategoryRepository categoryRepo;
    private final RegisterItemRepository registerItemRepository;
    private final ItemInstanceRepository itemInstanceRepository;

    // 제품 구매 등록
    @Transactional
    public ItemResponseDto registerItem(PurchaseRequestDto dto) {
        ManagementDashboard md = findDashboard(dto.getManagementId());
        Category category = findCategory(dto.getCategoryId());

        Item item;
        if (dto.getInbound() == Inbound.PURCHASE) {
            item = createNewItem(dto);
        } else if (dto.getInbound() == Inbound.RE_PURCHASE) {
            item = updateExistingItem(dto);
        } else {
            throw new BusinessLogicException(ExceptionCode.INVALID_INBOUND_TYPE);
        }

        addInboundRecord(dto, item);
        RegisterItem registerItem = buildRegisterItem(dto, md, category, item);
        registerItemRepository.save(registerItem);

        return itemService.mapToDto(item);
    }

    private ManagementDashboard findDashboard(Long id) {
        return managementDashboardRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));
    }

    private Category findCategory(Long id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
    }

    private Item createNewItem(PurchaseRequestDto dto) {
        ItemRequestDto itemDto = ItemRequestDto.builder()
                .name(dto.getItemName())
                .minimumQuantity(dto.getMinimumQuantity())
                .totalQuantity(dto.getQuantity())
                .availableQuantity(dto.getQuantity())
                .purchaseSource(dto.getPurchaseSource())
                .location(dto.getLocation())
                .isReturnRequired(dto.getIsReturnRequired())
                .image(dto.getImage())
                .categoryId(dto.getCategoryId())
                .managementId(dto.getManagementId())
                .build();

        return itemRepository.findById(itemService.createItem(itemDto).getId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));
    }

    private Item updateExistingItem(PurchaseRequestDto dto) {
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        Long qty = dto.getQuantity();
        item.setTotalQuantity(item.getTotalQuantity() + qty);
        item.setAvailableQuantity(item.getAvailableQuantity() + qty);
        item.setPurchaseDate(LocalDateTime.now());
        item.setPurchaseSource(dto.getPurchaseSource());
        item.setLocation(dto.getLocation());
        item.setImage(imageService.updateImage(dto.getImage(), item.getImage()));

        return item;
    }

    private void addInboundRecord(PurchaseRequestDto dto, Item item) {
        InventoryInRequestDto inDto = InventoryInRequestDto.builder()
                .itemId(item.getId())
                .quantity(dto.getQuantity())
                .inbound(dto.getInbound())
                .categoryId(dto.getCategoryId())
                .managementId(dto.getManagementId())
                .image(dto.getImage())
                .build();
        inventoryInService.addInbound(inDto);
    }

    private RegisterItem buildRegisterItem(PurchaseRequestDto dto, ManagementDashboard md, Category category, Item item) {
        return RegisterItem.builder()
                .managementDashboard(md)
                .category(category)
                .item(item)
                .image(imageService.saveImage(dto.getImage()))
                .quantity(dto.getQuantity())
                .purchaseSource(dto.getPurchaseSource())
                .purchaseDate(LocalDateTime.now())
                .location(dto.getLocation())
                .inbound(dto.getInbound())
                .status(Status.ACTIVE)
                .build();
    }

    //비품 구매 조회 (단건)
    public RegisterItemResponseDto getRegisterItem(Long id){
        return toDto(registerItemRepository.findById(id).orElseThrow(
                ()->new BusinessLogicException(ExceptionCode.REGISTER_ITEM_NOT_FOUND)
        ));
    }

    //비품 목록 조회
    public Page<RegisterItemResponseDto> getAllRegisterItems(Pageable pageable,Status status){
        return registerItemRepository.findByStatus(status,pageable);
    }

    //비품 구매 수정
    @Transactional
    public void updateRegisterItem(Long id, UpdateRegisterItemDto dto) {
        RegisterItem item = registerItemRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.REGISTER_ITEM_NOT_FOUND));

        if (dto.getCategoryId() != null) {
            Category category = categoryRepo.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
            item.setCategory(category);
            item.getItem().setCategory(category);
        }

        if(dto.getQuantity()!=null){
            if (dto.getQuantity() != null) {
                long currentQty = item.getQuantity();
                long newQty = dto.getQuantity();

                if (!Objects.equals(currentQty, newQty)) {
                    long gap = newQty - currentQty;

                    item.setQuantity(newQty);

                    Item linkedItem = item.getItem();
                    linkedItem.setTotalQuantity(linkedItem.getTotalQuantity() + gap);
                    linkedItem.setAvailableQuantity(linkedItem.getAvailableQuantity() + gap);

                    if (gap < 0) {
                        int softDeleteCount = (int) Math.abs(gap);
                        softDeleteHighestItemInstances(linkedItem.getId(), softDeleteCount);
                    }
                }
            }

        }

        if (dto.getItemName() != null) {
            item.getItem().setName(dto.getItemName());
            item.setItem(item.getItem());
        }

        if (dto.getPurchaseSource() != null) {
            item.setPurchaseSource(dto.getPurchaseSource());
            item.getItem().setPurchaseSource(dto.getPurchaseSource());
        }

        if (dto.getLocation() != null) {
            item.setLocation(dto.getLocation());
            item.getItem().setLocation(dto.getLocation());
        }

        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            String uploadedUrl = imageService.updateImage(dto.getImage(), item.getImage());
            item.setImage(uploadedUrl);
            item.getItem().setImage(uploadedUrl);
        }

        registerItemRepository.save(item); // optional if persistence context auto-flushes
    }

    private void softDeleteHighestItemInstances(Long itemId, int count) {
        List<ItemInstance> instances = itemInstanceRepository
                .findTopNActiveByItemId(itemId, PageRequest.of(0, count));

        if (instances.size() < count) {
            throw new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND);
        }

        for (ItemInstance instance : instances) {
            instance.setIsItemExists(Status.STOP);
        }
    }



    //비품 구매 취소
    @Transactional
    public void deleteRegisterItem(Long id){
        RegisterItem item = registerItemRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.REGISTER_ITEM_NOT_FOUND));
        item.setStatus(Status.STOP);

    }

    public RegisterItemResponseDto toDto(RegisterItem registerItem){
        return RegisterItemResponseDto.builder()
                .id(registerItem.getId())
                .managementDashboardId(registerItem.getManagementDashboard().getId())
                .categoryId(registerItem.getCategory().getId())
                .itemId(registerItem.getItem().getId())
                .image(registerItem.getImage())
                .quantity(registerItem.getQuantity())
                .purchaseDate(registerItem.getPurchaseDate())
                .purchaseSource(registerItem.getPurchaseSource())
                .location(registerItem.getLocation())
                .inbound(registerItem.getInbound())
                .status(registerItem.getStatus())
                .build();
    }
}

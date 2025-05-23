package com.example.backend.domain.inventory.inventoryOut.service;

import com.example.backend.domain.inventory.inventoryOut.dto.request.InventoryOutRequestDto;
import com.example.backend.domain.inventory.inventoryOut.dto.response.InventoryOutResponseDto;
import com.example.backend.domain.inventory.inventoryOut.entity.InventoryOut;
import com.example.backend.domain.inventory.inventoryOut.repository.InventoryOutRepository;
import com.example.backend.domain.analysis.service.InventoryAnalysisService;
import com.example.backend.domain.category.entity.Category;
import com.example.backend.domain.category.repository.CategoryRepository;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.item.repository.ItemRepository;
import com.example.backend.domain.itemInstance.dto.request.UpdateItemInstanceStatusRequestDto;
import com.example.backend.domain.itemInstance.entity.ItemInstance;
import com.example.backend.domain.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.domain.itemInstance.service.ItemInstanceService;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.domain.notification.event.StockShortageEvent;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.domain.user.repository.UserRepository;
import jakarta.servlet.ServletOutputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class InventoryOutService {
    private final InventoryOutRepository outRepo;
    private final ItemRepository itemRepo;
    private final SupplyRequestRepository supplyRequestRepo;
    private final CategoryRepository categoryRepo;
    private final ManagementDashboardRepository mgmtRepo;
    private final ItemInstanceService instanceService;
    private final ItemInstanceRepository instanceRepo;
    private final UserRepository userRepo;
    private final TokenService tokenService;
    private final InventoryAnalysisService inventoryAnalysisService;
    private final ApplicationEventPublisher eventPublisher;


    @Transactional
    public InventoryOutResponseDto removeOutbound(InventoryOutRequestDto dto) {
        // 권한 체크
        Long currentUserId = tokenService.getIdFromToken();
        SupplyRequest req = supplyRequestRepo.findById(dto.getSupplyRequestId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.SUPPLY_REQUEST_NOT_FOUND));

        Long userMgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        if (!req.getManagementDashboard().getId().equals(userMgmtId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        // 0) SupplyRequest, Category, ManagementDashboard 조회
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));
        ManagementDashboard mgmt = mgmtRepo.findById(dto.getManagementId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        // 1) Item 조회
        Item item = itemRepo.findById(dto.getItemId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_NOT_FOUND));

        // 2) 재고 충분 여부 검사
        if (item.getAvailableQuantity() < dto.getQuantity()) {
            throw new BusinessLogicException(ExceptionCode.INSUFFICIENT_STOCK);
        }

        // 3) 출고 내역 엔티티 생성 및 저장
        InventoryOut entity = InventoryOut.builder()
                .supplyRequest(req)
                .item(item)
                .category(category)
                .managementDashboard(mgmt)
                .quantity(dto.getQuantity())
                .outbound(Outbound.valueOf(dto.getOutbound()))
                .build();
        InventoryOut saved = outRepo.save(entity);

        // Redis 사용 빈도 증가
        try {
            inventoryAnalysisService.increaseItemUsage(saved.getItem().getName(), saved.getQuantity());
        } catch (Exception e) {
            log.warn("Redis 사용 빈도 증가 실패: {}", e.getMessage());
        }

        // 4) 아이템 재고 차감
        item.setAvailableQuantity(item.getAvailableQuantity() - saved.getQuantity());

        // 재고 부족 알림 발생
        eventPublisher.publishEvent(new StockShortageEvent(item.getSerialNumber(), item.getName(), item.getAvailableQuantity(), item.getMinimumQuantity()));

        // 5) **대여(LEND) 케이스에만** 개별자산단위 상태 변경 (AVAILABLE → LEND)
        if (saved.getOutbound() == Outbound.LEND) {
            for (int i = 0; i < saved.getQuantity(); i++) {
                ItemInstance inst = instanceRepo
                        .findFirstByItemIdAndOutboundAndStatus(item.getId(),
                                Outbound.AVAILABLE,
                                Status.ACTIVE)
                        .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ITEM_INSTANCE_NOT_FOUND));

                UpdateItemInstanceStatusRequestDto upd = new UpdateItemInstanceStatusRequestDto();
                upd.setOutbound(Outbound.LEND);
                upd.setFinalImage(null);
                instanceService.updateStatus(inst.getId(), upd);
            }
        }

        // 6) 응답 DTO 반환
        return mapToDto(saved);
    }

    /** 전체 출고내역 조회 (매니저용) */
    @Transactional(readOnly = true)
    public List<InventoryOutResponseDto> getAllOutbound() {

        // 권한체크 및 대시보드 id 조회
        Long currentUserId = tokenService.getIdFromToken();
        Long userMgmtId = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();

        // 해당 관리대시보드 출고내역만 조회
        return outRepo.findAllByManagementDashboardId(userMgmtId).stream()
                .map(this::mapToDto)
                .toList();
    }

    /** 페이징·정렬·검색·날짜 필터된 페이지 조회 (매니저용) */
    @Transactional(readOnly = true)
    public Page<InventoryOutResponseDto> getOutbound(
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size,
            String sortField,
            String sortDir
    ) {
        Long userMgmtId = tokenService.getIdFromToken();
        Specification<InventoryOut> spec = Specification.where(
                (root, query, cb) -> cb.equal(
                        root.get("managementDashboard").get("id"), userMgmtId)
        );
        if (search != null && !search.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(
                    root.get("item").get("name"), "%" + search + "%"));
        }
        if (fromDate != null && toDate != null) {
            LocalDateTime start = fromDate.atStartOfDay();
            LocalDateTime end = toDate.atTime(LocalTime.MAX);
            spec = spec.and((root, query, cb) -> cb.between(
                    root.get("createdAt"), start, end));
        }
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);
        return outRepo.findAll(spec, pageable)
                .map(this::mapToDto);
    }

    /** 필터된 전체 리스트 반환 (export용) */
    @Transactional(readOnly = true)
    public List<InventoryOutResponseDto> getOutboundList(
            String search,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        return getOutbound(search, fromDate, toDate, 0, Integer.MAX_VALUE, "createdAt", "desc")
                .getContent();
    }

    // 조회
    @Transactional(readOnly = true)
    public Page<InventoryOutResponseDto> getMyOutbound(
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size,
            String sortField,
            String sortDir
    ) {
        // 1) 나의 userId 추출
        Long userId = tokenService.getIdFromToken();

        // 2) 기본 Specification: 내 요청에 대한 출고만
        Specification<InventoryOut> spec = Specification.where(
                (root, query, cb) ->
                        cb.equal(root.get("supplyRequest").get("user").get("id"), userId)
        );

        // 3) 검색어 필터 (item 이름에 포함된 경우)
        if (search != null && !search.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(root.get("item").get("name"), "%" + search + "%")
            );
        }

        // 4) 날짜 범위 필터
        if (fromDate != null && toDate != null) {
            LocalDateTime start = fromDate.atStartOfDay();
            LocalDateTime end   = toDate.atTime(LocalTime.MAX);
            spec = spec.and((root, query, cb) ->
                    cb.between(root.get("createdAt"), start, end)
            );
        }

        // 5) 정렬·페이징 설정
        Sort sort = Sort.by(
                sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortField
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        // 6) 쿼리 실행 & DTO 변환
        return outRepo.findAll(spec, pageable)
                .map(this::mapToDto);
    }

    /** Excel 내보내기 */
    public void writeExcel(List<InventoryOutResponseDto> list, ServletOutputStream os) throws IOException {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("InventoryOut");
            Row header = sheet.createRow(0);
            String[] cols = {"ID","ItemId","Quantity","Outbound","CreatedAt"};
            for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);
            for (int r = 0; r < list.size(); r++) {
                var dto = list.get(r);
                Row row = sheet.createRow(r + 1);
                row.createCell(0).setCellValue(dto.getId());
                row.createCell(1).setCellValue(dto.getItemId());
                row.createCell(2).setCellValue(dto.getQuantity());
                row.createCell(3).setCellValue(dto.getOutbound());
                row.createCell(4).setCellValue(dto.getCreatedAt().toString());
            }
            wb.write(os);
        }
    }

    /** DTO 매핑 공통 메서드 */
    private InventoryOutResponseDto mapToDto(InventoryOut o) {
        return InventoryOutResponseDto.builder()
                .id(o.getId())
                .supplyRequestId(o.getSupplyRequest().getId())
                .itemId(o.getItem().getId())
                .categoryId(o.getCategory().getId())
                .managementId(o.getManagementDashboard().getId())
                .quantity(o.getQuantity())
                .outbound(o.getOutbound().name())
                .createdAt(o.getCreatedAt())
                .modifiedAt(o.getModifiedAt())
                .build();
    }

}

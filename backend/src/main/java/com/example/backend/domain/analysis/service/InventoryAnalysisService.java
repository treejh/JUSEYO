package com.example.backend.domain.analysis.service;

import com.example.backend.domain.analysis.dto.CategorySummaryDTO;
import com.example.backend.domain.analysis.dto.ItemUsageFrequencyDTO;
import com.example.backend.domain.analysis.dto.MonthlyInventoryDTO;
import com.example.backend.domain.inventory.inventoryIn.entity.InventoryIn;
import com.example.backend.domain.inventory.inventoryIn.repository.InventoryInRepository;
import com.example.backend.domain.inventory.inventoryOut.entity.InventoryOut;
import com.example.backend.domain.inventory.inventoryOut.repository.InventoryOutRepository;
import com.example.backend.domain.item.entity.Item;
import com.example.backend.domain.item.repository.ItemRepository;
import com.example.backend.domain.itemInstance.repository.ItemInstanceRepository;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.global.security.jwt.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;


@Service
@RequiredArgsConstructor
public class InventoryAnalysisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ItemRepository itemRepository;
    private final InventoryInRepository inventoryInRepository;
    private final InventoryOutRepository inventoryOutRepository;
    private final ItemInstanceRepository itemInstanceRepository;
    private final TokenService tokenService;
    private final UserRepository userRepository;

    // Redis 키 생성기
    private String getCategorySummaryKey(Long managementId) {
        return "category_summary:" + managementId;
    }

    private String getItemUsageKey(Long managementId) {
        return "item_usage_frequency:" + managementId;
    }

    private String getOutboundKey(Long managementId) {
        return "item_instances:outbound_count:" + managementId;
    }

    private Long getManagementIdFromToken() {
        Long userId = tokenService.getIdFromToken();
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND))
                .getManagementDashboard().getId();
    }

    public Map<String, CategorySummaryDTO> getCategorySummary() {
        Long managementId = getManagementIdFromToken();
        String key = getCategorySummaryKey(managementId);

        Map<String, CategorySummaryDTO> cached = (Map<String, CategorySummaryDTO>)
                redisTemplate.opsForValue().get(key);
        if (cached != null) return cached;

        List<Item> items = itemRepository.findAllByManagementDashboardIdAndStatus(managementId, Status.ACTIVE);

        Map<String, CategorySummaryDTO> result = items.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getCategory().getName(),
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            long totalQty = list.stream().mapToLong(Item::getTotalQuantity).sum();
                            long typeCount = list.stream().map(Item::getName).distinct().count();
                            return new CategorySummaryDTO(totalQty, typeCount);
                        })
                ));

        redisTemplate.opsForValue().set(key, result, Duration.ofMinutes(30));
        return result;
    }

    public void increaseItemUsage(String itemName, long quantity) {
        Long managementId = getManagementIdFromToken();
        redisTemplate.opsForZSet().incrementScore(getItemUsageKey(managementId), itemName, quantity);
    }

    public List<ItemUsageFrequencyDTO> getItemUsageRanking(int topN) {
        Long managementId = getManagementIdFromToken();
        Set<ZSetOperations.TypedTuple<Object>> zset =
                redisTemplate.opsForZSet().reverseRangeWithScores(getItemUsageKey(managementId), 0, topN - 1);

        if (zset == null) return Collections.emptyList();

        return zset.stream()
                .map(tuple -> new ItemUsageFrequencyDTO(
                        (String) tuple.getValue(),
                        tuple.getScore() != null ? tuple.getScore().longValue() : 0
                ))
                .collect(Collectors.toList());
    }

    public List<MonthlyInventoryDTO> getMonthlyInventorySummary(int year) {
        Long managementId = getManagementIdFromToken();
        LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime end = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

        List<InventoryIn> ins = inventoryInRepository.findByCreatedAtBetweenAndManagementDashboardId(start, end, managementId);
        List<InventoryOut> outs = inventoryOutRepository.findByCreatedAtBetweenAndManagementDashboardId(start, end, managementId);

        Map<YearMonth, Long> inboundMap = ins.stream()
                .collect(Collectors.groupingBy(
                        i -> YearMonth.from(i.getCreatedAt()),
                        Collectors.summingLong(InventoryIn::getQuantity)));

        Map<YearMonth, Long> outboundMap = outs.stream()
                .collect(Collectors.groupingBy(
                        o -> YearMonth.from(o.getCreatedAt()),
                        Collectors.summingLong(InventoryOut::getQuantity)));

        return IntStream.rangeClosed(1, 12)
                .mapToObj(month -> {
                    YearMonth ym = YearMonth.of(year, month);
                    return new MonthlyInventoryDTO(
                            ym,
                            inboundMap.getOrDefault(ym, 0L),
                            outboundMap.getOrDefault(ym, 0L)
                    );
                }).collect(Collectors.toList());
    }

    public Map<Outbound, Long> getCachedOutboundSummary() {
        Long managementId = getManagementIdFromToken();
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(getOutboundKey(managementId));
        if (entries == null || entries.isEmpty()) return null;

        return entries.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> Outbound.valueOf((String) e.getKey()),
                        e -> Long.parseLong((String) e.getValue())
                ));
    }

    public Map<Outbound, Long> loadAndCacheOutboundSummary() {
        Long managementId = getManagementIdFromToken();
        List<Object[]> results = itemInstanceRepository.countAllByOutboundGroupAndManagementId(managementId);

        Map<Outbound, Long> mapped = results.stream()
                .collect(Collectors.toMap(
                        r -> (Outbound) r[0],
                        r -> (Long) r[1]
                ));

        Map<String, String> redisMap = mapped.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey().name(),
                        e -> String.valueOf(e.getValue())
                ));

        redisTemplate.opsForHash().putAll(getOutboundKey(managementId), redisMap);
        redisTemplate.expire(getOutboundKey(managementId), Duration.ofMinutes(10));
        return mapped;
    }

    public void clearCategoryCache() {
        redisTemplate.delete(getCategorySummaryKey(getManagementIdFromToken()));
    }

    public void clearGlobalOutboundCache() {
        redisTemplate.delete(getOutboundKey(getManagementIdFromToken()));
    }
}

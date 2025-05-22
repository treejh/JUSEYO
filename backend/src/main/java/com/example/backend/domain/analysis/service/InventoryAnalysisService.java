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
import com.example.backend.enums.Outbound;
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
@Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 성능 최적화
public class InventoryAnalysisService {

    private final ItemRepository itemRepository;
    private final InventoryOutRepository inventoryOutRepository;
    private final InventoryInRepository inventoryInRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private final ItemInstanceRepository itemInstanceRepository;

    // Redis에 저장할 캐시 키를 상수로 정의합니다.
    private static final String CATEGORY_SUMMARY_KEY = "category_summary"; // 카테고리 분석 결과 캐시 키
    private static final String ITEM_USAGE_KEY = "item_usage_frequency"; // 품목 사용 빈도 저장용 ZSet 키
    private static final String GLOBAL_OUTBOUND_KEY = "item_instances:outbound_count"; //outbound별 아이템 인스턴스 갯수 결과 키

    /**
     * 📊 카테고리별 비품 수량 및 종류 수 계산
     * - Redis에 30분 동안 캐싱됨
     * - 없으면 DB에서 계산 후 캐시에 저장
     */

    public Map<String, CategorySummaryDTO> getCategorySummary() {

        // Redis에 이미 저장된 캐시가 있는지 확인
        Map<String, CategorySummaryDTO> cached = (Map<String, CategorySummaryDTO>)
                redisTemplate.opsForValue().get(CATEGORY_SUMMARY_KEY);

        // 캐시가 있으면 DB에 접근하지 않고 바로 반환
        if (cached != null) {
            return cached;
        }

        // 모든 아이템 데이터를 DB에서 조회
        List<Item> items = itemRepository.findAll();

        // 카테고리명으로 그룹핑해서 총 수량과 품목 종류 수 계산
        Map<String, CategorySummaryDTO> result = items.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getCategory().getName(), // 카테고리 이름 기준으로 묶음
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            long totalQty = list.stream()
                                    .mapToLong(Item::getTotalQuantity)
                                    .sum(); // 총 수량 계산
                            long typeCount = list.stream()
                                    .map(Item::getName)
                                    .distinct()
                                    .count(); // 품목 이름 기준 중복 제거 후 개수
                            return new CategorySummaryDTO(totalQty, typeCount);
                        })
                ));

        // 계산한 결과를 Redis에 30분간 저장
        redisTemplate.opsForValue().set(CATEGORY_SUMMARY_KEY, result, Duration.ofMinutes(30));

        // 결과 반환
        return result;
    }

    /**
     * 🔄 출고 시 품목 사용 빈도 증가
     * - Redis ZSet에 품목명 기준으로 점수를 누적합니다.
     */
    public void increaseItemUsage(String itemName, long quantity) {
        // ZSet에서 itemName에 해당하는 점수를 quantity만큼 증가
        redisTemplate.opsForZSet().incrementScore(ITEM_USAGE_KEY, itemName, quantity);
    }

    /**
     * 📈 품목 사용 빈도 TOP N 조회
     * - 가장 많이 출고된 순서로 상위 품목을 조회
     */

    public List<ItemUsageFrequencyDTO> getItemUsageRanking(int topN) {
        // Redis에서 점수가 높은 순으로 ZSet 항목을 조회
        Set<ZSetOperations.TypedTuple<Object>> zset =
                redisTemplate.opsForZSet().reverseRangeWithScores(ITEM_USAGE_KEY, 0, topN - 1);

        // 결과가 없으면 빈 리스트 반환
        if (zset == null) return Collections.emptyList();

        // ZSet 결과를 DTO 리스트로 변환
        return zset.stream()
                .map(tuple -> new ItemUsageFrequencyDTO(
                        (String) tuple.getValue(), // 품목명
                        tuple.getScore() != null ? tuple.getScore().longValue() : 0 // 사용량 (점수)
                ))
                .collect(Collectors.toList());
    }

    /**
     * 🧹 카테고리 분석 캐시 삭제
     * - 아이템 추가/수정/삭제 시 이 메서드를 호출하여
     *   Redis에 저장된 캐시를 제거합니다.
     */
    public void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_SUMMARY_KEY); // Redis에서 캐시 키 제거
    }

    /**
     * 📅 월별 입출고 수량 계산
     * - 연도(year)를 받아 해당 연도의 1월부터 12월까지 입출고 수량을 월별로 집계합니다.
     */

    public List<MonthlyInventoryDTO> getMonthlyInventorySummary(int year) {

        // 검색 범위: 해당 연도의 1월 1일 00:00:00 ~ 12월 31일 23:59:59
        LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime end = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

        // 입고/출고 데이터를 기간 내에서 조회
        List<InventoryIn> ins = inventoryInRepository.findByCreatedAtBetween(start, end);
        List<InventoryOut> outs = inventoryOutRepository.findByCreatedAtBetween(start, end);

        // 입고 데이터 → 월(YearMonth)별로 그룹화하여 수량 합계
        Map<YearMonth, Long> inboundMap = ins.stream()
                .collect(Collectors.groupingBy(
                        i -> YearMonth.from(i.getCreatedAt()),
                        Collectors.summingLong(InventoryIn::getQuantity)));

        // 출고 데이터 → 월별 수량 합계
        Map<YearMonth, Long> outboundMap = outs.stream()
                .collect(Collectors.groupingBy(
                        o -> YearMonth.from(o.getCreatedAt()),
                        Collectors.summingLong(InventoryOut::getQuantity)));

        // 1월부터 12월까지 반복하며 결과 DTO 생성
        return IntStream.rangeClosed(1, 12)
                .mapToObj(month -> {
                    YearMonth ym = YearMonth.of(year, month); // 해당 월
                    return new MonthlyInventoryDTO(
                            ym,
                            inboundMap.getOrDefault(ym, 0L), // 입고 수량이 없으면 0
                            outboundMap.getOrDefault(ym, 0L) // 출고 수량이 없으면 0
                    );
                }).collect(Collectors.toList());
    }

    /**
     * 전체 아이템 인스턴스 Outbound 통계
     * - 모든 아이템 인스턴스에 대해 Outbound 상태(AVAILABLE, LEND 등)별 개수를 반환합니다. 결과는 Redis 캐시를 사용하며 약 10분간 유지됩니다.
     */
    // ✅ Redis 캐시 조회
    public Map<Outbound, Long> getCachedOutboundSummary() {
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(GLOBAL_OUTBOUND_KEY);
        if (entries == null || entries.isEmpty()) return null;

        return entries.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> Outbound.valueOf((String) e.getKey()),
                        e -> Long.parseLong((String) e.getValue())
                ));
    }

    // ✅ DB에서 조회 후 Redis 저장
    public Map<Outbound, Long> loadAndCacheOutboundSummary() {
        List<Object[]> results = itemInstanceRepository.countAllByOutboundGroup();

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

        redisTemplate.opsForHash().putAll(GLOBAL_OUTBOUND_KEY, redisMap);
        redisTemplate.expire(GLOBAL_OUTBOUND_KEY, Duration.ofMinutes(10));

        return mapped;
    }

    // ✅ 캐시 삭제 (예: 상태 변경 시 호출)
    public void clearGlobalOutboundCache() {
        redisTemplate.delete(GLOBAL_OUTBOUND_KEY);
    }
}

package com.example.backend.itemInstance.repository;

import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.itemInstance.entity.ItemInstance;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemInstanceRepository extends JpaRepository<ItemInstance, Long> {
    List<ItemInstance> findAllByItemId(Long itemId);  // 특정 Item 소속 인스턴스 조회
    long countByItemId(Long itemId); // 시퀀스 번호 계산용

    Optional<ItemInstance> findFirstByItemIdAndStatus(Long itemId, Outbound status);
    long countByItemIdAndStatus(Long itemId, Outbound status);

    @Query("SELECT i FROM ItemInstance i " +
            "WHERE i.item.id = :itemId AND i.status = 'ACTIVE' " +
            "ORDER BY i.id DESC")
    List<ItemInstance> findTopNActiveByItemId(@Param("itemId") Long itemId, Pageable pageable);

    List<ItemInstance> findAllByItemIdAndStatus(Long itemId, Status status);

}

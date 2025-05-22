package com.example.backend.domain.itemInstance.repository;

import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import com.example.backend.domain.itemInstance.entity.ItemInstance;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemInstanceRepository extends JpaRepository<ItemInstance, Long>, JpaSpecificationExecutor<ItemInstance> {
    List<ItemInstance> findAllByItemId(Long itemId);  // 특정 Item 소속 인스턴스 조회
    long countByItemId(Long itemId); // 시퀀스 번호 계산용

    Optional<ItemInstance> findFirstByItemIdAndOutboundAndStatus(Long itemId, Outbound outbound, Status status);


    @Query("SELECT i FROM ItemInstance i " +
            "WHERE i.item.id = :itemId AND i.status = com.example.backend.enums.Status.ACTIVE " +
            "ORDER BY i.id DESC")
    List<ItemInstance> findTopNActiveByItemId(@Param("itemId") Long itemId, Pageable pageable);

    List<ItemInstance> findAllByItemIdAndStatus(Long itemId, Status status);

    Optional<ItemInstance> findFirstByItemIdAndStatus(Long itemId, Outbound status);

    long countByItemIdAndOutbound(Long itemId, Outbound outbound);

    @Query("SELECT i.outbound, COUNT(i) FROM ItemInstance i GROUP BY i.outbound")
    List<Object[]> countAllByOutboundGroup();


}

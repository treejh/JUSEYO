package com.example.backend.chaseItem.repository;

import com.example.backend.chaseItem.entity.ChaseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChaseItemRepository extends JpaRepository<ChaseItem, Long> {
    List<ChaseItem> findAllBySupplyRequestId(Long requestId);
}
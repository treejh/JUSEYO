package com.example.backend.supplyRequest.repository;

import com.example.backend.supplyRequest.entity.SupplyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyRequestRepository extends JpaRepository<SupplyRequest, Long> {

    // 동일 사용자(userId)가 동일 아이템(itemId)을 이전에 요청했으면 true
    boolean existsByUserIdAndItemId(Long userId, Long itemId);

    List<SupplyRequest> findAllByManagementDashboardId(Long mgmtId);

}

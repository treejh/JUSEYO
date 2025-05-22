package com.example.backend.domain.supply.supplyRequest.repository;

import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyRequestRepository extends JpaRepository<SupplyRequest, Long> {

    // 동일 사용자(userId)가 동일 아이템(itemId)을 이전에 요청했으면 true
    boolean existsByUserIdAndItemId(Long userId, Long itemId);

    // 모든 상태의 요청을 관리페이지별로 조회하기 위한 메서드
    List<SupplyRequest> findAllByManagementDashboardId(Long managementDashboardId);

    List<SupplyRequest> findAllByManagementDashboardIdAndApprovalStatus(
            Long managementDashboardId,
            ApprovalStatus approvalStatus
    );

    // 사용자별 요청 조회
    List<SupplyRequest> findAllByUserId(Long userId);


}

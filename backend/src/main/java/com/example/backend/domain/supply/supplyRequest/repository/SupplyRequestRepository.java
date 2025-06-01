package com.example.backend.domain.supply.supplyRequest.repository;

import com.example.backend.domain.supply.supplyRequest.dto.response.LentItemDto;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.enums.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT s.approvalStatus, COUNT(s) FROM SupplyRequest s WHERE s.user.id = :userId GROUP BY s.approvalStatus")
    List<Object[]> countByApprovalStatusByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM SupplyRequest s WHERE s.user.id = :userId AND s.rental = true")
    Page<SupplyRequest> findByUserId(@Param("userId") Long userId, Pageable pageable);


    //사용자 기준으로 승인된 요청만 조회
    @Query("SELECT sr FROM SupplyRequest sr " +
            "WHERE sr.user.id = :userId " +
            "AND sr.approvalStatus = com.example.backend.enums.ApprovalStatus.APPROVED")
    List<SupplyRequest> findApprovedRequestsByUserId(@Param("userId") Long userId);



}

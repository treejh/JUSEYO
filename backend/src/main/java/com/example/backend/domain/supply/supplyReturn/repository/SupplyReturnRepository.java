package com.example.backend.domain.supply.supplyReturn.repository;

import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyReturn.entity.SupplyReturn;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.domain.supply.supplyReturn.dto.response.SupplyReturnResponseDto;
import com.example.backend.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplyReturnRepository extends JpaRepository<SupplyReturn, Long> {

    @Query("SELECT new com.example.backend.domain.supply.supplyReturn.dto.response.SupplyReturnResponseDto " +
            "(s.id, s.supplyRequest.id, s.user.id,s.user.name ,s.managementDashboard.id, s.item.id, s.serialNumber, s.productName, " +
            "s.quantity, s.useDate, s.returnDate, s.approvalStatus, s.createdAt, s.outbound) " +
            "FROM SupplyReturn s " +
            "WHERE (:managementId IS NULL OR s.managementDashboard.id = :managementId) " +
            "AND (:status IS NULL OR s.status = :status)")
    Page<SupplyReturnResponseDto> findAllSupplyReturn(
            @Param("managementId") Long managementId,
            @Param("status") Status status,
            Pageable pageable);



    @Query("SELECT new com.example.backend.domain.supply.supplyReturn.dto.response.SupplyReturnResponseDto " +
            "(s.id, s.supplyRequest.id, s.user.id,s.user.name , s.managementDashboard.id, s.item.id, s.serialNumber, s.productName, " +
            "s.quantity, s.useDate, s.returnDate, s.approvalStatus, s.createdAt, s.outbound) " +
            "FROM SupplyReturn s " +
            "WHERE (:approvalStatus IS NULL OR s.approvalStatus = :approvalStatus) " +
            "AND (:managementId IS NULL OR s.managementDashboard.id = :managementId) " +
            "AND (:status IS NULL OR s.status = :status)")
    Page<SupplyReturnResponseDto> findAllSupplyRequestByApprovalStatusAndManagement(
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("managementId") Long managementId,
            @Param("status") Status status,
            Pageable pageable);



    boolean existsBySupplyRequestId(Long requestId);

    List<SupplyReturn> findBySupplyRequest(SupplyRequest request);

    @Query("SELECT new com.example.backend.domain.supply.supplyReturn.dto.response.SupplyReturnResponseDto " +
            "(s.id, s.supplyRequest.id, s.user.id,s.user.name , s.managementDashboard.id, s.item.id, s.serialNumber, s.productName, " +
            "s.quantity, s.useDate, s.returnDate, s.approvalStatus, s.createdAt, s.outbound) " +
            "FROM SupplyReturn s " +
            "WHERE (:managementId IS NULL OR s.managementDashboard.id = :managementId) " +
            "AND (:userId IS NULL OR s.user.id = :userId) " +
            "AND (:status IS NULL OR s.status = :status)")
    Page<SupplyReturnResponseDto> findAllSupplyReturn(
            @Param("managementId") Long managementId,
            @Param("userId") Long userId,
            @Param("status") Status status,
            Pageable pageable);


    @Query("SELECT new com.example.backend.domain.supply.supplyReturn.dto.response.SupplyReturnResponseDto " +
            "(s.id, s.supplyRequest.id, s.user.id,s.user.name , s.managementDashboard.id, s.item.id, s.serialNumber, s.productName, " +
            "s.quantity, s.useDate, s.returnDate, s.approvalStatus, s.createdAt, s.outbound) " +
            "FROM SupplyReturn s " +
            "WHERE (:approvalStatus IS NULL OR s.approvalStatus = :approvalStatus) " +
            "AND (:managementId IS NULL OR s.managementDashboard.id = :managementId) " +
            "AND (:userId IS NULL OR s.user.id = :userId) " +
            "AND (:status IS NULL OR s.status = :status)")
    Page<SupplyReturnResponseDto> findAllSupplyRequestByApprovalStatusAndManagement(
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("managementId") Long managementId,
            @Param("userId") Long userId,
            @Param("status") Status status,
            Pageable pageable);




}

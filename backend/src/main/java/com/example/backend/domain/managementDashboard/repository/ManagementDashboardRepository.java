package com.example.backend.domain.managementDashboard.repository;

import com.example.backend.domain.managementDashboard.dto.ManagementDashBoardResponseDto;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ManagementDashboardRepository extends CrudRepository<ManagementDashboard, Long> {
    Optional<ManagementDashboard> findByName(String name);

    Optional<ManagementDashboard> findByBusinessRegistrationNumber(String businessNumber);

    @Query("select new com.example.backend.managementDashboard.dto.ManagementDashBoardResponseDto" +
            "(m.id, m.name, m.owner, m.companyName, m.businessRegistrationNumber, m.status, m.approval, m.createdAt) " +
            "from ManagementDashboard m " +
            "where m.approval = :approval and m.status = :status")
    Page<ManagementDashBoardResponseDto> findAllByStatusAndApproval(@Param("status") Status status,
                                                                    @Param("approval") boolean approval,
                                                                    Pageable pageable);

}

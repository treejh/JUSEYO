package com.example.backend.user.repository;


import com.example.backend.base.entity.BoardEntity;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);

    Page<User> findByManagementDashboardAndApprovalStatus(ManagementDashboard managementDashboard, ApprovalStatus approvalStatus, Pageable pageable);
    Optional<User> findByIdAndManagementDashboard(Long userId, ManagementDashboard managementDashboard);

}
package com.example.backend.user.repository;


import com.example.backend.base.entity.BoardEntity;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.role.entity.Role;
import com.example.backend.user.dto.response.UserSearchProjection;
import com.example.backend.user.dto.response.UserSearchResponseDto;
import com.example.backend.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    Optional<User> findByName(String name);

    Page<User> findByRole(Role role, Pageable pageable);
    Page<User> findByManagementDashboardAndApprovalStatusAndRole(ManagementDashboard managementDashboard, ApprovalStatus approvalStatus, Pageable pageable, Role role);
    Optional<User> findByIdAndManagementDashboard(Long userId, ManagementDashboard managementDashboard);

    // 관리페이지 회원 전체 조회용
    List<User> findAllByManagementDashboardId(Long managementDashboardId);


    //해당 관리페이지에 존재하는 승인된 매니저 조회
    List<User> findByManagementDashboardAndApprovalStatusAndRole(ManagementDashboard managementDashboard, ApprovalStatus approvalStatus, Role role);


    Page<User> findByManagementDashboardAndApprovalStatusAndRoleAndIdNot(
            ManagementDashboard managementDashboard,
            ApprovalStatus approvalStatus,
            Pageable pageable,
            Role role,
            Long excludeUserId
    );
    List<User> findUsersByRole(Role role);

    List<User> findAllByRole(Role role);

    //회원 검색
    @Query("""
    SELECT
      u.id              AS id,
      u.name            AS name,
      d.name            AS departmentName,
      r.role            AS roleName
    FROM User u
    JOIN u.department d
    JOIN u.role r
    WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :kw, '%'))
  """)
    List<UserSearchProjection> searchUsersByName(@Param("kw") String keyword);

}
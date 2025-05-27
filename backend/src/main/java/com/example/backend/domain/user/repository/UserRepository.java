package com.example.backend.domain.user.repository;


import com.example.backend.domain.department.entity.Department;
import com.example.backend.domain.user.entity.User;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.RoleType;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.role.entity.Role;
import com.example.backend.domain.user.dto.response.UserSearchProjection;
import com.example.backend.enums.Status;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


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
              SELECT u.id                AS id,
                     u.name              AS name,
                     u.email             AS email,
                     u.department.name   AS departmentName,
                     r.role              AS role
                FROM User u
               JOIN u.department d
               JOIN u.role r
               WHERE u.managementDashboard.id = :mdId
                 AND (u.name  LIKE CONCAT('%', :keyword, '%')
                   OR u.email LIKE CONCAT('%', :keyword, '%'))
            """)
    Page<UserSearchProjection> searchUsers(
            @Param("mdId") Long managementDashboardId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    // 회원 검색 - 일반 회원만 - 기본 조회 (키워드 없이)
    @Query("""
      SELECT u.id                AS id,
             u.name              AS name,
             u.email             AS email,
             u.department.name   AS departmentName,
             r.role              AS role
        FROM User u
       JOIN u.department d
       JOIN u.role r
       WHERE u.managementDashboard.id = :mdId
         AND r.role = :roleType
         AND u.approvalStatus = :approvalStatus
         AND (u.name  LIKE CONCAT('%', :keyword, '%')
           OR u.email LIKE CONCAT('%', :keyword, '%'))
    """)
    Page<UserSearchProjection> searchBasicUsers(
            @Param("mdId") Long managementDashboardId,
            @Param("keyword") String keyword,
            @Param("roleType") RoleType roleType,
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            Pageable pageable
    );

    Page<User> findByManagementDashboardAndApprovalStatusAndRoleInAndIdNot(
            ManagementDashboard managementDashboard,
            ApprovalStatus approvalStatus,
            Pageable pageable,
            List<Role> roles,
            Long excludeUserId
    );

    // 사용자(회원) 이름 포함 검색
    Page<User> findByNameContainingAndManagementDashboardAndRole(
            String name,
            ManagementDashboard managementDashboard,
            Role role,
            Pageable pageable
    );

    List<User> findByDepartmentAndApprovalStatusAndStatus(
            Department department,
            ApprovalStatus approvalStatus,
            Status status
    );

    User findByManagementDashboardIdAndInitialManager(Long managementDashboardId, boolean isInitialManager);





}
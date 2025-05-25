package com.example.backend.domain.department.repository;

import com.example.backend.domain.department.entity.Department;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department,Long> {
    Optional<Department> findByManagementDashboardIdAndName(Long managementDashboardId, String name);

    Page<Department> findByManagementDashboard(ManagementDashboard managementDashboard, Pageable pageable);


    boolean existsByName(String name);
}

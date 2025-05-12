package com.example.backend.department.repository;

import com.example.backend.department.entity.Department;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department,Long> {
    Optional<Department> findByManagementDashboardIdAndName(Long managementDashboardId, String name);

    boolean existsByName(String name);
}

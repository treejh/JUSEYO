package com.example.backend.domain.department.service;


import com.example.backend.domain.department.dto.DepartmentCreateRequestDTO;
import com.example.backend.domain.department.dto.DepartmentUpdateRequestDTO;
import com.example.backend.domain.department.entity.Department;
import com.example.backend.domain.department.repository.DepartmentRepository;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ManagementDashboardRepository managementDashboardRepository;


    @Transactional
    public Department findDepartmentByName(Long managementId, String name){
        return departmentRepository.findByManagementDashboardIdAndName(managementId,name)
                .orElseThrow(()->new BusinessLogicException(ExceptionCode.DEPARTMENT_NOT_FOUND));
    }

    // 부서 생성
    @Transactional
    public Department createDepartment(DepartmentCreateRequestDTO dto, ManagementDashboard dashboard) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BusinessLogicException(ExceptionCode.AlREADY_HAS_DEPARTMENT);
        }
        Department department = Department.builder()
                .id(dto.getId())
                .name(dto.getName())
                .managementDashboard(dashboard)
                .build();

        return departmentRepository.save(department);
    }

    // 부서 전체 조회
    public List<Department> findAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department findDepartmentById(Long id) {
        return departmentRepository.findById(id).orElseThrow(() -> new BusinessLogicException(ExceptionCode.DEPARTMENT_NOT_FOUND));
    }

    // 부서명 수정
    @Transactional
    public Department updateDepartment(Long id, DepartmentUpdateRequestDTO dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.DEPARTMENT_NOT_FOUND));

        department.setName(dto.getName());
        return departmentRepository.save(department);
    }


    // 부서 삭제
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.DEPARTMENT_NOT_FOUND));

        departmentRepository.delete(department);
    }



}

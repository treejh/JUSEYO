package com.example.backend.department.service;


import com.example.backend.department.entity.Department;
import com.example.backend.department.repository.DepartmentRepository;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional
    public Department findDepartmentByName(Long managementId, String name){
        return departmentRepository.findByManagementDashboardIdAndName(managementId,name)
                .orElseThrow(()->new BusinessLogicException(ExceptionCode.DEPARTMENT_NOT_FOUND));
    }
}

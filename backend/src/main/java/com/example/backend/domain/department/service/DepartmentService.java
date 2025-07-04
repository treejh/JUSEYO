package com.example.backend.domain.department.service;


import com.example.backend.domain.department.dto.request.DepartmentCreateRequestDTO;
import com.example.backend.domain.department.dto.request.DepartmentUpdateRequestDTO;
import com.example.backend.domain.department.entity.Department;
import com.example.backend.domain.department.repository.DepartmentRepository;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Status;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ManagementDashboardRepository managementDashboardRepository;
    private final UserRepository userRepository;


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


    //관리 페이지에 속한 모든 부서 조회
    public Page<Department> findAllDepartmentsByManagement(String name, Pageable pageable) {
        ManagementDashboard managementDashboard = managementDashboardRepository.findByName(name)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        Page<Department> departments = departmentRepository.findByManagementDashboard(managementDashboard, pageable);


        if (departments.isEmpty()) {
            throw new BusinessLogicException(ExceptionCode.DEPARTMENT_NOT_FOUND);
        }

        return departments;
    }

    //부서에 속한 승인된 유저 기준으로 조회
    public List<User> getUserListByDepartment(Long departmentId){
        Department department = findDepartmentById(departmentId);
        return userRepository.findByDepartmentAndApprovalStatusAndStatus(
                department,
                ApprovalStatus.APPROVED,
                Status.ACTIVE
        );

    }

    //유저 부서 수정
    @Transactional
    public void updateUserDepartment(Long userId, Long departmentId){
        User user = userRepository.findById(userId).orElseThrow(()-> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        Department department = findDepartmentById(departmentId);
        if (user.getDepartment() != null && user.getDepartment().getId().equals(departmentId)) {
            return; // 변경 필요 없음
        }
        user.setDepartment(department);
        userRepository.save(user);

    }



}

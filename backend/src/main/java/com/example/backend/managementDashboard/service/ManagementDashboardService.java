package com.example.backend.managementDashboard.service;


import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ManagementDashboardService {

    private final ManagementRepository managementRepository;


    public ManagementDashboard findByPageName(String name){
        return  managementRepository.findByName(name).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
    }
}

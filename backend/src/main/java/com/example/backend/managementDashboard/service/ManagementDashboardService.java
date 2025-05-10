package com.example.backend.managementDashboard.service;


import com.example.backend.enums.Status;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.managementDashboard.dto.ManagementDashBoardRequestDto;
import com.example.backend.managementDashboard.dto.ManagementDashBoardResponseDto;
import com.example.backend.managementDashboard.dto.ManagementDashboardUpdateRequestDto;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import com.example.backend.managementDashboard.repository.ManagementDashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagementDashboardService {

    private final ManagementDashboardRepository managementRepository;


    public ManagementDashboard findByPageName(String name){
        return  managementRepository.findByName(name).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
    }

    //관리 페이지 생성
    @Transactional
    public ManagementDashBoardResponseDto createManagementDashBoard(ManagementDashBoardRequestDto requestDto){
        if(managementRepository.findByName(requestDto.getName()).isPresent()){
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_BLOG); //나중에 예외 코드 수정 !!
        }
        ManagementDashboard managementDashboard= ManagementDashboard.builder()
                .name(requestDto.getName())
                .owner(requestDto.getOwner())
                .companyName(requestDto.getCompanyName())
                .businessRegistrationNumber(String.valueOf(System.currentTimeMillis()))
                .status(Status.ACTIVE)
                .approval(false)
                .build();
        managementRepository.save(managementDashboard);

        return toDto(managementDashboard);
    }

    //dto로 바꾸기
    public ManagementDashBoardResponseDto toDto(ManagementDashboard managementDashboard){
        ManagementDashBoardResponseDto dto=ManagementDashBoardResponseDto.builder()
                .id(managementDashboard.getId())
                .name(managementDashboard.getName())
                .owner(managementDashboard.getOwner())
                .companyName(managementDashboard.getCompanyName())
                .businessNumber(String.valueOf(managementDashboard.getBusinessRegistrationNumber()))
                .status(managementDashboard.getStatus())
                .approval(managementDashboard.isApproval())
                .createdAt(managementDashboard.getCreatedAt())
                .build();
        return dto;
    }

    //관리 페이지 단일 조회
    public ManagementDashBoardResponseDto getManagementDashBoard(Long id){
        ManagementDashboard managementDashboard=managementRepository.findById(id).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));
        return toDto(managementDashboard);
    }

    //관리페이지 목록 조회 (페이징)
    public Page<ManagementDashBoardResponseDto> findAllManagementDashBoard(Pageable pageable,Status status,boolean approval){
        return managementRepository.findAllByStatusAndApproval(status,approval,pageable);
    }

    //관리 페이지 수정
    @Transactional
    public ManagementDashBoardResponseDto updateManagementDashBoard(ManagementDashboardUpdateRequestDto requestDto, Long id){
        ManagementDashboard managementDashboard=managementRepository.findById(id).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
        if(!isActiveManagementDashBoard(managementDashboard.getId())){
            // 에러 코드 추가
        }
        if (requestDto.getName() != null) {
            managementDashboard.setName(requestDto.getName());
        }
        if (requestDto.getOwner() != null) {
            managementDashboard.setOwner(requestDto.getOwner());
        }
        if (requestDto.getCompanyName() != null) {
            managementDashboard.setCompanyName(requestDto.getCompanyName());
        }
        return toDto(managementDashboard);
    }

    //관리 페이지 삭제
    @Transactional
    public void deleteManagementDashBoard(Long id){
        ManagementDashboard managementDashboard=managementRepository.findById(id).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
        managementDashboard.setStatus(Status.STOP);
    }

    //관리페이지 승인
    @Transactional
    public void approvalManagementDashBoard(Long id){
        ManagementDashboard managementDashboard=managementRepository.findById(id).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
        managementDashboard.setApproval(true);
    }


    //활성화 상태인가
    public boolean isActiveManagementDashBoard(Long id){
        ManagementDashboard managementDashboard=managementRepository.findById(id).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
        if(managementDashboard.getStatus().equals(Status.ACTIVE)){
            return true;
        }
        return false;
    }

    //승인 되었나
    public boolean isApprovedManagementDashBoard(Long id){
        ManagementDashboard managementDashboard=managementRepository.findById(id).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
        return managementDashboard.isApproval();
    }

}

package com.example.backend.domain.managementDashboard.service;


import com.example.backend.domain.managementDashboard.dto.ManagementDashBoardRequestDto;
import com.example.backend.domain.managementDashboard.dto.ManagementDashBoardResponseDto;
import com.example.backend.domain.managementDashboard.dto.ManagementDashboardUpdateRequestDto;
import com.example.backend.domain.notification.event.NewDashboardApprovedEvent;
//import com.example.backend.domain.notification.event.NewDashboardEvent;
import com.example.backend.domain.notification.event.NewDashboardRejectedEvent;
import com.example.backend.enums.Status;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.managementDashboard.repository.ManagementDashboardRepository;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.dto.response.UserSearchResponseDto;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagementDashboardService {

    private final ManagementDashboardRepository managementRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final ApplicationEventPublisher eventPublisher;


    public ManagementDashboard findByPageName(String name){
        return  managementRepository.findByName(name).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
    }

    //관리 페이지 생성
    @Transactional
    public ManagementDashBoardResponseDto createManagementDashBoard(ManagementDashBoardRequestDto requestDto){
        User loginUser = userService.findById(tokenService.getIdFromToken());
        //1. 이미 존재하는 관리 페이지 이름인지 확인
        validateManagementDashBoardName(requestDto.getPageName());

        //2. 관리 생성하려는 사용자가 매니저역할을 가지고 있는지 확인
        userService.validManager();

        //3. 유저가 관리자 페이지를 가지고 있는지 확인
        userService.validateUserHasManagement();

        //4. 생성하려는 유저가 최초 생성 매니저인지 확인 ( 일반 매니저는 생성 불가능 )
        userService.validCreateInitialManager();

        ManagementDashboard managementDashboard= ManagementDashboard.builder()
                .name(requestDto.getPageName())
                .owner(requestDto.getOwner())
                .companyName(requestDto.getCompanyName())
                .businessRegistrationNumber(String.valueOf(System.currentTimeMillis()))
                .status(Status.ACTIVE)
                .approval(false)
                .build();
        ManagementDashboard createManagementDashboard = managementRepository.save(managementDashboard);

        //생성된 관리 페이지 정보, 최초 매니저에게 저장
        loginUser.setManagementDashboard(createManagementDashboard);

        //repo에 저장
        userRepository.save(loginUser);

//        // 어드민 대상 관리 페이지 생성 승인 알림
//        eventPublisher.publishEvent(new NewDashboardEvent(loginUser.getName(), managementDashboard.getName()));

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

        // 대시보드 생성 반려 알림 생성
        eventPublisher.publishEvent(new NewDashboardRejectedEvent(managementDashboard.getId(), managementDashboard.getName()));
    }

    //관리페이지 승인
    @Transactional
    public void approvalManagementDashBoard(Long id){
        ManagementDashboard managementDashboard=managementRepository.findById(id).orElseThrow(
                ()-> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND)
        );
        managementDashboard.setApproval(true);

        // 대시보드 생성 승인 알림 생성
        eventPublisher.publishEvent(new NewDashboardApprovedEvent(managementDashboard.getId(), managementDashboard.getName()));
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

    public void validateManagementDashBoardName(String name){
        if(managementRepository.findByName(name).isPresent()){
            throw new BusinessLogicException(ExceptionCode.ALREADY_HAS_MANAGEMENT_DASHBOARD);
        }
    }

    // 같은 관리페이지에 속한 회원 전체 조회
    public List<UserSearchResponseDto> findUsersByManagementDashboard(Long managementDashboardId) {
        // 1) 관리페이지 존재 여부 체크
        managementRepository.findById(managementDashboardId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.MANAGEMENT_DASHBOARD_NOT_FOUND));

        // 2) 회원 조회 및 DTO 변환
        return userRepository
                .findAllByManagementDashboardId(managementDashboardId)
                .stream()
                .map(UserSearchResponseDto::fromEntity)
                .toList();
    }

    public boolean isValidName(String name){
        return managementRepository.findByName(name).isPresent();
    }
}

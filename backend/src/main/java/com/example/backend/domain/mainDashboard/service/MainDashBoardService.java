package com.example.backend.domain.mainDashboard.service;

import com.example.backend.domain.mainDashboard.entity.MainDashboard;
import com.example.backend.domain.mainDashboard.repository.MainDashBoardRepository;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.mainDashboard.dto.MainDashBoardResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MainDashBoardService {
    private final MainDashBoardRepository mainDashBoardRepository;

    //모든 메인 게시판 찾기
    public Page<MainDashBoardResponseDto> getAllMainDashBoards(Pageable pageable) {
        return mainDashBoardRepository.findAllUserDtos(pageable);
    }

    //메인 게시판 찾기
    public MainDashBoardResponseDto getMainDashBoard(Long id) {
        MainDashboard mainDashboard=mainDashBoardRepository.findById(id).orElse(null);
        if(mainDashboard==null) {
            throw new BusinessLogicException(ExceptionCode.MAIN_DASHBOARD_NOT_FOUND);
        }
        return toDto(mainDashboard);
    }

    //메인 게시판 생성
    @Transactional
    public MainDashBoardResponseDto createMainDashBoard(String name) {
        MainDashboard mainDashboard=MainDashboard.builder()
                .name(name)
                .build();
        mainDashBoardRepository.save(mainDashboard);
        return toDto(mainDashboard);
    }

    //메인 게시판 수정
    @Transactional
    public MainDashBoardResponseDto updateMainDashBoard(Long id, String name) {
        MainDashboard mainDashboard=mainDashBoardRepository.findById(id).orElse(null);
        if(mainDashboard==null) {
            throw new BusinessLogicException(ExceptionCode.MAIN_DASHBOARD_NOT_FOUND);
        }
        mainDashboard.setName(name);
        return toDto(mainDashboard);
    }

    //엔티티 -> dto
    public MainDashBoardResponseDto toDto(MainDashboard mainDashboard) {
        MainDashBoardResponseDto mainDashBoardGetDto= MainDashBoardResponseDto.builder()
                .id(mainDashboard.getId())
                .name(mainDashboard.getName())
                .createdAt(mainDashboard.getCreatedAt())
                .updatedAt(mainDashboard.getModifiedAt())
                .build();
        return mainDashBoardGetDto;
    }

}

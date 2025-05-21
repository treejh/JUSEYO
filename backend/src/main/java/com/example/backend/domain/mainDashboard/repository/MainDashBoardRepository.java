package com.example.backend.domain.mainDashboard.repository;

import com.example.backend.domain.mainDashboard.entity.MainDashboard;
import com.example.backend.domain.mainDashboard.dto.MainDashBoardResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MainDashBoardRepository extends JpaRepository<MainDashboard,Long> {
    @Query("SELECT new com.example.backend.domain.mainDashboard.dto.MainDashBoardResponseDto(m.id,m.name,m.createdAt,m.modifiedAt) from MainDashboard m")
    Page<MainDashBoardResponseDto> findAllUserDtos(Pageable pageable);
}

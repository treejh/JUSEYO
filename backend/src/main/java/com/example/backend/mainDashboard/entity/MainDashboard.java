package com.example.backend.mainDashboard.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.managementDashboard.entity.ManagementDashboard;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "main_dashboard") // 대문자 주의
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class MainDashboard extends Auditable { // Auditable 상속

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 스키마 VARCHAR와 충돌 가능성 있음
    private Long id;


    @Column(name = "name", nullable = false)
    private String name;

//    @OneToMany(mappedBy = "mainDashboard", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.LAZY)
//    List<ManagementDashboard> dashboardList = new ArrayList<>();

}
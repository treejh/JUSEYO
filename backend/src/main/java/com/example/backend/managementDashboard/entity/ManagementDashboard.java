package com.example.backend.managementDashboard.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.category.entity.Category;
import com.example.backend.department.entity.Department;
import com.example.backend.enums.Status;
import com.example.backend.item.entity.Item;
import com.example.backend.user.entity.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "management_dashboards")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class ManagementDashboard extends Auditable { // Auditable 상속

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 스키마 VARCHAR와 충돌 가능성 있음
    private Long id;


    @Column(name = "name",nullable = false)
    private String name;

    @Column(name = "owner",nullable = false)
    private String owner;

    @Column(name = "company_name",nullable = false)
    private String companyName;

    @Column(name = "business_registration_number",nullable = false)
    private String businessRegistrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "approval", nullable = false)
    private boolean approval;

    @OneToMany(mappedBy = "managementDashboard", cascade = CascadeType.REMOVE, orphanRemoval = false)
    List<Category> categoryList = new ArrayList<>();

    @OneToMany(mappedBy = "managementDashboard", cascade = CascadeType.REMOVE, orphanRemoval = false)
    List<Item> itemList = new ArrayList<>();

    @OneToMany(mappedBy = "managementDashboard", cascade = CascadeType.REMOVE, orphanRemoval = false)
    List<User> userList = new ArrayList<>();

    @OneToMany(mappedBy = "managementDashboard", cascade = CascadeType.REMOVE, orphanRemoval = false)
    List<Department> departmentList = new ArrayList<>();




}
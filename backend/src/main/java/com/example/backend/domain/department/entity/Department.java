package com.example.backend.domain.department.entity;

import com.example.backend.global.auditable.Auditable;

import com.example.backend.domain.user.entity.User;
import jakarta.persistence.*;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "department")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class Department extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;


    @ManyToOne
    @JoinColumn(name = "management_id")
    private ManagementDashboard managementDashboard;

    @OneToMany(mappedBy = "department", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.EAGER)
    List<User> userList = new ArrayList<>();


}

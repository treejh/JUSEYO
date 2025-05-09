package com.example.backend.department.entity;

import com.example.backend.auditable.Auditable;

import com.example.backend.user.entity.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import com.example.backend.managementdashboard.entity.ManagementDashboard;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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

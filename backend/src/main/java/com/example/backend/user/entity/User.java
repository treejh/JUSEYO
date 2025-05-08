package com.example.backend.user.entity;

import com.example.backend.auditable.Auditable;
import com.example.backend.item.entity.Item;
import com.example.backend.itemInstance.entity.ItemInstance;
import com.example.backend.notification.entity.Notification;
import com.example.backend.role.entity.Role;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users") // 대문자 주의
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class User extends Auditable { // Auditable 상속

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 스키마 VARCHAR와 충돌 가능성 있음
    private Long id;

    @Column(name = "main_id", nullable = false)
    private String mainId;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "management_id")
    private String managementId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone_number") // NULL 허용
    private String phoneNumber;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "status", nullable = false) // '활성, 탈퇴(삭제)'
    private String status; // Enum 타입이 더 적합할 수 있음

    @Column(name = "management_status") // NULL 허용, 목적 불분명
    private String managementStatus;

    @Column(name = "approval_status") // NULL 허용, 목적 불분명
    private String approvalStatus; // Enum 타입이 더 적합할 수 있음


    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.LAZY)
    List<Notification> notificationList = new ArrayList<>();



}
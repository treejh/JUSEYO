package com.example.backend.domain.user.entity;

import com.example.backend.global.auditable.Auditable;
import com.example.backend.domain.chat.chatMessage.entity.ChatMessage;
import com.example.backend.domain.chat.chatUser.entity.ChatUser;
import com.example.backend.domain.department.entity.Department;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Status;
import com.example.backend.domain.managementDashboard.entity.ManagementDashboard;
import com.example.backend.domain.notification.entity.Notification;
import com.example.backend.domain.role.entity.Role;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone_number",nullable = false) // NULL 허용
    private String phoneNumber;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;


    @Column(name = "initial_manager")
    private boolean initialManager;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status",nullable = false) // NULL 허용, 목적 불분명
    private ApprovalStatus approvalStatus; // Enum 타입이 더 적합할 수 있음

    @ManyToOne
    @JoinColumn(name = "management_id")
    private ManagementDashboard managementDashboard;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;


    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.EAGER)
    List<Notification> notificationList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.EAGER)
    List<ChatUser> chatUserList = new ArrayList<>();


    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true,  fetch = FetchType.EAGER)
    List<ChatMessage> chatMessageList = new ArrayList<>();



}
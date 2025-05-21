package com.example.backend.domain.notification.entity;

import com.example.backend.domain.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import com.example.backend.global.auditable.Auditable;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Notification extends Auditable {

    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 30)
    private NotificationType notificationType; // 승인 상태



    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;


    @Column(name = "read_status", nullable = false)
    private boolean readStatus;


    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;


}

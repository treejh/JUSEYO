package com.example.backend.notification.entity;

import com.example.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import com.example.backend.auditable.Auditable;
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
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType; // 승인 상태



    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;


    @Column(name = "read_status", nullable = false)
    private boolean readStatus;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;


}

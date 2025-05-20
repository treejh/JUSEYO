package com.example.backend.chat.chatUser.entity;


import com.example.backend.auditable.Auditable;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.department.entity.Department;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.ChatStatus;
import com.example.backend.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chat_users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class ChatUser extends Auditable {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "chat_status",nullable = false)
    private ChatStatus chatStatus;

    @Column(name = "last_enter_time")
    private LocalDateTime lastEnterTime;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "is_creator", nullable = false)
    private boolean isCreator; //true일 경우 최초 생성자

    @ManyToOne
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;


}

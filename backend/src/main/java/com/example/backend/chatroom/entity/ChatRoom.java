package com.example.backend.chatroom.entity;

import com.example.backend.auditable.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "ChatRoom")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class ChatRoom extends Auditable { // Auditable 상속

    @Id
    @Column(name = "id") // 스키마는 VARCHAR지만, Long + IDENTITY 전략을 위해 Long으로 매핑
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 스키마 VARCHAR와 충돌 가능성 있음, DB 스키마 조정 필요
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId; // User와의 관계 매핑 시 User user; 로 변경하고 @ManyToOne 설정

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "is_group", nullable = false) // 스키마 코멘트에 '후에 추가 예정'
    private String isGroup; // Boolean 타입이 더 적합할 수 있음

}
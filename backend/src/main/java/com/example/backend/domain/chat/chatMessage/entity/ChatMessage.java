package com.example.backend.domain.chat.chatMessage.entity;


import com.example.backend.global.auditable.Auditable;
import com.example.backend.domain.chat.chatroom.entity.ChatRoom;
import com.example.backend.enums.ChatMessageStatus;
import com.example.backend.domain.user.entity.User;
import com.example.backend.global.mongo.MongoAuditable;
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
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "chatMessages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage extends MongoAuditable {


    @Id
    private String id;  // MongoDB는 기본적으로 ObjectId → String 사용


    private Long userId;

    private Long chatRoomId;  // ChatRoom 전체 객체 대신 ID만 저장

    private String userName;


    private ChatMessageStatus messageStatus;

    private String message;


}

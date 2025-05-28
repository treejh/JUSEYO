package com.example.backend.domain.chat.chatMessage.dto.response;

import com.example.backend.domain.chat.chatMessage.entity.ChatMessage;
import com.example.backend.enums.ChatMessageStatus;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatResponseDto {

    private Long roomId;         // 방 번호
    private String sender;       // 보낸 사람 닉네임
    private Long userId;
    private String message;      // 메시지 내용
    private ZonedDateTime createDate; // 메시지 생성 시간
    private ChatMessageStatus chatStatus; //메시지 타입

    public ChatResponseDto(ChatMessage chatMessage) {
        this.roomId = chatMessage.getChatRoom().getId();
        this.sender = chatMessage.getUser().getName();
        this.message = chatMessage.getMessage();
        this.createDate = chatMessage.getCreatedAt().atZone(ZoneId.of("Asia/Seoul"));
        this.chatStatus = chatMessage.getMessageStatus();
        this.userId  = chatMessage.getUser().getId();
    }
}
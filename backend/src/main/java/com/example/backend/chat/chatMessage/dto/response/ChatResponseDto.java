package com.example.backend.chat.chatMessage.dto.response;

import com.example.backend.chat.chatMessage.entity.ChatMessage;
import com.example.backend.enums.ChatStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatResponseDto {

    private Long roomId;         // 방 번호
    private String sender;       // 보낸 사람 닉네임
    private String message;      // 메시지 내용
    private LocalDateTime createDate; // 메시지 생성 시간
    private ChatStatus chatStatus;

    public ChatResponseDto(ChatMessage chatMessage) {
        this.roomId = chatMessage.getChatRoom().getId();
        this.sender = chatMessage.getUser().getName();
        this.message = chatMessage.getMessage();
        this.createDate = chatMessage.getCreatedAt();
        this.chatStatus = getChatStatus();
    }
}
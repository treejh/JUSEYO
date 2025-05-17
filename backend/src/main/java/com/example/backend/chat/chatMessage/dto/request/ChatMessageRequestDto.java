package com.example.backend.chat.chatMessage.dto.request;


import com.example.backend.enums.ChatMessageStatus;
import com.example.backend.enums.ChatStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequestDto {

    //메시지 타입 :  입장 채팅
    private ChatMessageStatus type; //메시지 타입
    //채팅 보내는 유저 아이디 -> 토큰에서 바로 조회하는 방법도 고민 (stomp라 찾아봐야 할듯 )
    private Long userId;
    private Long roomId;
    private String message;// 메세지

}

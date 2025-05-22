package com.example.backend.domain.chat.chatroom.dto.request;


import com.example.backend.enums.ChatRoomType;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatRoomRequestDto {

    //채팅을 요청 받은 사람의 유저 아이디 (고유 아이디)
    private Long userId;       // 상대 유저 ID (1:1, 고객센터용)
    private List<Long> userIds; // 단체 채팅용
    private String roomName;// 채팅방 이름

    @NotNull
    private ChatRoomType roomType; // ONE_TO_ONE, GROUP, SUPPORT 등

}

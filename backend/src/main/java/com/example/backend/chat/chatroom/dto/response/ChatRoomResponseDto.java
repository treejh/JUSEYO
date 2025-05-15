package com.example.backend.chat.chatroom.dto.response;


import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.enums.ChatRoomType;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ChatRoomResponseDto {


    private String roomName;// 채팅방 이름
    private ChatRoomType roomType; // ONE_TO_ONE, GROUP, SUPPORT 등

    public ChatRoomResponseDto(ChatRoom chatRoom){
        this.roomName= chatRoom.getRoomName();
        this.roomType=chatRoom.getRoomType();
    }
}

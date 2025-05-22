package com.example.backend.domain.chat.chatroom.dto.response;


import com.example.backend.domain.chat.chatroom.entity.ChatRoom;
import com.example.backend.enums.ChatRoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ChatRoomResponseDto {
    private Long id;
    private String roomName;// 채팅방 이름
    private ChatRoomType roomType; // ONE_TO_ONE, GROUP, SUPPORT 등

    public ChatRoomResponseDto(ChatRoom chatRoom){
        this.id = chatRoom.getId();
        this.roomName= chatRoom.getRoomName();
        this.roomType=chatRoom.getRoomType();
    }


}

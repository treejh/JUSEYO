package com.example.backend.chat.chatroom.controller;


import com.example.backend.chat.chatroom.dto.request.ChatRoomRequestDto;
import com.example.backend.chat.chatroom.dto.response.ChatRoomResponseDto;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.chat.chatroom.service.ChatRoomService;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chats/chatRooms")
@Validated
@AllArgsConstructor
@Tag(name = "채팅방 관련 컨트롤러")
@Slf4j
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @PostMapping
    public ResponseEntity<?> createChatRoom(@Valid @RequestBody ChatRoomRequestDto chatRoomRequestDto) {
        ChatRoomResponseDto chatRoomResponseDto = new ChatRoomResponseDto(chatRoomService.createChatRoom(chatRoomRequestDto));

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.CREATED.value(), "채팅 생성 완료  ", chatRoomResponseDto),
                HttpStatus.CREATED
        );

    }



}

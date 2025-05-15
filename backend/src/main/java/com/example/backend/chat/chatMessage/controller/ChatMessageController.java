package com.example.backend.chat.chatMessage.controller;

import com.example.backend.chat.chatMessage.dto.request.ChatMessageRequestDto;
import com.example.backend.chat.chatMessage.dto.response.ChatResponseDto;
import com.example.backend.chat.chatMessage.entity.ChatMessage;
import com.example.backend.chat.chatMessage.service.ChatMessageService;
import com.example.backend.chat.chatUser.entity.ChatUser;
import com.example.backend.chat.chatUser.repository.ChatUserRepository;
import com.example.backend.chat.chatroom.repository.ChatRoomRepository;
import com.example.backend.chat.chatroom.service.ChatRoomService;
import com.example.backend.enums.ChatMessageStatus;
import com.example.backend.enums.ChatStatus;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import com.example.backend.user.service.UserService;
import com.example.backend.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chats")
@Validated
@AllArgsConstructor
@Tag(name = "채팅 관련 컨트롤러")
@Slf4j
public class ChatMessageController {

    private final SimpMessageSendingOperations template;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/{roomId}")
    public void enterUser(@DestinationVariable(value = "roomId") final Long roomId,
                          @Payload ChatMessageRequestDto chatMessageRequestDto, SimpMessageHeaderAccessor headerAccessor){

        ChatResponseDto responseMessage = new ChatResponseDto(chatMessageService.sendMessage(chatMessageRequestDto));

        ApiResponse<ChatResponseDto> response = ApiResponse.of(
                200,
                "메시지 확인",
                responseMessage
        );

        template.convertAndSend("/sub/chat/" + roomId, response);

    }


}
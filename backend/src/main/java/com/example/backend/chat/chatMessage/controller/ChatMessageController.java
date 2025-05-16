package com.example.backend.chat.chatMessage.controller;

import com.example.backend.chat.chatMessage.dto.request.ChatMessageRequestDto;
import com.example.backend.chat.chatMessage.dto.response.ChatResponseDto;
import com.example.backend.chat.chatMessage.entity.ChatMessage;
import com.example.backend.chat.chatMessage.service.ChatMessageService;
import com.example.backend.utils.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/{roomId}")
    @Operation(
            summary = "채팅방 메시지 조회 ",
            description = "채팅방에 존재하는 메시지를 조회할 수 있습니다.  "
    )
    public ResponseEntity<?> getChatMessage(@Valid @PathVariable Long roomId,
                                            @RequestParam(name = "page", defaultValue = "1") int page,
                                            @RequestParam(name="size", defaultValue = "20") int size) {

        Page<ChatMessage> chatMessagePage = chatMessageService.getChatMessage(roomId,
                PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        Page<ChatResponseDto> responseMessage = chatMessagePage.map(ChatResponseDto::new);
        return new ResponseEntity<>(
                ApiResponse.of(
                        HttpStatus.OK.value(),
                        "채팅방에 속한 메시지 조회",
                        responseMessage
                ),
                HttpStatus.OK
        );
    }



}
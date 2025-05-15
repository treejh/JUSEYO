package com.example.backend.chat.chatUser;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class ChatUserController {

    private final SimpMessageSendingOperations template;
}

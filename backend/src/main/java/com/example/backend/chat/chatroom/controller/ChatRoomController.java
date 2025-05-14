package com.example.backend.chat.chatroom.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chatRooms")
@Validated
@AllArgsConstructor
@Tag(name = "채팅방 관련 컨트롤러")
@Slf4j
public class ChatRoomController {

}

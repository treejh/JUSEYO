package com.example.backend.chat.chatroom.controller;


import com.example.backend.chat.chatroom.dto.request.ChatRoomRequestDto;
import com.example.backend.chat.chatroom.dto.response.ChatRoomResponseDto;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.chat.chatroom.service.ChatRoomService;
import com.example.backend.enums.ChatRoomType;
import com.example.backend.exception.BusinessLogicException;
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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    @Operation(
            summary = "새로운 채팅방 생성  ",
            description = "채팅방을 생성할 수 있습니다.  "
    )
    public ResponseEntity<ApiResponse<ChatRoomResponseDto>> createChatRoom(@Valid @RequestBody ChatRoomRequestDto chatRoomRequestDto) {
        ChatRoomResponseDto chatRoomResponseDto = new ChatRoomResponseDto(chatRoomService.createChatRoom(chatRoomRequestDto));

        //ChatRoomType에 따라 다름
        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.CREATED.value(), "채팅 생성 완료  ", chatRoomResponseDto),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @Operation(
            summary = "유저의 채팅방 조회하기",
            description = "현재 유저가 속한 채팅방 조회하기\n"
                    + "- ONE_TO_ONE: 1:1 채팅방\n"
                    + "- GROUP: 그룹 채팅방\n"
                    + "- SUPPORT: 고객센터 채팅방"
    )

    public ResponseEntity<ApiResponse<Page<ChatRoomResponseDto>>> getUserChatRoom(@Valid @RequestParam ChatRoomType chatRoomType,
                                             @RequestParam(name = "page", defaultValue = "1") int page,
                                             @RequestParam(name="size", defaultValue = "10") int size) {
        Page<ChatRoom> chatRoomList = chatRoomService.getChatRoomList(chatRoomType,
                PageRequest.of(page -1, size, Sort.by(Sort.Direction.DESC, "modifiedAt")));

        Page<ChatRoomResponseDto> responseDto = chatRoomList.map(ChatRoomResponseDto::new);

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.CREATED.value(), "채팅방 조회 완료  ", responseDto), //사용자와 사용자 간의 1:1 채팅
                HttpStatus.CREATED
        );
    }

    @PostMapping("/enter/valid/{roomId}")
    @Operation(
            summary = "enter 검증 ",
            description = "현재 채팅방에 사용자가 enter한적 있는지 확인 "
    )
    public ResponseEntity<ApiResponse<Boolean>> enterChatRoom(@PathVariable Long roomId) {
        //true면 입장한거고, fasle면 입장한 사용자가 아님
        boolean response = chatRoomService.chatRoomEnterValid(roomId);

        return new ResponseEntity<>(
                ApiResponse.of(HttpStatus.OK.value(), "채팅방 조회 완료  ", response), //사용자와 사용자 간의 1:1 채팅
                HttpStatus.OK
        );


    }






}

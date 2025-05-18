package com.example.backend.chat.chatMessage.service;


import static com.example.backend.enums.ChatMessageStatus.ENTER;

import com.example.backend.chat.chatMessage.dto.request.ChatMessageRequestDto;
import com.example.backend.chat.chatMessage.dto.response.ChatResponseDto;
import com.example.backend.chat.chatMessage.entity.ChatMessage;
import com.example.backend.chat.chatMessage.repository.ChatMessageRepository;
import com.example.backend.chat.chatUser.entity.ChatUser;
import com.example.backend.chat.chatUser.repository.ChatUserRepository;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.chat.chatroom.repository.ChatRoomRepository;
import com.example.backend.chat.chatroom.service.ChatRoomService;
import com.example.backend.enums.ChatMessageStatus;
import com.example.backend.enums.ChatStatus;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import com.example.backend.user.service.UserService;
import com.example.backend.utils.dto.ApiResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatUserRepository chatUserRepository;

    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final TokenService tokenService;


    //채팅방 유저 리스트에 유저추가 -> 이거 유저 미드에 넣으면 되지 않을까 ?
    //유저 미드에서 채팅방 찾고 그 채팅방에서 유저 네임을 찾으면 될듯
    public ChatMessage sendMessage(ChatMessageRequestDto chatMessageRequestDto) {
        User user = userService.findById(chatMessageRequestDto.getUserId());
        ChatRoom chatRoom = chatRoomService.findChatRoomById(chatMessageRequestDto.getRoomId());

        ChatUser chatUser = chatUserRepository.findByUserAndChatRoom(user, chatRoom)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.NOT_ENTER_CHAT_ROOM));

        ChatMessage chatMessage;

        switch (chatMessageRequestDto.getType()) {
            case ENTER -> {
                //chatUser가 create가 아니면 이미 참여 상태인거임
                if (!chatUser.getChatStatus().equals(ChatStatus.CREATE)) {
                    throw new BusinessLogicException(ExceptionCode.ALREADY_ENTER_CHAT_ROOM);
                }

                //create가 맞는 경우는 enter로 변경
                chatUser.setChatStatus(ChatStatus.ENTER);
                chatUser.setModifiedAt(LocalDateTime.now());
                chatUserRepository.save(chatUser);

                chatMessage = ChatMessage.builder()
                        .message(user.getName() + "님이 입장하셨습니다")
                        .chatRoom(chatRoom)
                        .user(user)
                        .messageStatus(ENTER)
                        .build();
            }
            case TALK -> {

                // 메시지 저장
                chatMessage = ChatMessage.builder()
                        .message(chatMessageRequestDto.getMessage())
                        .chatRoom(chatRoom)
                        .user(user)
                        .messageStatus(ChatMessageStatus.TALK)
                        .build();

                // 채팅 참여 처리
                List<ChatUser> chatUserList = chatUserRepository.findByChatRoom(chatRoom);

                for (ChatUser userList : chatUserList) {
                    if (userList.getChatStatus() == ChatStatus.INVITED) {
                        userList.setChatStatus(ChatStatus.ENTER);

                        ChatMessage enterMessage = ChatMessage.builder()
                                .message(userList.getUser().getName() + "님이 입장하셨습니다.")
                                .chatRoom(chatRoom)
                                .user(userList.getUser()) // ✅ 올바른 유저로 설정
                                .messageStatus(ChatMessageStatus.ENTER)
                                .build();

                        chatMessageRepository.save(enterMessage);
                        //가장 최근에 글이 입력된 채팅방 가져오기 위해서
                        userList.setModifiedAt(LocalDateTime.now());
                        simpMessagingTemplate.convertAndSend(
                                "/sub/chat/" + chatRoom.getId(),
                                ApiResponse.of(200, "입장 메시지", new ChatResponseDto(enterMessage))
                        );
                    }
                }


                chatUserRepository.saveAll(chatUserList);
            }
            case LEAVE -> {
                chatMessage = ChatMessage.builder()
                        .message(user.getName() + "님이 퇴장하셨습니다.")
                        .chatRoom(chatRoom)
                        .user(user)
                        .messageStatus(ChatMessageStatus.LEAVE)
                        .build();
                log.info("message확인 1 + " + chatMessage.getMessage());
                chatUser.setChatStatus(ChatStatus.LEAVE);
                chatUserRepository.save(chatUser);
            }
            default -> throw new BusinessLogicException(ExceptionCode.INVALID_CHAT_ROOM_TYPE);
        }
        log.info("message확인 2 + " + chatMessage.getMessage());
        return chatMessageRepository.save(chatMessage);
    }

    public Page<ChatMessage> getChatMessage(Long roomId, Pageable pageable){
        User user = userService.findById(tokenService.getIdFromToken());
        ChatRoom chatRoom = chatRoomService.findChatRoomById(roomId);

        //참여중인 채팅방 아니면 메시지 조회 못함
        if(chatUserRepository.findByUserAndChatRoom(user,chatRoom).isEmpty()){
            throw new BusinessLogicException(ExceptionCode.NOT_ENTER_CHAT_ROOM);
        };

        return chatMessageRepository.findByChatRoom(chatRoom,pageable);
    }


}

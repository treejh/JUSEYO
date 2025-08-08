package com.example.backend.domain.chat.chatMessage.service;


import static com.example.backend.enums.ChatMessageStatus.ENTER;

import com.example.backend.domain.chat.chatMessage.dto.request.ChatMessageRequestDto;
import com.example.backend.domain.chat.chatMessage.dto.response.ChatResponseDto;
import com.example.backend.domain.chat.chatMessage.entity.ChatMessage;
import com.example.backend.domain.chat.chatMessage.repository.ChatMessageRepository;
import com.example.backend.domain.chat.chatUser.entity.ChatUser;
import com.example.backend.domain.chat.chatUser.repository.ChatUserRepository;
import com.example.backend.domain.chat.chatroom.entity.ChatRoom;
import com.example.backend.domain.chat.chatroom.service.ChatRoomService;
import com.example.backend.domain.chat.redis.ChatMessageRedisService;
import com.example.backend.domain.chat.redis.RedisCacheLock;
import com.example.backend.enums.ChatMessageStatus;
import com.example.backend.enums.ChatStatus;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.notification.event.NewChatEvent;
import com.example.backend.global.security.jwt.service.TokenService;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.service.UserService;
import com.example.backend.global.utils.dto.ApiResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
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


    private final ChatMessageRedisService chatMessageRedisService;

    // for 알림
    private final ApplicationEventPublisher eventPublisher;


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
                chatUser.setLastEnterTime(LocalDateTime.now());
                chatUserRepository.save(chatUser);

                chatMessage = ChatMessage.builder()
                        .message(user.getName() + "님이 입장하셨습니다")
                        .chatRoom(chatRoom)
                        .user(user)
                        .messageStatus(ENTER)
                        .build();
            }
            case TALK -> {
                log.info("TALK 입장");
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

                        if (!userList.getUser().getId().equals(user.getId())) {
                            eventPublisher.publishEvent(new NewChatEvent(
                                    userList.getUser().getId(),
                                    chatRoom.getId(),
                                    user.getRole().getRole(),
                                    user.getName(),
                                    chatRoom.getRoomType()
                            ));
                        }

                        //가장 최근에 글이 입력된 채팅방 가져오기 위해서
                        userList.setModifiedAt(LocalDateTime.now());
                        userList.setLastEnterTime(LocalDateTime.now());
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

            }
            default -> throw new BusinessLogicException(ExceptionCode.INVALID_CHAT_ROOM_TYPE);
        }
        log.info("message확인 2 + " + chatMessage.getMessage());
        return chatMessageRepository.save(chatMessage);
    }

    public Page<ChatResponseDto> getChatMessage(Long roomId, Pageable pageable) {

        List<ChatResponseDto> cached = chatMessageRedisService.getCachedMessages(roomId, pageable.getPageNumber());

        // ✅ null만 MISS → empty 포함해서 HIT
        if (cached != null) {
            return new PageImpl<>(cached, pageable, cached.size());
        }

        // 🔒 캐시 MISS → 락 거는 메서드 따로 분리
        return getChatMessageWithLock(roomId, pageable);
    }

    @RedisCacheLock(key = "'chatroom:' + #roomId + ':messages:page:' + #pageable.pageNumber")
    public Page<ChatResponseDto> getChatMessageWithLock(Long roomId, Pageable pageable) {
        // 이 안에서는 DB 조회 + 캐싱

        //한번 더 체크
        List<ChatResponseDto> cached = chatMessageRedisService.getCachedMessages(roomId, pageable.getPageNumber());
        if (cached != null && !cached.isEmpty()) {
            return new PageImpl<>(cached, pageable, cached.size());
        }

        User user = userService.findById(tokenService.getIdFromToken());
        ChatRoom chatRoom = chatRoomService.findChatRoomById(roomId);

        if (chatUserRepository.findByUserAndChatRoom(user, chatRoom).isEmpty()) {
            throw new BusinessLogicException(ExceptionCode.NOT_ENTER_CHAT_ROOM);
        }

        Page<ChatMessage> chatMessagePage = chatMessageRepository.findByChatRoom(chatRoom, pageable);
        List<ChatResponseDto> result = chatMessagePage.map(ChatResponseDto::new).toList();

        chatMessageRedisService.cacheMessages(roomId,result,Duration.ofSeconds(chatMessageRedisService.messageTTL),pageable.getPageNumber());

        return new PageImpl<>(result, pageable, result.size());
    }



}

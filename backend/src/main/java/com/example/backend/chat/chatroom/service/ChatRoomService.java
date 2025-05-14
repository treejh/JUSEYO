package com.example.backend.chat.chatroom.service;


import com.example.backend.chat.chatUser.entity.ChatUser;
import com.example.backend.chat.chatUser.repository.ChatUserRepository;
import com.example.backend.chat.chatroom.dto.request.ChatRoomRequestDto;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.chat.chatroom.repository.ChatRoomRepository;
import com.example.backend.enums.ChatRoomType;
import com.example.backend.enums.ChatStatus;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatUserRepository chatUserRepository;
    private final TokenService tokenService;
    private final UserService userService;


    @Transactional
    public ChatRoom createChatRoom(ChatRoomRequestDto dto) {
        User loginUser = userService.findById(tokenService.getIdFromToken());

        switch (dto.getRoomType()) {
            case ONE_TO_ONE:
                return createOneToOneRoom(loginUser, dto);
            case GROUP:
                return createGroupRoom(loginUser, dto);
            case SUPPORT:
                return createSupportRoom(loginUser);
            default:
                throw new IllegalArgumentException("지원하지 않는 채팅방 타입입니다.");
        }
    }



    public ChatRoom createOneToOneRoom(ChatRoomRequestDto chatRoomRequestDto) {
        User loginUser = userService.findById(tokenService.getIdFromToken());
        User requestedUser = userService.findById(chatRoomRequestDto.getUserId()); //채팅 요청을 받은 사용자

        Optional<ChatRoom> existingRoom = getExistingRoom(loginUser.getId(), requestedUser.getId());
        if (existingRoom.isPresent()) return existingRoom.get();

        ChatRoom chatRoom = ChatRoom.builder()
                .roomName(StringUtils.hasText(chatRoomRequestDto.getRoomName()) ? chatRoomRequestDto.getRoomName() : null)
                .roomType(ChatRoomType.ONE_TO_ONE)
                .build();

        chatRoomRepository.save(chatRoom);
        createChatUsers(chatRoom, List.of(loginUser, requestedUser), ChatStatus.CREATE);
        return chatRoom;
    }

    private ChatRoom createOneToOneRoom(User loginUser, ChatRoomRequestDto dto) {
        User requestedUser = userService.findById(dto.getUserId());

        Optional<ChatRoom> existingRoom = getExistingRoom(loginUser.getId(), requestedUser.getId());
        if (existingRoom.isPresent()) return existingRoom.get();

        return createRoomBase(List.of(loginUser, requestedUser), dto.getRoomName(), ChatRoomType.ONE_TO_ONE);
    }

    private ChatRoom createGroupRoom(User creator, ChatRoomRequestDto dto) {
        List<User> members = userService.findAllByIds(dto.getUserIds());
        List<User> allUsers = List.copyOf(members);

        // 방장은 생성자 기준으로 첫 번째에 추가
        allUsers.add(0, creator);

        return createRoomBase(allUsers, dto.getRoomName(), ChatRoomType.GROUP);
    }


    private ChatRoom createSupportRoom(User client) {
        User supportAgent = userService.fi(); // 로직은 구현 필요
        return createRoomBase(List.of(client, supportAgent), dto.getRoomName(), ChatRoomType.SUPPORT);
    }

    @Transactional
    public ChatRoom createRoomBase(List<User> users, String roomName, ChatRoomType type) {
        ChatRoom chatRoom = ChatRoom.builder()
                .roomName(roomName)
                .roomType(type)
                .build();

        chatRoomRepository.save(chatRoom);
        createChatUsers(chatRoom, users, ChatStatus.CREATE);
        return chatRoom;
    }

    private void createChatUsers(ChatRoom chatRoom, List<User> users, ChatStatus status) {
        for (int i = 0; i < users.size(); i++) {
            ChatUser chatUser = ChatUser.builder()
                    .user(users.get(i))
                    .chatRoom(chatRoom)
                    .chatStatus(status)
                    .isCreator(i == 0) // 첫 유저를 방장으로 지정
                    .build();
            chatUserRepository.save(chatUser);
        }
    }











    //1:1 채팅방이 존재하는지 확인
    private Optional<ChatRoom> getExistingRoom(Long userId1, Long userId2) {
        return chatRoomRepository.findByUsers(userId1, userId2);
    }

}

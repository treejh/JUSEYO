package com.example.backend.chat.chatroom.service;


import com.example.backend.chat.chatMessage.entity.ChatMessage;
import com.example.backend.chat.chatMessage.repository.ChatMessageRepository;
import com.example.backend.chat.chatUser.entity.ChatUser;
import com.example.backend.chat.chatUser.repository.ChatUserRepository;
import com.example.backend.chat.chatroom.dto.request.ChatRoomRequestDto;
import com.example.backend.chat.chatroom.dto.request.ChatRoomValidRequestDto;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import com.example.backend.chat.chatroom.repository.ChatRoomRepository;
import com.example.backend.enums.ChatRoomType;
import com.example.backend.enums.ChatStatus;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.security.jwt.service.TokenService;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import com.example.backend.utils.CreateRandomNumber;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatUserRepository chatUserRepository;
    private final ChatMessageRepository chatMessageRepository;


    private final TokenService tokenService;
    private final UserService userService;


    @Transactional
    public ChatRoom createChatRoom(ChatRoomRequestDto chatRoomRequestDto) {
        User loginUser = userService.findById(tokenService.getIdFromToken());

        //ChatRoomType
        switch (chatRoomRequestDto.getRoomType()) {
            case ONE_TO_ONE:
                return createOneToOneRoom(loginUser, chatRoomRequestDto);
            case GROUP:
                return createGroupRoom(loginUser, chatRoomRequestDto);
            case SUPPORT:
                return createSupportRoom(loginUser, chatRoomRequestDto);
            default:
                throw new BusinessLogicException(ExceptionCode.INVALID_CHAT_ROOM_TYPE, "지원하지 않는 채팅방 타입입니다.");
        }

    }


    private ChatRoom createOneToOneRoom(User loginUser, ChatRoomRequestDto dto) {
        User requestedUser = userService.findById(dto.getUserId());

        Optional<ChatRoom> existingRoom = getExistingRoomByChatUserRepository(loginUser.getId(), requestedUser.getId(),dto.getRoomType());
        if (existingRoom.isPresent()) return existingRoom.get();

        //생성자는 첫번째에 추가
        return createRoomBase(List.of(loginUser, requestedUser), dto.getRoomName(), ChatRoomType.ONE_TO_ONE);
    }

    private ChatRoom createGroupRoom(User creator, ChatRoomRequestDto dto) {
        List<User> members = userService.findAllByIds(dto.getUserIds());
        List<User> allUsers = List.copyOf(members);

        // 방장은 생성자 기준으로 첫 번째에 추가
        allUsers.add(0, creator);

        return createRoomBase(allUsers, dto.getRoomName(), ChatRoomType.GROUP);
    }


    private ChatRoom createSupportRoom(User client, ChatRoomRequestDto dto) {
        List<User> managerList = userService.findByManagerList(client.getManagementDashboard());

        if (managerList.isEmpty()) {
            throw new BusinessLogicException(ExceptionCode.MANAGER_NOT_FOUND, "문의 가능한 매니저가 없습니다.");
        }


        // CreateRandomNumber의 randomFromList 메서드를 사용하여 랜덤 매니저 선택
        User supportAgent = CreateRandomNumber.randomFromList(managerList);

        Optional<ChatRoom> existingRoom = getExistingRoomByChatUserRepository(client.getId(), supportAgent.getId(),dto.getRoomType());
        if (existingRoom.isPresent()) {
            return existingRoom.get();  // 이미 존재하는 채팅방 반환
        }

        return createRoomBase(List.of(client, supportAgent), supportAgent.getName() + "_support_"+CreateRandomNumber.timeBasedRandomName(), ChatRoomType.SUPPORT);
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

    private void createChatUsers(ChatRoom chatRoom, List<User> users, ChatStatus creatorStatus) {
        for (int i = 0; i < users.size(); i++) {
            boolean isCreator = (i == 0);
            ChatStatus status = isCreator ? creatorStatus : ChatStatus.INVITED;

            ChatUser chatUser = ChatUser.builder()
                    .user(users.get(i))
                    .chatRoom(chatRoom)
                    .chatStatus(status)
                    .isCreator(isCreator)
                    .build();
            chatUserRepository.save(chatUser);
        }
    }


    //유저의 채팅방 조회하기
    //type에 따라서 다른 채팅방을 조회할 수 있도록.
    public Page<ChatRoom> getChatRoomList(ChatRoomType chatRoomType, Pageable pageable) {
        User user = userService.findUserByToken();

        Page<ChatUser> chatUsers = chatUserRepository
                .findByUserAndChatRoomRoomTypeAndChatStatusIn(
                        user,
                        chatRoomType,
                        List.of(ChatStatus.ENTER, ChatStatus.CREATE),
                        pageable
                );

        return chatUsers.map(ChatUser::getChatRoom);
    }

    public void leaveChatRoom( Long roomId) {
        User user = userService.findById(tokenService.getIdFromToken());
        ChatRoom chatRoom = findId(roomId);
        ChatUser chatUser = chatUserRepository.findByUserAndChatRoom(user,chatRoom)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.NOT_ENTER_CHAT_ROOM));

        chatUserRepository.delete(chatUser);

        if (chatUserRepository.findByChatRoom(chatRoom).isEmpty()) {
            chatMessageRepository.deleteAllByChatRoom(chatRoom);
            deleteChatRoomById(chatRoom.getId());
        }

    }

    public Page<ChatRoom> validEnter(ChatRoomType chatRoomType, Pageable pageable) {
        User user = userService.findUserByToken();

        Page<ChatUser> chatUsers = chatUserRepository
                .findByUserAndChatRoomRoomTypeAndChatStatusIn(
                        user,
                        chatRoomType,
                        List.of(ChatStatus.ENTER, ChatStatus.CREATE),
                        pageable
                );

        return chatUsers.map(ChatUser::getChatRoom);
    }



    //1:1 채팅방이 존재하는지 확인
    public Optional<ChatRoom> getExistingRoomByChatUserRepository(Long userId1, Long userId2, ChatRoomType roomType) {
        User user1 = userService.findById(userId1);
        User user2 = userService.findById(userId2);

        List<ChatStatus> activeStatuses = List.of(ChatStatus.ENTER, ChatStatus.CREATE,ChatStatus.INVITED);

        List<ChatUser> user1Rooms = chatUserRepository.findByUserAndChatRoomRoomTypeAndChatStatusIn(
                user1, roomType, activeStatuses, Pageable.unpaged()).getContent();

        List<ChatUser> user2Rooms = chatUserRepository.findByUserAndChatRoomRoomTypeAndChatStatusIn(
                user2, roomType, activeStatuses, Pageable.unpaged()).getContent();

        Set<Long> user1RoomIds = user1Rooms.stream()
                .map(cu -> cu.getChatRoom().getId())
                .collect(Collectors.toSet());

        return user2Rooms.stream()
                .map(ChatUser::getChatRoom)
                .filter(cr -> user1RoomIds.contains(cr.getId()))
                .findFirst(); // 1:1이라면 하나만 있으면 되므로
    }


    public ChatRoom findChatRoomById(Long id){
        return chatRoomRepository.findById(id)
                .orElseThrow(()-> new BusinessLogicException(ExceptionCode.CHAT_ROOM_FOUND));
    }



    public boolean chatRoomEnterValid(Long roomId) {
        User user = userService.findUserByToken();
        ChatRoom chatRoom = findChatRoomById(roomId);

        ChatUser chatUsers = chatUserRepository.findByUserAndChatRoom(user, chatRoom)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CHAT_ROOM_FOUND));

        return ChatStatus.ENTER.equals(chatUsers.getChatStatus());
    }

    public boolean validExistChatRoom(Long targetId,ChatRoomType chatRoomType){
        Optional<ChatRoom> existingRoom = getExistingRoomByChatUserRepository(tokenService.getIdFromToken(),
                targetId
                ,chatRoomType);
       return existingRoom.isPresent();
    }



    public void deleteChatRoomById(Long id){
        chatRoomRepository.deleteById(id);
    }

    public List<User> getChatRoomParticipants(Long roomId) {
        ChatRoom chatRoom = findId(roomId); // chatRoomId로 엔티티 조회

        // ENTER 상태의 사용자만 필터링
        return chatUserRepository.findByChatRoom(chatRoom).stream()
                .filter(chatUser -> chatUser.getChatStatus() == ChatStatus.ENTER)
                .map(ChatUser::getUser)
                .toList();
    }


    public ChatRoom findId(Long roomId){
        return chatRoomRepository.findById(roomId)
                .orElseThrow(()->new BusinessLogicException(ExceptionCode.CHAT_ROOM_FOUND));
    }

}
